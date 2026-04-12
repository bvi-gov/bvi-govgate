'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  ArrowLeft,
  FolderOpen,
  Users,
  FileText,
  Package,
  Heart,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  BarChart3,
  TrendingUp,
  DollarSign,
  Loader2,
  AlertCircle,
  Construction,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────
interface DepartmentStats {
  department: string;
  services: { id: string; name: string; slug: string; category: string; feeAmount: number }[];
  totalApplications: number;
  statusBreakdown: { paymentPending: number; processing: number; approved: number; rejected: number; issued: number };
  revenue: number;
  avgProcessingTime: number;
  recentApplications: {
    id: string;
    trackingNumber: string;
    applicantName: string;
    applicantEmail: string;
    status: string;
    paymentStatus: string;
    paymentAmount: number;
    createdAt: string;
    issuedAt: string | null;
    certificateNumber: string | null;
    service: { name: string };
  }[];
  topServices: { serviceId: string; serviceName: string; count: number }[];
  monthlyTrend: { month: string; total: number; issued: number; approved: number; rejected: number }[];
}

// ─── Tab Definitions ────────────────────────────────────────
const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'certificates', label: 'Certificate Generator', icon: FileText },
  { id: 'cases', label: 'Case Management', icon: FolderOpen },
  { id: 'officers', label: 'Officer Roster', icon: Users },
  { id: 'equipment', label: 'Equipment Inventory', icon: Package },
  { id: 'community', label: 'Community Programs', icon: Heart },
] as const;

type TabId = (typeof TABS)[number]['id'];

const COMING_SOON_TABS: TabId[] = ['cases', 'officers', 'equipment', 'community'];

// ─── Status Helpers ─────────────────────────────────────────
function statusBadgeStyle(status: string) {
  switch (status) {
    case 'approved': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'issued': return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    case 'payment_pending':
    case 'submitted': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'processing': return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
    case 'rejected': return 'bg-red-500/15 text-red-400 border-red-500/30';
    default: return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
  }
}

