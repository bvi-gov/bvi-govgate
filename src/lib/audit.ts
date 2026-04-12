/**
 * Simple in-memory audit logging system.
 * Will be connected to a database model in a future iteration.
 */

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

// In-memory storage for audit logs
// Limited to the last 1000 entries to prevent memory overflow
const MAX_LOG_ENTRIES = 1000;
const auditLogs: AuditLogEntry[] = [];

/**
 * Generate a simple unique ID for audit log entries
 */
function generateId(): string {
  return `audit-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Log an action to the audit log.
 * @param actor - Who performed the action (officer name or email, or 'system')
 * @param action - The action type (e.g., 'login', 'update_application', 'generate_certificate')
 * @param entity - The entity type (e.g., 'officer', 'application', 'certificate')
 * @param entityId - The ID of the entity (optional)
 * @param details - Additional details about the action (optional)
 * @param ipAddress - The IP address of the actor (optional)
 */
export function logAction(
  actor: string,
  action: string,
  entity: string,
  entityId: string | null = null,
  details: Record<string, unknown> | null = null,
  ipAddress: string | null = null
): AuditLogEntry {
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

  // Add to beginning of array (newest first)
  auditLogs.unshift(entry);

  // Trim to max size
  if (auditLogs.length > MAX_LOG_ENTRIES) {
    auditLogs.length = MAX_LOG_ENTRIES;
  }

  return entry;
}

/**
 * Get all audit log entries with optional filtering.
 * @param filters - Optional filters
 * @returns Filtered audit log entries
 */
export function getAuditLogs(filters?: {
  actor?: string;
  action?: string;
  entity?: string;
  limit?: number;
  offset?: number;
}): { logs: AuditLogEntry[]; total: number } {
  let filtered = [...auditLogs];

  if (filters?.actor) {
    filtered = filtered.filter((log) => log.actor.includes(filters.actor!));
  }
  if (filters?.action) {
    filtered = filtered.filter((log) => log.action === filters.action);
  }
  if (filters?.entity) {
    filtered = filtered.filter((log) => log.entity === filters.entity);
  }

  const total = filtered.length;
  const offset = filters?.offset || 0;
  const limit = filters?.limit || 50;

  return {
    logs: filtered.slice(offset, offset + limit),
    total,
  };
}

/**
 * Clear all audit logs. Use with caution.
 */
export function clearAuditLogs(): void {
  auditLogs.length = 0;
}
