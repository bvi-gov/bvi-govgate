import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/audit';

/**
 * Audit Logs API
 * 
 * Returns in-memory audit logs. Admin only access.
 * This will be upgraded to database-backed storage in a future iteration.
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin role from headers set by middleware
    const officerRole = request.headers.get('x-officer-role');
    if (officerRole !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const actor = searchParams.get('actor') || '';
    const action = searchParams.get('action') || '';
    const entity = searchParams.get('entity') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const { logs, total } = await getAuditLogs({
      actor: actor || undefined,
      action: action || undefined,
      entity: entity || undefined,
      limit,
      offset: (page - 1) * limit,
    });

    return NextResponse.json({ logs, total, page, limit });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
