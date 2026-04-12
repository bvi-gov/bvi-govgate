import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES, mapService, mapKeysToSnakeCase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = supabase
      .from(TABLES.SERVICES)
      .select('*')
      .eq('status', 'active')
      .order('sort_order', { ascending: true });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching services:', error.message);
      return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
    }

    const services = (data || []).map(mapService);
    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Admin-only check for creating services
    const role = request.headers.get('x-officer-role');
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const dbRow = mapKeysToSnakeCase(body);
    const { data, error } = await supabase
      .from(TABLES.SERVICES)
      .insert(dbRow)
      .select()
      .single();

    if (error) {
      console.error('Error creating service:', error.message);
      return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
    }

    return NextResponse.json(mapService(data), { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
