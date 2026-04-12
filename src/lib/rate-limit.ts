/**
 * Rate limiter backed by Supabase with in-memory cache fallback.
 * Uses a sliding-window approach per IP address.
 *
 * Flow:
 *  1. Check local in-memory cache first (fast path).
 *  2. On cache miss, try Supabase.
 *  3. If Supabase is unreachable, fall back to pure in-memory.
 */

import { supabase } from '@/lib/supabase';

// ─── In-memory fallback ────────────────────────────────────────────
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

// ─── Types ─────────────────────────────────────────────────────────

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

// ─── Config presets ────────────────────────────────────────────────

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

export {
  DEFAULT_CONFIG,
  LOGIN_CONFIG,
  PDF_DOWNLOAD_CONFIG,
  APPLICATION_SUBMIT_CONFIG,
};

// ─── Core check function ───────────────────────────────────────────

/**
 * Check if a request from a given IP should be rate limited.
 * Tries Supabase first, falls back to in-memory on error.
 */
export async function checkRateLimit(
  ip: string,
  config?: RateLimitConfig
): Promise<RateLimitResult> {
  const cfg = config || DEFAULT_CONFIG;
  const now = Date.now();
  const key = `${ip}:${cfg.maxRequests}:${cfg.windowMs}`;

  // --- Fast path: check local cache ---
  const cached = rateLimitMap.get(key);
  if (cached && cached.resetTime > now) {
    if (cached.count >= cfg.maxRequests) {
      const retryAfter = Math.ceil((cached.resetTime - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetTime: cached.resetTime,
        retryAfter,
      };
    }
    cached.count++;
    const remaining = Math.max(0, cfg.maxRequests - cached.count);
    return { allowed: true, remaining, resetTime: cached.resetTime };
  }

  // --- Slow path: try Supabase ---
  try {
    const resetTime = now + cfg.windowMs;
    const resetTs = new Date(resetTime).toISOString();

    // Upsert: increment count if a row exists for this key+window
    const { data, error } = await supabase.rpc('increment_rate_limit', {
      p_key: key,
      p_ip: ip,
      p_window_end: resetTs,
      p_max_requests: cfg.maxRequests,
    });

    if (!error && data) {
      const count = typeof data === 'number' ? data : Number(data) || 1;
      const allowed = count <= cfg.maxRequests;
      const remaining = Math.max(0, cfg.maxRequests - count);

      // Sync local cache
      rateLimitMap.set(key, { count, resetTime });

      if (!allowed) {
        const retryAfter = Math.ceil((resetTime - now) / 1000);
        return { allowed: false, remaining: 0, resetTime, retryAfter };
      }

      return { allowed: true, remaining, resetTime };
    }
  } catch (err) {
    console.warn('Rate limit Supabase call failed, using in-memory fallback:', err);
  }

  // --- Fallback: pure in-memory ---
  if (cached && cached.resetTime <= now) {
    // Window expired – restart
    const resetTime = now + cfg.windowMs;
    rateLimitMap.set(key, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: cfg.maxRequests - 1,
      resetTime,
    };
  }

  const resetTime = now + cfg.windowMs;
  rateLimitMap.set(key, { count: 1, resetTime });
  return {
    allowed: true,
    remaining: cfg.maxRequests - 1,
    resetTime,
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

  // Public certificate download by tracking number
  if (/^\/api\/applications\/track\/[^/]+\/certificate/.test(pathname)) {
    return PDF_DOWNLOAD_CONFIG;
  }

  // Application submission
  if (pathname === '/api/applications' || pathname === '/api/applications/') {
    return APPLICATION_SUBMIT_CONFIG;
  }

  return DEFAULT_CONFIG;
}
