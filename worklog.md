# BVI GovGate — Worklog

## FASE 2 (Continuation)

### Task 2a: Audit Logging — Supabase-backed ✅
- **Rewrote `/src/lib/audit.ts`**: Replaced in-memory array with Supabase-backed persistence
  - `logAction()` → now `async`, writes to `audit_logs` table via Supabase, returns `Promise<AuditLogEntry>`
  - `getAuditLogs()` → now `async`, queries Supabase with filtering, pagination, and `count: 'exact'`
  - `clearAuditLogs()` → now `async`, deletes all rows from `audit_logs`
  - All functions have try/catch with graceful error logging (degrades silently on DB failure)
- **Updated `/src/app/api/officers/route.ts`**: `await logAction(...)` on login
- **Updated `/src/app/api/officers/logout/route.ts`**: `await logAction(...)` on logout
- **Updated `/src/app/api/audit-logs/route.ts`**: `await getAuditLogs(...)` for filtering
- **Created `/supabase/audit-logs-migration.sql`**: Full DDL with table, indexes, RLS policies

### Task 2b: Rate Limiting — Supabase-backed ✅
- **Rewrote `/src/lib/rate-limit.ts`**: Hybrid approach with in-memory cache + Supabase persistence
  - `checkRateLimit()` → now `async`, uses `Promise<RateLimitResult>`
  - Fast path: checks local in-memory `rateLimitMap` (zero latency)
  - Slow path: calls `supabase.rpc('increment_rate_limit', ...)` for atomic increment
  - Fallback: pure in-memory if Supabase is unreachable
  - Added rate limit config for public certificate download endpoint
- **Updated `/src/middleware.ts`**: `await checkRateLimit(...)` in middleware
- **Created `/supabase/rate-limits-migration.sql`**: Table + `increment_rate_limit` PL/pgSQL function

### Task 2c: Dynamic Stats on Homepage ✅
- **Updated `/src/components/portal/home-view.tsx`**:
  - Added `StatsData` interface and `useState`/`useEffect` to fetch from `GET /api/stats`
  - Stats bar shows loading spinner while fetching
  - Displays real numbers from API: total applications, approval rate, digital services count, certificates issued
  - Falls back to hardcoded values if fetch fails
  - Added `formatNumber()` and `formatCurrency()` helpers
- **Made `/api/stats` public** in middleware (unauthenticated homepage access)

### Task 2d: Fix Download Button + Public Certificate Endpoint ✅
- **Created `/src/app/api/applications/track/[trackingNumber]/certificate/route.ts`**:
  - PUBLIC endpoint (no auth required)
  - Looks up application by tracking number in `gov_applications`
  - Returns 404 if not found or status !== 'issued'
  - Generates and serves PDF using the same logic as `/api/certificates/[id]/pdf/route.ts`
  - Supports both police-certificate and generic certificate PDF generation
- **Updated `/src/components/portal/tracking-view.tsx`**:
  - Added `downloadingCertificate` state
  - Added `handleDownloadCertificate()` that fetches PDF blob and triggers browser download
  - Download button now has loading state and disabled state
- **Updated `/src/middleware.ts`**:
  - Added `/api/stats` GET to public routes
  - Added `/api/applications/track/*/certificate` GET to public routes
  - Certificate download route is already covered by the broader `/api/applications/track*` pattern

### Migration Notes
The SQL migration files (`/supabase/audit-logs-migration.sql` and `/supabase/rate-limits-migration.sql`) need to be executed in the Supabase Dashboard SQL Editor to create the `audit_logs` and `rate_limits` tables (and the `increment_rate_limit` function). The application code gracefully degrades:
- Audit logging silently fails if the `audit_logs` table doesn't exist (logs are still returned to callers)
- Rate limiting falls back to pure in-memory if the `increment_rate_limit` RPC doesn't exist
