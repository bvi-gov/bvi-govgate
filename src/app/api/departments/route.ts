import { NextResponse } from 'next/server';

/**
 * Departments API - Module Under Development
 * 
 * This endpoint is currently returning a 501 status as the Department
 * model has not yet been implemented in the database schema.
 * Department data is currently derived from Officer.department and GovService.department fields.
 */
export async function GET() {
  return NextResponse.json(
    {
      error: 'This module is under development',
      message: 'The Departments module is not yet available. Department data is currently managed through Officer and GovService records.',
      status: 501,
    },
    { status: 501 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      error: 'This module is under development',
      message: 'Cannot create departments. This feature is not yet implemented.',
      status: 501,
    },
    { status: 501 }
  );
}
