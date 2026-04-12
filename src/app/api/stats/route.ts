import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';

async function countApps(filters: Record<string, unknown> = {}): Promise<number> {
  let query = supabase.from(TABLES.APPLICATIONS).select('*', { count: 'exact', head: true });
  if (filters.status) {
    if (Array.isArray(filters.status)) {
      query = query.in('status', filters.status as string[]);
    } else {
      query = query.eq('status', filters.status as string);
    }
  }
  if (filters.serviceId) {
    if (Array.isArray(filters.serviceId)) {
      query = query.in('service_id', filters.serviceId as string[]);
    } else {
      query = query.eq('service_id', filters.serviceId as string);
    }
  }
  const { count, error } = await query;
  if (error) return 0;
  return count || 0;
}

async function sumPayments(filters: Record<string, unknown> = {}): Promise<number> {
  let query = supabase
    .from(TABLES.PAYMENTS)
    .select('amount')
    .eq('status', 'completed');

  if (filters.applicationId) {
    if (Array.isArray(filters.applicationId)) {
      query = query.in('application_id', filters.applicationId as string[]);
    } else {
      query = query.eq('application_id', filters.applicationId as string);
    }
  }

  const { data, error } = await query;
  if (error) return 0;
  return (data || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
}

async function getRecentApplications(limit: number, serviceIds?: string[]) {
  let query = supabase
    .from(TABLES.APPLICATIONS)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (serviceIds && serviceIds.length > 0) {
    query = query.in('service_id', serviceIds);
  }

  const { data } = await query;

  if (!data) return [];

  // Fetch services for each
  const { data: services } = await supabase.from(TABLES.SERVICES).select('*');
  const serviceMap = new Map((services || []).map((s) => [s.id, s]));

  return data.map((app) => {
    const service = serviceMap.get(app.service_id);
    return {
      ...app,
      service: service || null,
    };
  });
}

async function getRevenueByService(appIds?: string[]): Promise<Record<string, number>> {
  const { data: completedPayments } = await supabase
    .from(TABLES.PAYMENTS)
    .select('application_id, amount')
    .eq('status', 'completed');

  if (!completedPayments || completedPayments.length === 0) return {};

  let filteredPayments = completedPayments;
  if (appIds && appIds.length > 0) {
    filteredPayments = completedPayments.filter(p => appIds.includes(p.application_id));
  }
  if (filteredPayments.length === 0) return {};

  // Get all applications to map to services
  const paymentAppIds = filteredPayments.map((p) => p.application_id);
  const { data: apps } = await supabase
    .from(TABLES.APPLICATIONS)
    .select('id, service_id')
    .in('id', paymentAppIds);

  if (!apps) return {};

  // Get all services
  const serviceIds = [...new Set(apps.map((a) => a.service_id))];
  const { data: svcs } = await supabase
    .from(TABLES.SERVICES)
    .select('id, name')
    .in('id', serviceIds);

  const serviceMap = new Map((svcs || []).map((s) => [s.id, s.name]));
  const appMap = new Map(apps.map((a) => [a.id, a.service_id]));

  const revenueByService: Record<string, number> = {};
  for (const p of filteredPayments) {
    const sId = appMap.get(p.application_id);
    const sName = sId ? serviceMap.get(sId) || 'Other' : 'Other';
    revenueByService[sName] = (revenueByService[sName] || 0) + (Number(p.amount) || 0);
  }

  return revenueByService;
}

export async function GET(request: NextRequest) {
  try {
    // RBAC: Read officer role and department from headers (set by middleware)
    const officerRole = request.headers.get('x-officer-role') || '';
    const officerDepartment = request.headers.get('x-officer-department') || '';

    let serviceIds: string[] | undefined;

    // Non-admin officers only see stats for their department
    if (officerRole !== 'admin' && officerDepartment) {
      const { data: deptServices } = await supabase
        .from(TABLES.SERVICES)
        .select('id')
        .eq('department', officerDepartment);

      serviceIds = deptServices?.map(s => s.id) || [];
    }

    // Build service filter for counts
    const serviceFilter = serviceIds && serviceIds.length > 0
      ? { serviceId: serviceIds }
      : undefined;

    // Get application IDs for revenue filtering
    let appIdsForRevenue: string[] | undefined;
    if (serviceIds && serviceIds.length > 0) {
      const { data: deptApps } = await supabase
        .from(TABLES.APPLICATIONS)
        .select('id')
        .in('service_id', serviceIds);
      appIdsForRevenue = deptApps?.map(a => a.id);
    }

    const [
      totalApplications,
      pendingCount,
      processingCount,
      approvedCount,
      rejectedCount,
      issuedCount,
      totalRevenue,
      totalServices,
      totalOfficers,
      recentApplications,
      revenueByService,
    ] = await Promise.all([
      countApps(serviceFilter),
      countApps({ ...serviceFilter, status: ['payment_pending', 'submitted'] }),
      countApps({ ...serviceFilter, status: 'processing' }),
      countApps({ ...serviceFilter, status: 'approved' }),
      countApps({ ...serviceFilter, status: 'rejected' }),
      countApps({ ...serviceFilter, status: 'issued' }),
      sumPayments(appIdsForRevenue ? { applicationId: appIdsForRevenue } : {}),
      (async () => {
        let query = supabase.from(TABLES.SERVICES).select('*', { count: 'exact', head: true }).eq('status', 'active');
        if (serviceIds && serviceIds.length > 0) {
          const { data: deptSvcs } = await supabase.from(TABLES.SERVICES).select('*', { count: 'exact', head: true }).eq('status', 'active').in('id', serviceIds);
          return deptSvcs?.length || 0;
        }
        const { count } = await query;
        return count || 0;
      })(),
      (async () => {
        const { count } = await supabase.from(TABLES.OFFICERS).select('*', { count: 'exact', head: true }).eq('status', 'active');
        return count || 0;
      })(),
      getRecentApplications(10, serviceIds),
      getRevenueByService(appIdsForRevenue),
    ]);

    const statusBreakdown = {
      payment_pending: pendingCount,
      submitted: 0,
      processing: processingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      issued: issuedCount,
    };

    return NextResponse.json({
      totalApplications,
      pendingCount,
      processingCount,
      approvedCount,
      rejectedCount,
      issuedCount,
      totalRevenue,
      totalServices,
      totalOfficers,
      recentApplications,
      revenueByService,
      statusBreakdown,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
