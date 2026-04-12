import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES, mapService } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { data, error } = await supabase
      .from(TABLES.SERVICES)
      .select('*')
      .eq('slug', slug)
      .limit(1);

    if (error) {
      console.error('Error fetching service:', error.message);
      return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json(mapService(data[0]));
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 });
  }
}
