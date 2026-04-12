'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollText, Search, Download, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface AuditLog {
  id: string;
  action: string;
  entityType?: string | null;
  description: string;
  severity: string;
  userEmail?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  department?: { name: string } | null;
}

const severityStyles: Record<string, string> = {
  info: 'bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/30',
  warning: 'bg-[#fbbf24]/15 text-[#fbbf24] border-[#fbbf24]/30',
  critical: 'bg-[#f87171]/15 text-[#f87171] border-[#f87171]/30',
};

const actionIcons: Record<string, string> = {
  login: '🔐',
  create: '➕',
  update: '✏️',
  delete: '🗑️',
  deploy: '🚀',
  approve: '✅',
  reject: '❌',
};

export function AuditView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (severityFilter) params.set('severity', severityFilter);
        if (actionFilter) params.set('action', actionFilter);
        params.set('limit', '100');
        const res = await fetch(`/api/audit-logs?${params}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          let filtered = data.logs || [];
          if (search) {
            const s = search.toLowerCase();
            filtered = filtered.filter((l: AuditLog) =>
              l.description.toLowerCase().includes(s) ||
              l.userEmail?.toLowerCase().includes(s) ||
              l.department?.name?.toLowerCase().includes(s)
            );
          }
          setLogs(filtered);
          setTotal(data.total || 0);
        }
      } catch (err) { console.error(err); }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [search, severityFilter, actionFilter]);

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Severity', 'Action', 'Description', 'User', 'Department', 'IP'].join(','),
      ...logs.map(l => [
        new Date(l.createdAt).toISOString(),
        l.severity,
        l.action,
        `"${l.description}"`,
        l.userEmail || '',
        l.department?.name || '',
        l.ipAddress || '',
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 section-enter">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#e8edf5]">Auditoría</h2>
          <p className="text-sm text-[#8899b4]">{total} audit log entries</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="border-[#1e3a5f] text-[#8899b4]"><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
          <Button onClick={handleExport} variant="outline" size="sm" className="border-[#1e3a5f] text-[#8899b4]"><Download className="w-4 h-4 mr-2" />Export CSV</Button>
        </div>
      </div>

      {/* Severity stats */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#38bdf8]/10 border border-[#38bdf8]/30 text-xs">
          <div className="w-2 h-2 rounded-full bg-[#38bdf8]" />
          <span className="text-[#8899b4]">Info: </span><strong className="text-[#38bdf8]">{logs.filter(l => l.severity === 'info').length}</strong>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-xs">
          <div className="w-2 h-2 rounded-full bg-[#fbbf24]" />
          <span className="text-[#8899b4]">Warning: </span><strong className="text-[#fbbf24]">{logs.filter(l => l.severity === 'warning').length}</strong>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f87171]/10 border border-[#f87171]/30 text-xs">
          <div className="w-2 h-2 rounded-full bg-[#f87171]" />
          <span className="text-[#8899b4]">Critical: </span><strong className="text-[#f87171]">{logs.filter(l => l.severity === 'critical').length}</strong>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8899b4]" />
          <Input placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-[#0f2140] border-[#1e3a5f] text-[#e8edf5] placeholder:text-[#8899b4]" />
        </div>
        <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-36 bg-[#0f2140] border-[#1e3a5f] text-[#8899b4]"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent className="bg-[#152a4e] border-[#1e3a5f]">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={(v) => setActionFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-36 bg-[#0f2140] border-[#1e3a5f] text-[#8899b4]"><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent className="bg-[#152a4e] border-[#1e3a5f]">
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="deploy">Deploy</SelectItem>
            <SelectItem value="approve">Approve</SelectItem>
            <SelectItem value="reject">Reject</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-[#1e3a5f] bg-[#0f2140]"><CardContent className="p-0">
        {loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 bg-[#152a4e]" />)}</div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16"><ScrollText className="w-12 h-12 text-[#1e3a5f] mb-4" /><h3 className="text-lg font-semibold text-[#e8edf5]">No audit logs</h3></div>
        ) : (
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-[#0f2140] z-10">
                <TableRow className="border-[#1e3a5f] hover:bg-transparent">
                  <TableHead className="text-[#8899b4] text-xs">Severity</TableHead>
                  <TableHead className="text-[#8899b4] text-xs">Action</TableHead>
                  <TableHead className="text-[#8899b4] text-xs">Description</TableHead>
                  <TableHead className="text-[#8899b4] text-xs">User</TableHead>
                  <TableHead className="text-[#8899b4] text-xs">Department</TableHead>
                  <TableHead className="text-[#8899b4] text-xs">IP Address</TableHead>
                  <TableHead className="text-[#8899b4] text-xs">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className="border-[#1e3a5f]/50 table-row-hover">
                    <TableCell>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${severityStyles[log.severity]}`}>
                        {log.severity}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-[#e8edf5]">
                      <span className="mr-1">{actionIcons[log.action] || '📝'}</span>
                      {log.action}
                    </TableCell>
                    <TableCell className="text-xs text-[#e8edf5] max-w-xs truncate">{log.description}</TableCell>
                    <TableCell className="text-xs text-[#8899b4]">{log.userEmail || '—'}</TableCell>
                    <TableCell className="text-xs text-[#8899b4]">{log.department?.name || '—'}</TableCell>
                    <TableCell className="text-xs text-[#8899b4] font-mono">{log.ipAddress || '—'}</TableCell>
                    <TableCell className="text-xs text-[#8899b4] whitespace-nowrap">{format(new Date(log.createdAt), 'MMM d, HH:mm:ss')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent></Card>
    </div>
  );
}
