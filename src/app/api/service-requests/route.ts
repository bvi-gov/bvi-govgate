import { NextResponse } from 'next/server';

/**
 * Service Requests API - Module Under Development
 * 
 * This endpoint is currently returning a 501 status as the ServiceRequest
 * model has not yet been implemented in the database schema.
 * Service requests are currently managed through the GovApplication model.
 * Use /api/applications instead for citizen service requests.
 */
export async function GET() {
  return NextResponse.json(
    {
      error: 'This module is under development',
      message: 'The Service Requests module is not yet available. Use /api/applications for managing citizen service requests.',
      status: 501,
    },
    { status: 501 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      error: 'This module is under development',
      message: 'Cannot create service requests. Use /api/applications to submit citizen applications.',
      status: 501,
    },
    { status: 501 }
  );
}
