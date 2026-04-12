import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch parcel
    const { data: parcel, error: parcelError } = await supabase
      .from('land_parcels')
      .select('*')
      .eq('id', id)
      .single();

    if (parcelError || !parcel) {
      return NextResponse.json({ error: 'Parcel not found' }, { status: 404 });
    }

    // Fetch ownership history
    const { data: ownerships } = await supabase
      .from('land_ownerships')
      .select('*')
      .eq('parcel_id', id)
      .order('acquired_date', { ascending: false });

    // Fetch liens
    const { data: liens } = await supabase
      .from('land_liens')
      .select('*')
      .eq('parcel_id', id)
      .order('filed_date', { ascending: false });

    return NextResponse.json({
      ...parcel,
      ownerships: ownerships || [],
      liens: liens || [],
    });
  } catch (error) {
    console.error('Error fetching parcel details:', error);
    return NextResponse.json({ error: 'Failed to fetch parcel details' }, { status: 500 });
  }
}
