/**
 * Simple in-memory rate limiter for API endpoints.
 * Uses a sliding window approach per IP address.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetTime <= now) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /** Number of requests allowed in the window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of requests remaining in the current window */
  remaining: number;
  /** Time when the rate limit window resets (Unix timestamp in ms) */
  resetTime: number;
  /** Seconds until the rate limit resets (only set when rate limited) */
  retryAfter?: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
};

const LOGIN_CONFIG: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
};

const PDF_DOWNLOAD_CONFIG: RateLimitConfig = {
  maxRequests: 30,
  windowMs: 60 * 1000, // 1 minute
};

const APPLICATION_SUBMIT_CONFIG: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
};

/**
 * Check if a request from a given IP should be rate limited.
 * @param ip - The client IP address
 * @param config - Rate limit configuration (uses default if not provided)
 * @returns Rate limit check result
 */
export function checkRateLimit(ip: string, config?: RateLimitConfig): RateLimitResult {
  const cfg = config || DEFAULT_CONFIG;
  const now = Date.now();
  const key = `${ip}:${cfg.maxRequests}:${cfg.windowMs}`;

  const entry = rateLimitMap.get(key);

  if (!entry || entry.resetTime <= now) {
    // Start a new window
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + cfg.windowMs,
    };
    rateLimitMap.set(key, newEntry);

    return {
      allowed: true,
      remaining: cfg.maxRequests - 1,
      resetTime: newEntry.resetTime,
    };
  }

  if (entry.count >= cfg.maxRequests) {
    // Rate limited
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }

  // Increment count
  entry.count++;

  return {
    allowed: true,
    remaining: cfg.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get the rate limit config for a specific API path pattern.
 */
export function getRateLimitConfigForPath(pathname: string): RateLimitConfig | null {
  // Login endpoint - stricter rate limit
  if (pathname === '/api/officers' || pathname === '/api/officers/') {
    return LOGIN_CONFIG;
  }

  // Certificate PDF download
  if (/^\/api\/certificates\/[^/]+\/pdf/.test(pathname)) {
    return PDF_DOWNLOAD_CONFIG;
  }

  // Application submission
  if (pathname === '/api/applications' || pathname === '/api/applications/') {
    return APPLICATION_SUBMIT_CONFIG;
  }

  return DEFAULT_CONFIG;
}

export {
  DEFAULT_CONFIG,
  LOGIN_CONFIG,
  PDF_DOWNLOAD_CONFIG,
  APPLICATION_SUBMIT_CONFIG,
};
