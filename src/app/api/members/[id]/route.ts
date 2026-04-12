import { NextRequest, NextResponse } from 'next/server';

/**
 * Members [id] API - Module Under Development
 * 
 * This endpoint is currently returning a 501 status as the DepartmentMember
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
      message: `Cannot retrieve member '${id}'. The Members module is not yet implemented. Use /api/officers instead.`,
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
      message: `Cannot update member '${id}'. This feature is not yet implemented.`,
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
      message: `Cannot delete member '${id}'. This feature is not yet implemented.`,
      status: 501,
    },
    { status: 501 }
  );
}
