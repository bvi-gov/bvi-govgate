import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';

const BCRYPT_ROUNDS = 12;

/**
 * Hash a password using bcrypt.
 * This is the new preferred method for password hashing.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify a password against a hash.
 * Supports both bcrypt hashes (new) and SHA-256 hashes (legacy).
 * Tries bcrypt first; if the hash doesn't look like a bcrypt hash,
 * falls back to SHA-256 comparison.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // bcrypt hashes are always 60 characters long and start with $2
  if (hash.length === 60 && hash.startsWith('$2')) {
    return bcrypt.compare(password, hash);
  }

  // Legacy SHA-256 fallback
  return legacyVerifyPassword(password, hash);
}

/**
 * Legacy SHA-256 password hashing (for backward compatibility).
 * Used during migration to verify old passwords.
 */
export function legacyHashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

/**
 * Legacy SHA-256 password verification.
 */
export function legacyVerifyPassword(password: string, hash: string): boolean {
  return legacyHashPassword(password) === hash;
}

/**
 * Check if a hash is a legacy SHA-256 hash (needs rehashing).
 */
export function needsRehash(hash: string): boolean {
  // If it's not a bcrypt hash, it needs rehashing
  return !(hash.length === 60 && hash.startsWith('$2'));
}
