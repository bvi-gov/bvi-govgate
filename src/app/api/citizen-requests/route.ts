import { NextResponse } from 'next/server';

/**
 * Citizen Requests API - Module Under Development
 * 
 * This endpoint is currently returning a 501 status as the CitizenRequest
 * model has not yet been implemented in the database schema.
 * Citizen requests are managed through the GovApplication model.
 * Use /api/applications instead for citizen service requests.
 */
export async function GET() {
  return NextResponse.json(
    {
      error: 'This module is under development',
      message: 'The Citizen Requests module is not yet available. Use /api/applications for managing citizen requests.',
      status: 501,
    },
    { status: 501 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      error: 'This module is under development',
      message: 'Cannot create citizen requests. Use /api/applications to submit citizen applications.',
      status: 501,
    },
    { status: 501 }
  );
}
