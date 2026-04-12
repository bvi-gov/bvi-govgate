import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES, mapPayment, mapApplication, mapService } from '@/lib/supabase';

async function enrichPayment(pay: Record<string, unknown>) {
  const mapped = mapPayment(pay);

  // Fetch application with service
  const { data: appData } = await supabase
    .from(TABLES.APPLICATIONS)
    .select('*')
    .eq('id', mapped.applicationId)
    .limit(1);

  if (appData?.[0]) {
    const app = mapApplication(appData[0]);
    // Fetch service for the application
    const { data: serviceData } = await supabase
      .from(TABLES.SERVICES)
      .select('*')
      .eq('id', app.serviceId)
      .limit(1);
    (app as Record<string, unknown>).service = serviceData?.[0] ? mapService(serviceData[0]) : null;
    (mapped as Record<string, unknown>).application = app;
  }

  return mapped;
}

export async function GET(request: NextRequest) {
  try {
    // RBAC: department-level filtering for non-admin officers
    const role = request.headers.get('x-officer-role');
    const department = request.headers.get('x-officer-department');

    const { data, error } = await supabase
      .from(TABLES.PAYMENTS)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error.message);
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
    }

    // Enrich all payments first
    const allPayments = await Promise.all((data || []).map(enrichPayment));

    // If not admin, filter payments to only show applications from their department
    if (role !== 'admin' && department) {
      const filteredPayments = allPayments.filter((pay) => {
        const app = (pay as Record<string, unknown>).application as Record<string, unknown> | undefined;
        if (!app) return false;
        const service = app.service as Record<string, unknown> | undefined;
        if (!service) return false;
        return service.department === department;
      });
      return NextResponse.json(filteredPayments);
    }

    return NextResponse.json(allPayments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
