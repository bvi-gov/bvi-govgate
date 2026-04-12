import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES, mapApplication, mapService, mapTimeline, mapPayment } from '@/lib/supabase';

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
    .order('created_at', { ascending: true });
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  try {
    const { trackingNumber } = await params;
    const { data, error } = await supabase
      .from(TABLES.APPLICATIONS)
      .select('*')
      .eq('tracking_number', trackingNumber)
      .limit(1);

    if (error) {
      console.error('Error tracking application:', error.message);
      return NextResponse.json({ error: 'Failed to track application' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const application = await enrichApplication(data[0]);
    return NextResponse.json(application);
  } catch (error) {
    console.error('Error tracking application:', error);
    return NextResponse.json({ error: 'Failed to track application' }, { status: 500 });
  }
}
