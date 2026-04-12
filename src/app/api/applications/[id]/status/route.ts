import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';
import { canApproveApplication } from '@/lib/permissions';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, reviewedBy, reviewerNotes } = body;

    // RBAC: Check if officer can change status
    const officerRole = request.headers.get('x-officer-role') || '';
    const officerDepartment = request.headers.get('x-officer-department') || '';

    if (!canApproveApplication(officerRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only administrators and senior officers can change application status.' },
        { status: 403 }
      );
    }

    // Check application exists
    const { data: existing, error: fetchError } = await supabase
      .from(TABLES.APPLICATIONS)
      .select('*')
      .eq('id', id)
      .limit(1);

    if (fetchError || !existing?.[0]) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // RBAC: Non-admin officers can only change apps in their department
    if (officerRole !== 'admin' && officerDepartment) {
      // Check the service's department
      const { data: serviceData } = await supabase
        .from(TABLES.SERVICES)
        .select('department')
        .eq('id', existing[0].service_id)
        .limit(1);

      if (!serviceData?.[0] || serviceData[0].department !== officerDepartment) {
        return NextResponse.json(
          { error: 'Insufficient permissions. You can only modify applications in your department.' },
          { status: 403 }
        );
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      status,
      reviewed_by: reviewedBy || 'system',
      reviewed_at: new Date().toISOString(),
      reviewer_notes: reviewerNotes || null,
    };
    if (status === 'rejected' && body.rejectionReason) {
      updateData.rejection_reason = body.rejectionReason;
    }

    const { data: updated, error: updateError } = await supabase
      .from(TABLES.APPLICATIONS)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating application status:', updateError.message);
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }

    // Create timeline entry
    await supabase.from(TABLES.TIMELINE).insert({
      application_id: id,
      status,
      note: reviewerNotes || `Status updated to ${status}`,
      actor: reviewedBy || 'system',
    });

    return NextResponse.json({
      id: updated.id,
      service_id: updated.service_id,
      tracking_number: updated.tracking_number,
      applicant_name: updated.applicant_name,
      applicant_email: updated.applicant_email,
      applicant_phone: updated.applicant_phone,
      form_data: updated.form_data,
      status: updated.status,
      payment_status: updated.payment_status,
      payment_amount: updated.payment_amount,
      payment_method: updated.payment_method,
      payment_ref: updated.payment_ref,
      paid_at: updated.paid_at,
      reviewed_by: updated.reviewed_by,
      reviewed_at: updated.reviewed_at,
      reviewer_notes: updated.reviewer_notes,
      issued_at: updated.issued_at,
      certificate_url: updated.certificate_url,
      certificate_number: updated.certificate_number,
      rejection_reason: updated.rejection_reason,
      ip_address: updated.ip_address,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
