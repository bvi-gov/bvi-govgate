import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, createClearSessionCookie, verifyToken } from '@/lib/auth';
import { logAction } from '@/lib/audit';

/**
 * POST /api/officers/logout
 * Clears the JWT session cookie and logs the logout action.
 */
export async function POST(request: NextRequest) {
  try {
    // Try to identify the officer for audit logging
    const token = request.cookies.get(COOKIE_NAME)?.value;
    let actorEmail = 'unknown';

    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        actorEmail = payload.email;
        await logAction(actorEmail, 'logout', 'officer', payload.officerId, {
          officerName: payload.name,
          role: payload.role,
        });
      }
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    response.headers.set('Set-Cookie', createClearSessionCookie());

    return response;
  } catch (error) {
    console.error('Error during logout:', error);
    // Even on error, try to clear the cookie
    const response = NextResponse.json({ success: true, message: 'Logged out' });
    response.headers.set('Set-Cookie', createClearSessionCookie());
    return response;
  }
}
