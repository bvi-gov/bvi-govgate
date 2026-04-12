import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { checkRateLimit, getRateLimitConfigForPath } from '@/lib/rate-limit';

/**
 * Routes that are publicly accessible without JWT authentication.
 * These are excluded from JWT verification checks.
 */
const PUBLIC_API_ROUTES = [
  '/api/seed',
  '/api/services',           // GET services catalog
  '/api/applications',       // POST submit application (public)
  '/api/applications/track', // GET track application by tracking number
];

/**
 * Check if a given pathname matches any of the public routes.
 */
function isPublicRoute(pathname: string, method: string): boolean {
  // /api/officers POST is login (public), GET requires auth
  if (pathname === '/api/officers' && method === 'POST') {
    return true;
  }

  // /api/services GET is public (catalog browsing)
  if (pathname === '/api/services' && method === 'GET') {
    return true;
  }

  // /api/applications POST is public (submit application)
  if (pathname === '/api/applications' && method === 'POST') {
    return true;
  }

  // /api/applications/track/* is public
  if (pathname.startsWith('/api/applications/track')) {
    return true;
  }

  // /api/certificates/*/pdf requires auth but is exempted from middleware
  // (handled by its own route with cookie-based auth)
  if (/^\/api\/certificates\/[^/]+\/pdf/.test(pathname)) {
    return true;
  }

  // /api/officers/logout (clears cookie, needs to work regardless)
  if (pathname === '/api/officers/logout') {
    return true;
  }

  // /api/seed
  if (pathname === '/api/seed') {
    return true;
  }

  // /api/debug/db (temporary diagnostic)
  if (pathname === '/api/debug/db') {
    return true;
  }

  return false;
}

/**
 * Add security headers to the response.
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Remove X-Powered-By
  response.headers.delete('x-powered-by');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // XSS Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }

  // Content Security Policy - appropriate for this app
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; ')
  );

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Only process API routes
  if (!pathname.startsWith('/api/')) {
    return addSecurityHeaders(NextResponse.next());
  }

  // === Rate Limiting ===
  const rateLimitConfig = getRateLimitConfigForPath(pathname);
  if (rateLimitConfig) {
    // Get client IP from headers (behind proxy/gateway)
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const rateLimitResult = checkRateLimit(clientIp, rateLimitConfig);

    // Add rate limit headers to all responses
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', String(rateLimitConfig.maxRequests));
    headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining));
    headers.set('X-RateLimit-Reset', String(Math.ceil(rateLimitResult.resetTime / 1000)));

    if (!rateLimitResult.allowed) {
      headers.set('Retry-After', String(rateLimitResult.retryAfter));
      return addSecurityHeaders(
        new NextResponse(
          JSON.stringify({
            error: 'Too many requests. Please try again later.',
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              ...Object.fromEntries(headers.entries()),
            },
          }
        )
      );
    }
  }

  // === JWT Authentication ===
  if (!isPublicRoute(pathname, method)) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return addSecurityHeaders(
        new NextResponse(
          JSON.stringify({ error: 'Authentication required' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return addSecurityHeaders(
        new NextResponse(
          JSON.stringify({ error: 'Invalid or expired token. Please log in again.' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );
    }

    // Attach decoded officer info to request headers for downstream handlers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-officer-id', payload.officerId);
    requestHeaders.set('x-officer-email', payload.email);
    requestHeaders.set('x-officer-name', payload.name);
    requestHeaders.set('x-officer-role', payload.role);
    requestHeaders.set('x-officer-department', payload.department);

    // Clone the request with new headers and continue
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    return addSecurityHeaders(response);
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
  ],
};
