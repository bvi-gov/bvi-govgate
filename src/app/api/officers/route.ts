import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';
import { verifyPassword, needsRehash, hashPassword } from '@/lib/hash';
import { generateToken, createSessionCookie, COOKIE_NAME } from '@/lib/auth';
import { logAction } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { verifyToken } = await import('@/lib/auth');
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: officers, error } = await supabase
      .from(TABLES.OFFICERS)
      .select('id, name, email, role, department, status, last_login, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching officers:', error.message);
      return NextResponse.json({ error: 'Failed to fetch officers' }, { status: 500 });
    }

    // Map snake_case DB columns to camelCase
    const mapped = (officers || []).map(o => ({
      id: o.id,
      name: o.name,
      email: o.email,
      role: o.role,
      department: o.department,
      status: o.status,
      lastLogin: o.last_login,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Error fetching officers:', error);
    return NextResponse.json({ error: 'Failed to fetch officers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find officer by email using Supabase REST API
    const { data: officers, error: fetchError } = await supabase
      .from(TABLES.OFFICERS)
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .limit(1);

    if (fetchError) {
      console.error('Error finding officer:', fetchError.message);
      return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }

    const officer = officers?.[0];
    if (!officer) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (officer.status !== 'active') {
      return NextResponse.json(
        { error: 'Account is inactive. Contact your administrator.' },
        { status: 401 }
      );
    }

    // Verify password against password_hash from DB
    const isValid = await verifyPassword(password, officer.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // If the password hash needs upgrading (from SHA-256 to bcrypt), rehash it
    if (needsRehash(officer.password_hash)) {
      const newHash = await hashPassword(password);
      await supabase
        .from(TABLES.OFFICERS)
        .update({ password_hash: newHash })
        .eq('id', officer.id);
    }

    // Update last login
    await supabase
      .from(TABLES.OFFICERS)
      .update({ last_login: new Date().toISOString() })
      .eq('id', officer.id);

    // Generate JWT
    const token = await generateToken({
      officerId: officer.id,
      email: officer.email,
      name: officer.name,
      role: officer.role as 'admin' | 'senior_officer' | 'officer',
      department: officer.department || '',
    });

    // Log the login action
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    logAction(officer.email, 'login', 'officer', officer.id, {
      officerName: officer.name,
      role: officer.role,
      department: officer.department,
    }, clientIp);

    // Create response with JWT as httpOnly cookie
    const response = NextResponse.json({
      id: officer.id,
      name: officer.name,
      email: officer.email,
      role: officer.role,
      department: officer.department,
    });

    response.headers.set('Set-Cookie', createSessionCookie(token));

    return response;
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
