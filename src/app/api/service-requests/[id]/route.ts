import { NextRequest, NextResponse } from 'next/server';

/**
 * Service Requests [id] API - Module Under Development
 * 
 * This endpoint is currently returning a 501 status as the ServiceRequest
 * model has not yet been implemented in the database schema.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return NextResponse.json(
    {
      error: 'This module is under development',
      message: `Cannot retrieve service request '${id}'. Use /api/applications instead.`,
      status: 501,
    },
    { status: 501 }
  );
}

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return NextResponse.json(
    {
      error: 'This module is under development',
      message: `Cannot update service request '${id}'. Use /api/applications instead.`,
      status: 501,
    },
    { status: 501 }
  );
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return NextResponse.json(
    {
      error: 'This module is under development',
      message: `Cannot delete service request '${id}'. This feature is not yet implemented.`,
      status: 501,
    },
    { status: 501 }
  );
}
