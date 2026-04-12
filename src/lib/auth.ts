import { SignJWT, jwtVerify } from 'jose';

// Use a consistent secret - in production this should come from env
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'bvi-govgate-jwt-secret-key-2025-secure'
);

export interface JWTPayload {
  officerId: string;
  email: string;
  name: string;
  role: 'admin' | 'senior_officer' | 'officer';
  department: string;
}

const COOKIE_NAME = 'govgate_session';

/**
 * Token expiry durations based on role
 */
function getTokenExpiry(role: string): string {
  if (role === 'admin') return '24h';
  return '8h';
}

/**
 * Generate a JWT token for an officer
 */
export async function generateToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('bvi-govgate')
    .setAudience('bvi-govgate-api')
    .setExpirationTime(getTokenExpiry(payload.role))
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify a JWT token and return the payload
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'bvi-govgate',
      audience: 'bvi-govgate-api',
    });

    return {
      officerId: payload.officerId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as 'admin' | 'senior_officer' | 'officer',
      department: payload.department as string,
    };
  } catch {
    return null;
  }
}

/**
 * Create the httpOnly cookie options for JWT
 */
export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours max (token itself may expire sooner)
  };
}

/**
 * Create the cookie header string for setting the JWT cookie
 */
export function createSessionCookie(token: string): string {
  const options = getSessionCookieOptions();
  const parts = [
    `${COOKIE_NAME}=${token}`,
    `Path=${options.path}`,
    `HttpOnly`,
    `SameSite=${options.sameSite || 'Lax'}`,
  ];
  if (options.secure) parts.push('Secure');
  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);

  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${options.maxAge}`;
}

/**
 * Create a cookie string to clear the session cookie
 */
export function createClearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export { COOKIE_NAME };
