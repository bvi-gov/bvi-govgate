import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES, mapDocument, mapApplication, mapKeysToSnakeCase } from '@/lib/supabase';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId') || '';
    const search = searchParams.get('search') || '';

    let query = supabase
      .from(TABLES.DOCUMENTS)
      .select('*')
      .order('created_at', { ascending: false });

    if (applicationId) {
      query = query.eq('application_id', applicationId);
    }
    if (search) {
      query = query.or(`file_name.ilike.%${search}%,file_type.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching documents:', error.message);
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }

    const documents = await Promise.all((data || []).map(enrichDocument));
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dbRow: Record<string, unknown> = {
      application_id: body.applicationId || null,
      file_name: body.fileName,
      file_type: body.fileType,
      file_size: body.fileSize || 0,
      file_url: body.filePath || null,
      document_type: body.documentType || null,
      uploaded_by: body.uploadedBy || null,
    };

    const { data, error } = await supabase
      .from(TABLES.DOCUMENTS)
      .insert(dbRow)
      .select()
      .single();

    if (error) {
      console.error('Error creating document:', error.message);
      const message = error.message.includes('duplicate') || error.message.includes('unique')
        ? 'Document already exists'
        : 'Failed to create document';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json(mapDocument(data), { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating document:', error);
    const message = error instanceof Error && error.message.includes('Unique')
      ? 'Document already exists'
      : 'Failed to create document';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
