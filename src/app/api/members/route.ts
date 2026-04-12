import { NextResponse } from 'next/server';

/**
 * Members API - Module Under Development
 * 
 * This endpoint is currently returning a 501 status as the DepartmentMember
 * model has not yet been implemented in the database schema.
 * Member/officer data is managed through the Officer model.
 */
export async function GET() {
  return NextResponse.json(
    {
      error: 'This module is under development',
      message: 'The Members module is not yet available. Officer/member data is managed through the /api/officers endpoint.',
      status: 501,
    },
    { status: 501 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      error: 'This module is under development',
      message: 'Cannot create members. This feature is not yet implemented.',
      status: 501,
    },
    { status: 501 }
  );
}
