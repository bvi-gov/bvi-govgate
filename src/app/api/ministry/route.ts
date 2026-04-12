import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';

async function countWithServiceIds(serviceIds: string[], statusFilter?: string | string[]): Promise<number> {
  if (serviceIds.length === 0) return 0;
  let query = supabase
    .from(TABLES.APPLICATIONS)
    .select('*', { count: 'exact', head: true })
    .in('service_id', serviceIds);
  if (statusFilter) {
    if (Array.isArray(statusFilter)) {
      query = query.in('status', statusFilter);
    } else {
      query = query.eq('status', statusFilter);
    }
  }
  const { count } = await query;
  return count || 0;
}

async function sumPaymentsForServiceIds(serviceIds: string[]): Promise<number> {
  if (serviceIds.length === 0) return 0;

  // Get app IDs for these service IDs
  const { data: apps } = await supabase
    .from(TABLES.APPLICATIONS)
    .select('id')
    .in('service_id', serviceIds);

  if (!apps || apps.length === 0) return 0;

  const appIds = apps.map((a) => a.id);
  const { data: payments } = await supabase
    .from(TABLES.PAYMENTS)
    .select('amount')
    .eq('status', 'completed')
    .in('application_id', appIds);

  return (payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
}

export async function GET(request: NextRequest) {
  try {
    // RBAC: Read officer role and department from headers (set by middleware)
    const officerRole = request.headers.get('x-officer-role') || '';
    const officerDepartment = request.headers.get('x-officer-department') || '';

    // Get all distinct departments from services
    const { data: allServices, error: svcError } = await supabase
      .from(TABLES.SERVICES)
      .select('department, id');

    if (svcError) {
      console.error('Error fetching ministry list:', svcError.message);
      return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
    }

    // Group by department
    const deptMap = new Map<string, string[]>();
    for (const svc of (allServices || [])) {
      const dept = svc.department;
      if (!deptMap.has(dept)) deptMap.set(dept, []);
      deptMap.get(dept)!.push(svc.id);
    }

    let departments = Array.from(deptMap.entries());

    // Non-admin officers only see their own department
    if (officerRole !== 'admin' && officerDepartment) {
      departments = departments.filter(
        ([dept]) => dept.toLowerCase() === officerDepartment.toLowerCase()
      );
    }

    const departmentList = await Promise.all(
      departments.map(async ([dept, serviceIds]) => {
        const [total, paymentPending, processing, approved, rejected, issued, revenue] = await Promise.all([
          countWithServiceIds(serviceIds),
          countWithServiceIds(serviceIds, ['payment_pending', 'submitted']),
          countWithServiceIds(serviceIds, 'processing'),
          countWithServiceIds(serviceIds, 'approved'),
          countWithServiceIds(serviceIds, 'rejected'),
          countWithServiceIds(serviceIds, 'issued'),
          sumPaymentsForServiceIds(serviceIds),
        ]);

        return {
          name: dept,
          totalApplications: total,
          paymentPending,
          processing,
          approved,
          rejected,
          issued,
          revenue,
        };
      })
    );

    return NextResponse.json({ departments: departmentList });
  } catch (error) {
    console.error('Error fetching ministry list:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}
