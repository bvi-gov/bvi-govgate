import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES, mapApplication } from '@/lib/supabase';
import { canIssueCertificate } from '@/lib/permissions';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reviewedBy, reviewerNotes } = body;

    // RBAC: Only admins can issue certificates
    const officerRole = request.headers.get('x-officer-role') || '';

    if (!canIssueCertificate(officerRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only administrators can issue certificates.' },
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

    const certificateNumber = `CERT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { data: updated, error: updateError } = await supabase
      .from(TABLES.APPLICATIONS)
      .update({
        status: 'issued',
        issued_at: new Date().toISOString(),
        certificate_number: certificateNumber,
        certificate_url: `/documents/${certificateNumber}.pdf`,
        reviewed_by: reviewedBy || 'system',
        reviewed_at: new Date().toISOString(),
        reviewer_notes: reviewerNotes || 'Document approved and issued',
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error issuing document:', updateError.message);
      return NextResponse.json({ error: 'Failed to issue document' }, { status: 500 });
    }

    // Create timeline entry
    await supabase.from(TABLES.TIMELINE).insert({
      application_id: id,
      status: 'issued',
      note: `Document issued. Certificate No: ${certificateNumber}`,
      actor: reviewedBy || 'system',
    });

    return NextResponse.json(mapApplication(updated));
  } catch (error) {
    console.error('Error issuing document:', error);
    return NextResponse.json({ error: 'Failed to issue document' }, { status: 500 });
  }
}
