import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const parcelId = searchParams.get('parcel_id') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('land_liens')
      .select('*, land_parcels(parcel_number, address)', { count: 'exact' })
      .order('filed_date', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) {
      query = query.eq('status', status);
    }
    if (parcelId) {
      query = query.eq('parcel_id', parcelId);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching liens:', error.message);
      return NextResponse.json({ error: 'Failed to fetch liens' }, { status: 500 });
    }

    return NextResponse.json({
      liens: data || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching liens:', error);
    return NextResponse.json({ error: 'Failed to fetch liens' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parcelId, lienType, creditorName, amount, filedDate } = body;

    if (!parcelId || !lienType || !creditorName) {
      return NextResponse.json({ error: 'Parcel ID, lien type, and creditor name are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('land_liens')
      .insert({
        parcel_id: parcelId,
        lien_type: lienType,
        creditor_name: creditorName,
        amount: amount || 0,
        filed_date: filedDate || null,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating lien:', error.message);
      return NextResponse.json({ error: 'Failed to create lien' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating lien:', error);
    return NextResponse.json({ error: 'Failed to create lien' }, { status: 500 });
  }
}
