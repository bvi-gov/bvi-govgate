/**
 * Supabase-backed audit logging system.
 * Persists all audit log entries to the `audit_logs` table in Supabase,
 * with a small in-memory fallback for resilience during transient outages.
 */

import { supabase } from '@/lib/supabase';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
}

/**
 * Generate a simple unique ID for audit log entries.
 */
function generateId(): string {
  return `audit-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Log an action to the audit log (Supabase-backed).
 *
 * @param actor   - Who performed the action (officer name/email or 'system')
 * @param action  - The action type ('login', 'update_application', …)
 * @param entity  - The entity type ('officer', 'application', 'certificate', …)
 * @param entityId - The ID of the entity (optional)
 * @param details - Additional details about the action (optional)
 * @param ipAddress - The IP address of the actor (optional)
 * @returns The created AuditLogEntry
 */
export async function logAction(
  actor: string,
  action: string,
  entity: string,
  entityId: string | null = null,
  details: Record<string, unknown> | null = null,
  ipAddress: string | null = null
): Promise<AuditLogEntry> {
  const entry: AuditLogEntry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    actor,
    action,
    entity,
    entityId,
    details,
    ipAddress,
  };

  try {
    const { error } = await supabase.from('audit_logs').insert({
      id: entry.id,
      timestamp: entry.timestamp,
      actor: entry.actor,
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entityId,
      details: entry.details ? JSON.stringify(entry.details) : null,
      ip_address: entry.ipAddress,
    });

    if (error) {
      console.error('Failed to write audit log to Supabase:', error.message);
    }
  } catch (err) {
    console.error('Audit log write error:', err);
  }

  return entry;
}

/**
 * Get audit log entries with optional filtering (Supabase-backed).
 */
export async function getAuditLogs(filters?: {
  actor?: string;
  action?: string;
  entity?: string;
  limit?: number;
  offset?: number;
}): Promise<{ logs: AuditLogEntry[]; total: number }> {
  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;

  try {
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false });

    if (filters?.actor) {
      query = query.ilike('actor', `%${filters.actor}%`);
    }
    if (filters?.action) {
      query = query.eq('action', filters.action);
    }
    if (filters?.entity) {
      query = query.eq('entity', filters.entity);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('Failed to fetch audit logs:', error.message);
      return { logs: [], total: 0 };
    }

    const logs: AuditLogEntry[] = (data || []).map((row: Record<string, unknown>) => {
      let details: Record<string, unknown> | null = null;
      if (row.details) {
        try {
          details = typeof row.details === 'string'
            ? JSON.parse(row.details)
            : (row.details as Record<string, unknown>);
        } catch {
          details = null;
        }
      }
      return {
        id: row.id as string,
        timestamp: row.timestamp as string,
        actor: row.actor as string,
        action: row.action as string,
        entity: row.entity as string,
        entityId: row.entity_id as string | null,
        details,
        ipAddress: row.ip_address as string | null,
      };
    });

    return { logs, total: count || 0 };
  } catch (err) {
    console.error('Audit log fetch error:', err);
    return { logs: [], total: 0 };
  }
}

/**
 * Clear all audit logs. Use with caution.
 */
export async function clearAuditLogs(): Promise<void> {
  try {
    const { error } = await supabase.from('audit_logs').delete().neq('id', 'impossible-id');
    if (error) {
      console.error('Failed to clear audit logs:', error.message);
    }
  } catch (err) {
    console.error('Audit log clear error:', err);
  }
}
