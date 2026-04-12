import { NextRequest, NextResponse } from 'next/server';

/**
 * Departments [id] API - Module Under Development
 * 
 * This endpoint is currently returning a 501 status as the Department
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
      message: `Cannot retrieve department '${id}'. The Departments module is not yet implemented.`,
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
      message: `Cannot update department '${id}'. This feature is not yet implemented.`,
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
      message: `Cannot delete department '${id}'. This feature is not yet implemented.`,
      status: 501,
    },
    { status: 501 }
  );
}
