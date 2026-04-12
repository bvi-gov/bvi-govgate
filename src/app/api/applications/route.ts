import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES, mapApplication, mapService, mapTimeline, mapPayment, mapKeysToSnakeCase } from '@/lib/supabase';
import { canAccessMinistry } from '@/lib/permissions';

async function enrichApplication(app: Record<string, unknown>) {
  const mapped = mapApplication(app);

  // Fetch related service
  const { data: serviceData } = await supabase
    .from(TABLES.SERVICES)
    .select('*')
    .eq('id', mapped.serviceId)
    .limit(1);
  (mapped as Record<string, unknown>).service = serviceData?.[0] ? mapService(serviceData[0]) : null;

  // Fetch timeline entries
  const { data: timelineData } = await supabase
    .from(TABLES.TIMELINE)
    .select('*')
    .eq('application_id', mapped.id)
    .order('created_at', { ascending: false });
  (mapped as Record<string, unknown>).timeline = (timelineData || []).map(mapTimeline);

  // Fetch payment
  const { data: paymentData } = await supabase
    .from(TABLES.PAYMENTS)
    .select('*')
    .eq('application_id', mapped.id)
    .limit(1);
  (mapped as Record<string, unknown>).payment = paymentData?.[0] ? mapPayment(paymentData[0]) : null;

  return mapped;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const email = searchParams.get('email');
    const tracking = searchParams.get('tracking');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // RBAC: Read officer role and department from headers (set by middleware)
    const officerRole = request.headers.get('x-officer-role') || '';
    const officerDepartment = request.headers.get('x-officer-department') || '';

    let query = supabase
      .from(TABLES.APPLICATIONS)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) query = query.eq('status', status);
    if (email) query = query.eq('applicant_email', email);
    if (tracking) query = query.eq('tracking_number', tracking);

    // RBAC: Non-admin officers only see applications from their department
    if (officerRole !== 'admin' && officerDepartment) {
      // First fetch service IDs belonging to the officer's department
      const { data: deptServices } = await supabase
        .from(TABLES.SERVICES)
        .select('id')
        .eq('department', officerDepartment);

      if (deptServices && deptServices.length > 0) {
        const deptServiceIds = deptServices.map((s) => s.id);
        query = query.in('service_id', deptServiceIds);
      } else {
        // No services in this department — return empty
        return NextResponse.json({ applications: [], total: 0, page, limit });
      }
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching applications:', error.message);
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }

    // Enrich with relations
    const applications = await Promise.all(
      (data || []).map(enrichApplication)
    );

    return NextResponse.json({ applications, total: count || 0, page, limit });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceId, applicantName, applicantEmail, applicantPhone, formData, ipAddress } = body;

    // Generate tracking number: BVI-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const trackingNumber = `BVI-${dateStr}-${random}`;

    // Find service
    const { data: serviceRows, error: serviceError } = await supabase
      .from(TABLES.SERVICES)
      .select('*')
      .eq('id', serviceId)
      .limit(1);

    if (serviceError || !serviceRows?.[0]) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    const service = mapService(serviceRows[0]);

    const initialStatus = service.feeAmount > 0 ? 'payment_pending' : 'submitted';
    const initialPaymentStatus = service.feeAmount > 0 ? 'unpaid' : 'n/a';

    // Create application
    const { data: appData, error: appError } = await supabase
      .from(TABLES.APPLICATIONS)
      .insert({
        service_id: serviceId,
        tracking_number: trackingNumber,
        applicant_name: applicantName,
        applicant_email: applicantEmail,
        applicant_phone: applicantPhone,
        form_data: typeof formData === 'string' ? formData : JSON.stringify(formData),
        status: initialStatus,
        payment_status: initialPaymentStatus,
        payment_amount: service.feeAmount,
        ip_address: ipAddress || null,
      })
      .select()
      .single();

    if (appError) {
      console.error('Error creating application:', appError.message);
      return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
    }

    // Create timeline entry
    await supabase.from(TABLES.TIMELINE).insert({
      application_id: appData.id,
      status: initialStatus,
      note: 'Application created successfully',
      actor: 'system',
    });

    // Create payment record if fee > 0
    if (service.feeAmount > 0) {
      await supabase.from(TABLES.PAYMENTS).insert({
        application_id: appData.id,
        amount: service.feeAmount,
        method: 'pending',
        status: 'pending',
      });
    }

    const application = await enrichApplication(appData);
    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
  }
}
