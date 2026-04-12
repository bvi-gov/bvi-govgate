import { NextResponse } from 'next/server';
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

export async function GET() {
  try {
    const { data, error } = await supabase
      .from(TABLES.PAYMENTS)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error.message);
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
    }

    const payments = await Promise.all((data || []).map(enrichPayment));
    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
