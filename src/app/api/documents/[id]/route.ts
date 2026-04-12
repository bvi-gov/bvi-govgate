import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES, mapDocument, mapKeysToSnakeCase } from '@/lib/supabase';

async function enrichDocument(doc: Record<string, unknown>) {
  const mapped = mapDocument(doc);

  if (mapped.applicationId) {
    const { data: appData } = await supabase
      .from(TABLES.APPLICATIONS)
      .select('id, tracking_number, applicant_name')
      .eq('id', mapped.applicationId)
      .limit(1);

    if (appData?.[0]) {
      (mapped as Record<string, unknown>).application = {
        id: appData[0].id,
        trackingNumber: appData[0].tracking_number,
        applicantName: appData[0].applicant_name,
      };
    }
  }

  return mapped;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from(TABLES.DOCUMENTS)
      .select('*')
      .eq('id', id)
      .limit(1);

    if (error) {
      console.error('Error fetching document:', error.message);
      return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const document = await enrichDocument(data[0]);
    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.fileName !== undefined) updateData.file_name = body.fileName;
    if (body.fileType !== undefined) updateData.file_type = body.fileType;
    if (body.filePath !== undefined) updateData.file_url = body.filePath;
    if (body.fileSize !== undefined) updateData.file_size = body.fileSize;
    if (body.documentType !== undefined) updateData.document_type = body.documentType;

    const { data, error } = await supabase
      .from(TABLES.DOCUMENTS)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating document:', error.message);
      return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
    }

    return NextResponse.json(mapDocument(data));
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabase
      .from(TABLES.DOCUMENTS)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting document:', error.message);
      return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
