import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://dtmnnxrdbhzdtqviirtk.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bW5ueHJkYmh6ZHRxdmlpcnRrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTYwNzg3NywiZXhwIjoyMDkxMTgzODc3fQ.6ECXKGX87trX7nNfl8GYVlvOQBhjXe7dyzsGsD9-52w';

const globalForSupabase = globalThis as unknown as {
  supabase: SupabaseClient | undefined
};

function createSupabaseClient(): SupabaseClient {
  if (globalForSupabase.supabase) {
    return globalForSupabase.supabase;
  }
  const client = createClient(supabaseUrl, supabaseServiceKey);
  globalForSupabase.supabase = client;
  return client;
}

export const supabase = createSupabaseClient();

/**
 * Table names matching the actual Supabase database
 */
export const TABLES = {
  OFFICERS: 'officers',
  SERVICES: 'gov_services',
  APPLICATIONS: 'gov_applications',
  PAYMENTS: 'payments',
  NOTIFICATIONS: 'notifications',
  DOCUMENTS: 'document_uploads',
  TIMELINE: 'application_timeline',
} as const;

/**
 * Convert a snake_case string to camelCase
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * Recursively convert all keys in an object from snake_case to camelCase
 */
function mapKeysToCamelCase<T = Record<string, unknown>>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = snakeToCamel(key);
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[camelKey] = mapKeysToCamelCase(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      result[camelKey] = value.map((item) =>
        item && typeof item === 'object' && !(item instanceof Date)
          ? mapKeysToCamelCase(item as Record<string, unknown>)
          : item
      );
    } else {
      result[camelKey] = value;
    }
  }
  return result as T;
}

export { mapKeysToCamelCase };

/**
 * Map a snake_case DB row to a camelCase service object (gov_services)
 */
export function mapService(row: Record<string, unknown>) {
  return mapKeysToCamelCase<{
    id: string;
    slug: string;
    name: string;
    description: string;
    category: string;
    department: string;
    processingDays: number;
    feeAmount: number;
    currency: string;
    requirements: string;
    formFields: string;
    status: string;
    icon: string;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
  }>(row);
}

/**
 * Map a snake_case DB row to a camelCase payment object (payments)
 */
export function mapPayment(row: Record<string, unknown>) {
  return mapKeysToCamelCase<{
    id: string;
    applicationId: string;
    amount: number;
    method: string;
    status: string;
    gatewayRef: string | null;
    receiptNumber: string | null;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
  }>(row);
}

/**
 * Map a snake_case DB row to a camelCase timeline entry (application_timeline)
 */
export function mapTimeline(row: Record<string, unknown>) {
  return mapKeysToCamelCase<{
    id: string;
    applicationId: string;
    status: string;
    note: string;
    actor: string;
    createdAt: string;
  }>(row);
}

/**
 * Map a snake_case DB row to a camelCase application object (gov_applications)
 */
export function mapApplication(row: Record<string, unknown>) {
  return mapKeysToCamelCase<{
    id: string;
    serviceId: string;
    trackingNumber: string;
    applicantName: string;
    applicantEmail: string;
    applicantPhone: string;
    formData: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string | null;
    paymentAmount: number;
    paymentRef: string | null;
    paidAt: string | null;
    reviewedBy: string | null;
    reviewedAt: string | null;
    reviewerNotes: string | null;
    issuedAt: string | null;
    certificateUrl: string | null;
    certificateNumber: string | null;
    rejectionReason: string | null;
    ipAddress: string | null;
    createdAt: string;
    updatedAt: string;
  }>(row);
}

/**
 * Map a snake_case DB row to a camelCase document object (document_uploads)
 */
export function mapDocument(row: Record<string, unknown>) {
  return mapKeysToCamelCase<{
    id: string;
    applicationId: string | null;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileUrl: string | null;
    documentType: string | null;
    uploadedBy: string | null;
    createdAt: string;
  }>(row);
}

/**
 * Convert camelCase object keys to snake_case for Supabase inserts/updates
 */
export function mapKeysToSnakeCase<T = Record<string, unknown>>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[snakeKey] = mapKeysToSnakeCase(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      result[snakeKey] = value.map((item) =>
        item && typeof item === 'object' && !(item instanceof Date)
          ? mapKeysToSnakeCase(item as Record<string, unknown>)
          : item
      );
    } else {
      result[snakeKey] = value;
    }
  }
  return result as T;
}

/**
 * Map a camelCase application insert object to snake_case for Supabase
 */
export function mapApplicationToDb(obj: Record<string, unknown>): Record<string, unknown> {
  return mapKeysToSnakeCase(obj);
}

/**
 * Map a camelCase service insert object to snake_case for Supabase
 */
export function mapServiceToDb(obj: Record<string, unknown>): Record<string, unknown> {
  return mapKeysToSnakeCase(obj);
}
