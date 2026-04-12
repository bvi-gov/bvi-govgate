import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';

function generateTrackingNumber() {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BVI-${dateStr}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    // RBAC: admin and senior_officer only
    const role = request.headers.get('x-officer-role');
    if (role !== 'admin' && role !== 'senior_officer') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { serviceSlug, data } = body;

    if (!serviceSlug || !data) {
      return NextResponse.json({ error: 'Missing serviceSlug or data' }, { status: 400 });
    }

    // Find the service
    const { data: serviceRows, error: serviceError } = await supabase
      .from(TABLES.SERVICES)
      .select('*')
      .eq('slug', serviceSlug)
      .limit(1);

    if (serviceError || !serviceRows?.[0]) {
      return NextResponse.json({ error: `Service "${serviceSlug}" not found` }, { status: 404 });
    }

    const service = serviceRows[0];

    // Build applicant name from data
    const applicantName = data.applicantName ||
      [data.surname, data.givenNames].filter(Boolean).join(' ') ||
      'Unknown Applicant';

    const applicantEmail = data.applicantEmail || '';
    const applicantPhone = data.applicantPhone || '';
    const trackingNumber = generateTrackingNumber();

    // Create the application
    const { data: application, error: appError } = await supabase
      .from(TABLES.APPLICATIONS)
      .insert({
        service_id: service.id,
        tracking_number: trackingNumber,
        applicant_name: applicantName,
        applicant_email: applicantEmail,
        applicant_phone: applicantPhone,
        form_data: JSON.stringify(data),
        status: 'submitted',
        payment_status: 'unpaid',
        payment_amount: service.fee_amount,
      })
      .select()
      .single();

    if (appError) {
      console.error('Bulk import error:', appError.message);
      return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
    }

    // Create timeline entry
    await supabase.from(TABLES.TIMELINE).insert({
      application_id: application.id,
      status: 'submitted',
      note: `Bulk import: Application created from data import (${serviceSlug})`,
      actor: 'bulk-import',
    });

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      trackingNumber: application.tracking_number,
      applicantName: application.applicant_name,
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
  }
}