function formatStatus(status: string) {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

// ─── Donut Chart ────────────────────────────────────────────
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  const computed = segments.reduce<Array<{ seg: typeof segments[number]; pct: number; offset: number }>>(
    (acc, seg) => {
      const pct = seg.value / total;
      const offset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].pct * circumference : 0;
      return [...acc, { seg, pct, offset }];
    },
    []
  );

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-28 h-28 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {computed.map(({ seg, pct, offset }, i) => pct > 0 && (
            <circle
              key={i}
              cx="50" cy="50" r={radius}
              fill="none" stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={`${pct * circumference} ${circumference}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="opacity-90"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-white">{total}</span>
          <span className="text-[10px] text-gray-400">Total</span>
        </div>
      </div>
      <div className="space-y-2 flex-1">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-xs text-gray-300 flex-1">{seg.label}</span>
            <span className="text-xs font-semibold text-white">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Skeleton Loader ────────────────────────────────────────
function StatSkeleton() {
  return (
    <Card className="bg-[#131F2E] border-[#1E3A5F]">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#1E3A5F] rounded-lg animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-[#1E3A5F] rounded w-16 animate-pulse" />
            <div className="h-3 bg-[#1E3A5F] rounded w-24 animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ComingSoonPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
        <Construction className="w-8 h-8 text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Coming Soon</h3>
      <p className="text-sm text-gray-400 text-center max-w-md">
        The <span className="text-blue-400 font-medium">{title}</span> module is currently under development. 
        This feature will require additional database models and will be available in a future update.
      </p>
      <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Requires separate database schema</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════
export function AdminMinistryRVIPF() {
  const { goBack, adminName, adminRole } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [stats, setStats] = useState<DepartmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const DEPARTMENT = 'Royal Virgin Islands Police Force';

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ministry/${encodeURIComponent(DEPARTMENT)}`);
      if (!res.ok) throw new Error('Failed to load department data');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ─── Stats Cards ───────────────────────────────────────
  const statsCards = stats
    ? [
        { label: 'Total Applications', value: stats.totalApplications, icon: FolderOpen, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Pending Payment', value: stats.statusBreakdown.paymentPending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Approved', value: stats.statusBreakdown.approved, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Issued', value: stats.statusBreakdown.issued, icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { label: 'Revenue Collected', value: formatCurrency(stats.revenue), icon: DollarSign, color: 'text-cyan-400', bg: 'bg-cyan-500/10', isText: true },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#0C1B2A]">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-30 bg-[#0C1B2A]/95 backdrop-blur-md border-b border-[#1E3A5F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost" size="icon" onClick={goBack}
                className="shrink-0 text-gray-400 hover:text-white hover:bg-white/5"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-bold text-white truncate">{DEPARTMENT}</h1>
                  <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                    ACTIVE
                  </Badge>
                </div>
                <p className="text-xs text-gray-400">Internal Management Dashboard</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{adminName}</p>
                <p className="text-xs text-gray-400">{adminRole}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-400">{adminName?.charAt(0) ?? 'A'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ─── Stats Row ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <StatSkeleton key={i} />)
          ) : error ? (
            <Card className="bg-red-500/10 border-red-500/30 col-span-full">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
                <Button variant="ghost" size="sm" onClick={fetchStats} className="ml-auto text-red-400 hover:text-red-300 hover:bg-red-500/10">
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : (
            statsCards.map((stat) => (
              <Card key={stat.label} className="bg-[#131F2E] border-[#1E3A5F] hover:border-blue-500/30 transition-colors">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.bg} rounded-lg flex items-center justify-center shrink-0`}>
                      <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-lg sm:text-xl font-bold text-white leading-tight ${stat.isText ? 'text-base sm:text-lg' : ''}`}>
                        {stat.value}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-400">{stat.label}</div>
                    </div>
                  </div>
                  {stat.label === 'Avg Processing' && (
                    <div className="mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] font-medium text-emerald-400">
                        {stats?.avgProcessingTime} days avg
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* ─── Tabs ─── */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── Tab Content ─── */}
        {loading && !stats ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <span className="ml-3 text-sm text-gray-400">Loading department data...</span>
          </div>
        ) : (
          <>
            {/* ─── OVERVIEW TAB ─── */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Status Breakdown + Recent Applications */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
                  {/* Status Donut */}
                  <Card className="bg-[#131F2E] border-[#1E3A5F] lg:col-span-2">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-5">
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                        <h3 className="text-sm font-semibold text-white">Application Status</h3>
                      </div>
                      <DonutChart
                        segments={[
                          { label: 'Pending Payment', value: stats.statusBreakdown.paymentPending, color: '#f59e0b' },
                          { label: 'Processing', value: stats.statusBreakdown.processing, color: '#06b6d4' },
                          { label: 'Approved', value: stats.statusBreakdown.approved, color: '#10b981' },
                          { label: 'Rejected', value: stats.statusBreakdown.rejected, color: '#ef4444' },
                          { label: 'Issued', value: stats.statusBreakdown.issued, color: '#3b82f6' },
                        ]}
                      />
                      {/* Metrics */}
                      <div className="mt-5 space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Avg Processing Time</span>
                            <span className="text-white font-medium">{stats.avgProcessingTime} days</span>
                          </div>
                          <div className="h-1.5 bg-[#1E3A5F] rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (stats.avgProcessingTime / 7) * 100)}%` }} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Approval Rate</span>
                            <span className="text-white font-medium">
                              {stats.totalApplications > 0
                                ? Math.round(((stats.statusBreakdown.approved + stats.statusBreakdown.issued) / stats.totalApplications) * 100)
                                : 0}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-[#1E3A5F] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{
                                width: `${stats.totalApplications > 0
                                  ? ((stats.statusBreakdown.approved + stats.statusBreakdown.issued) / stats.totalApplications) * 100
                                  : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Revenue Collected</span>
                            <span className="text-white font-medium">{formatCurrency(stats.revenue)}</span>
                          </div>
                          <div className="h-1.5 bg-[#1E3A5F] rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${stats.totalApplications > 0 ? Math.min(100, (stats.revenue / stats.totalApplications) * 5) : 0}%` }} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Applications */}
                  <Card className="bg-[#131F2E] border-[#1E3A5F] lg:col-span-3">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-blue-400" />
                          <h3 className="text-sm font-semibold text-white">Recent Applications</h3>
                        </div>
                        <Badge className="bg-[#1E3A5F] text-gray-400 border-0 text-[10px]">
                          {stats.recentApplications.length} records
                        </Badge>
                      </div>
                      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                        {stats.recentApplications.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-8">No applications yet</p>
                        ) : (
                          stats.recentApplications.map((app) => (
                            <div key={app.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                              <div className={`w-7 h-7 rounded-lg bg-[#0C1B2A] flex items-center justify-center shrink-0 mt-0.5`}>
                                {app.status === 'issued' ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                                ) : app.status === 'rejected' ? (
                                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-200 leading-relaxed">
                                  <span className="font-medium text-white">{app.applicantName}</span>
                                  {' — '}{app.service.name}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[10px] text-gray-500 font-mono">{app.trackingNumber}</span>
                                  <span className="text-[10px] text-gray-500">{formatDate(app.createdAt)}</span>
                                </div>
                              </div>
                              <Badge className={`${statusBadgeStyle(app.status)} text-[9px] px-2 py-0 shrink-0`}>
                                {formatStatus(app.status)}
                              </Badge>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Services + Monthly Trend */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Top Services */}
                  <Card className="bg-[#131F2E] border-[#1E3A5F]">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <h3 className="text-sm font-semibold text-white">Top Services</h3>
                      </div>
                      {stats.topServices.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-6">No service data</p>
                      ) : (
                        <div className="space-y-3">
                          {stats.topServices.map((svc, i) => {
                            const maxCount = stats.topServices[0]?.count || 1;
                            return (
                              <div key={svc.serviceId} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-300 flex items-center gap-2">
                                    <span className="text-gray-500 font-mono w-4">{i + 1}.</span>
                                    {svc.serviceName}
                                  </span>
                                  <span className="text-white font-medium">{svc.count}</span>
                                </div>
                                <div className="h-1.5 bg-[#1E3A5F] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                    style={{ width: `${(svc.count / maxCount) * 100}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Monthly Trend */}
                  <Card className="bg-[#131F2E] border-[#1E3A5F]">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <h3 className="text-sm font-semibold text-white">Monthly Trend (Last 6 Months)</h3>
                      </div>
                      <div className="space-y-2">
                        {stats.monthlyTrend.map((month) => {
                          const maxTotal = Math.max(...stats.monthlyTrend.map((m) => m.total)) || 1;
                          return (
                            <div key={month.month} className="flex items-center gap-3">
                              <span className="text-[10px] text-gray-400 w-12 shrink-0 text-right">{month.month}</span>
                              <div className="flex-1 h-5 bg-[#1E3A5F] rounded overflow-hidden flex">
                                {month.issued > 0 && (
                                  <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(month.issued / maxTotal) * 100}%` }} title={`Issued: ${month.issued}`} />
                                )}
                                {month.approved > 0 && (
                                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(month.approved / maxTotal) * 100}%` }} title={`Approved: ${month.approved}`} />
                                )}
                                {month.rejected > 0 && (
                                  <div className="h-full bg-red-500/70 transition-all duration-500" style={{ width: `${(month.rejected / maxTotal) * 100}%` }} title={`Rejected: ${month.rejected}`} />
                                )}
                              </div>
                              <span className="text-[10px] font-medium text-white w-6 text-right">{month.total}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#1E3A5F]/50">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-[10px] text-gray-400">Issued</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[10px] text-gray-400">Approved</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500/70" /><span className="text-[10px] text-gray-400">Rejected</span></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* ─── CERTIFICATES TAB ─── */}
            {activeTab === 'certificates' && stats && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <Card className="bg-[#131F2E] border-[#1E3A5F]">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <h3 className="text-sm font-semibold text-white">Certificate Applications</h3>
                      </div>
                      <Badge className="bg-[#1E3A5F] text-gray-400 border-0 text-[10px]">
                        {stats.recentApplications.length} records
                      </Badge>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-[#1E3A5F]">
                            <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Tracking #</th>
                            <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Applicant</th>
                            <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Service</th>
                            <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Status</th>
                            <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Payment</th>
                            <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Date</th>
                            <th className="text-right py-2.5 px-3 text-gray-400 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentApplications.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-gray-500">No applications found</td>
                            </tr>
                          ) : (
                            stats.recentApplications.map((app) => (
                              <tr key={app.id} className="border-b border-[#1E3A5F]/50 hover:bg-white/[0.02] transition-colors">
                                <td className="py-3 px-3 text-blue-400 font-mono font-medium">{app.trackingNumber}</td>
                                <td className="py-3 px-3 text-white">{app.applicantName}</td>
                                <td className="py-3 px-3 text-gray-300">{app.service.name}</td>
                                <td className="py-3 px-3">
                                  <Badge className={`${statusBadgeStyle(app.status)} text-[10px] px-2 py-0`}>
                                    {formatStatus(app.status)}
                                  </Badge>
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`text-[10px] font-medium ${app.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {app.paymentStatus === 'paid' ? formatCurrency(app.paymentAmount) : 'Unpaid'}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-gray-400">{formatDate(app.createdAt)}</td>
                                <td className="py-3 px-3 text-right">
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-gray-400 hover:text-white hover:bg-white/5">
                                    <Eye className="w-3.5 h-3.5" />
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ─── COMING SOON TABS ─── */}
            {COMING_SOON_TABS.map((tab) => (
              activeTab === tab && (
                <ComingSoonPlaceholder
                  key={tab}
                  title={TABS.find((t) => t.id === tab)?.label || tab}
                />
              )
            ))}
          </>
        )}
      </main>
    </div>
  );
}

// Need Activity icon imported but not in the import list - using a simple alias
function Activity({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
  );
}
