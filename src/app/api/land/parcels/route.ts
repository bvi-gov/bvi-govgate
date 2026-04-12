import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const district = searchParams.get('district') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('land_parcels')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) {
      query = query.or(`parcel_number.ilike.%${search}%,address.ilike.%${search}%,current_owner.ilike.%${search}%`);
    }
    if (district) {
      query = query.eq('district', district);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching parcels:', error.message);
      return NextResponse.json({ error: 'Failed to fetch parcels' }, { status: 500 });
    }

    return NextResponse.json({
      parcels: data || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching parcels:', error);
    return NextResponse.json({ error: 'Failed to fetch parcels' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parcelNumber, planNumber, address, district, areaSqft, landUseZone, currentOwner } = body;

    if (!parcelNumber || !address || !district) {
      return NextResponse.json({ error: 'Parcel number, address, and district are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('land_parcels')
      .insert({
        parcel_number: parcelNumber,
        plan_number: planNumber || null,
        address,
        district,
        area_sqft: areaSqft || null,
        land_use_zone: landUseZone || 'residential',
        status: 'registered',
        current_owner: currentOwner || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating parcel:', error.message);
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Parcel number already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to create parcel' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating parcel:', error);
    return NextResponse.json({ error: 'Failed to create parcel' }, { status: 500 });
  }
}
