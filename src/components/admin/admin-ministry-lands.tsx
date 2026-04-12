'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Mountain,
  MapPin,
  FileText,
  AlertTriangle,
  Search,
  Plus,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  DollarSign,
  Loader2,
  Building2,
  TrendingUp,
  Users,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────
interface Parcel {
  id: string;
  parcel_number: string;
  plan_number: string | null;
  address: string;
  district: string;
  area_sqft: number;
  land_use_zone: string;
  status: string;
  current_owner: string;
  created_at: string;
  updated_at: string;
}

interface Lien {
  id: string;
  parcel_id: string;
  lien_type: string;
  creditor_name: string;
  amount: number;
  filed_date: string | null;
  release_date: string | null;
  status: string;
  created_at: string;
  land_parcels?: { parcel_number: string; address: string } | null;
}

interface DepartmentStats {
  department: string;
  services: { id: string; name: string; slug: string; category: string; feeAmount: number }[];
  totalApplications: number;
  statusBreakdown: { paymentPending: number; processing: number; approved: number; rejected: number; issued: number };
  revenue: number;
  avgProcessingTime: number;
  recentApplications: {
    id: string;
    tracking_number: string;
    applicant_name: string;
    applicant_email: string;
    status: string;
    payment_status: string;
    payment_amount: number;
    created_at: string;
    service: { name: string };
  }[];
  topServices: { serviceId: string; serviceName: string; count: number }[];
  monthlyTrend: { month: string; total: number; issued: number; approved: number; rejected: number }[];
}

// ─── Tab Definitions ────────────────────────────────────────
const TABS = [
  { id: 'overview', label: 'Overview', icon: Building2 },
  { id: 'applications', label: 'Applications', icon: FileText },
  { id: 'parcels', label: 'Parcel Registry', icon: MapPin },
  { id: 'liens', label: 'Liens', icon: AlertTriangle },
] as const;

type TabId = (typeof TABS)[number]['id'];

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

function parcelStatusStyle(status: string) {
  switch (status) {
    case 'registered': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'pending_transfer': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'under_restriction': return 'bg-red-500/15 text-red-400 border-red-500/30';
    default: return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
  }
}

function lienStatusStyle(status: string) {
  switch (status) {
    case 'active': return 'bg-red-500/15 text-red-400 border-red-500/30';
    case 'released':
    case 'discharged': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'pending': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    default: return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
  }
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

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════
export function AdminMinistryLands() {
  const { adminName, adminRole } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [stats, setStats] = useState<DepartmentStats | null>(null);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [parcelsTotal, setParcelsTotal] = useState(0);
  const [liens, setLiens] = useState<Lien[]>([]);
  const [liensTotal, setLiensTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parcelSearch, setParcelSearch] = useState('');
  const [lienFilter, setLienFilter] = useState('');

  const DEPARTMENT = 'Lands & Survey Department';

  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch(`/api/ministry/${encodeURIComponent(DEPARTMENT)}`);
      if (!res.ok) throw new Error('Failed to load department data');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const fetchParcels = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (parcelSearch) params.set('search', parcelSearch);
      params.set('limit', '50');
      const res = await fetch(`/api/land/parcels?${params}`);
      if (!res.ok) throw new Error('Failed to load parcels');
      const data = await res.json();
      setParcels(data.parcels || []);
      setParcelsTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching parcels:', err);
    }
  }, [parcelSearch]);

  const fetchLiens = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (lienFilter) params.set('status', lienFilter);
      params.set('limit', '50');
      const res = await fetch(`/api/land/liens?${params}`);
      if (!res.ok) throw new Error('Failed to load liens');
      const data = await res.json();
      setLiens(data.liens || []);
      setLiensTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching liens:', err);
    }
  }, [lienFilter]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([fetchOverview(), fetchParcels(), fetchLiens()])
      .finally(() => setLoading(false));
  }, [fetchOverview, fetchParcels, fetchLiens]);

  // ─── Stats Cards ───────────────────────────────────────
  const statsCards = stats
    ? [
        { label: 'Total Parcels', value: parcelsTotal, icon: MapPin, color: 'text-lime-400', bg: 'bg-lime-500/10' },
        { label: 'Pending Transfers', value: parcels.filter(p => p.status === 'pending_transfer').length, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Active Liens', value: liens.filter(l => l.status === 'active').length, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
        { label: 'Revenue', value: formatCurrency(stats.revenue), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', isText: true },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#0C1B2A]">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-30 bg-[#0C1B2A]/95 backdrop-blur-md border-b border-[#1E3A5F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-lime-500/15 border border-lime-500/30 flex items-center justify-center shrink-0">
                <Mountain className="w-5 h-5 text-lime-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-bold text-white truncate">Lands & Survey Department</h1>
                  <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                    ACTIVE
                  </Badge>
                </div>
                <p className="text-xs text-gray-400">Land Registry & Property Management</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{adminName}</p>
                <p className="text-xs text-gray-400">{adminRole}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-lime-500/15 border border-lime-500/30 flex items-center justify-center">
                <span className="text-sm font-bold text-lime-400">{adminName?.charAt(0) ?? 'A'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ─── Stats Row ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          ) : error ? (
            <Card className="bg-red-500/10 border-red-500/30 col-span-full">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </CardContent>
            </Card>
          ) : (
            statsCards.map((stat) => (
              <Card key={stat.label} className="bg-[#131F2E] border-[#1E3A5F] hover:border-lime-500/30 transition-colors">
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
                    ? 'bg-lime-500/15 text-lime-400 border border-lime-500/30 shadow-sm shadow-lime-500/10'
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
            <Loader2 className="w-8 h-8 text-lime-400 animate-spin" />
            <span className="ml-3 text-sm text-gray-400">Loading department data...</span>
          </div>
        ) : (
          <>
            {/* ─── OVERVIEW TAB ─── */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Summary row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Recent Applications */}
                  <Card className="bg-[#131F2E] border-[#1E3A5F] lg:col-span-2">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-lime-400" />
                          <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
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
                              <div className="w-7 h-7 rounded-lg bg-[#0C1B2A] flex items-center justify-center shrink-0 mt-0.5">
                                {app.status === 'issued' ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" />
                                ) : app.status === 'rejected' ? (
                                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-200 leading-relaxed">
                                  <span className="font-medium text-white">{app.applicant_name}</span>
                                  {' — '}{app.service.name}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[10px] text-gray-500 font-mono">{app.tracking_number}</span>
                                  <span className="text-[10px] text-gray-500">{formatDate(app.created_at)}</span>
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

                  {/* Quick Stats */}
                  <Card className="bg-[#131F2E] border-[#1E3A5F]">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-4 h-4 text-lime-400" />
                        <h3 className="text-sm font-semibold text-white">Quick Stats</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Total Applications</span>
                            <span className="text-white font-medium">{stats.totalApplications}</span>
                          </div>
                          <div className="h-1.5 bg-[#1E3A5F] rounded-full overflow-hidden">
                            <div className="h-full bg-lime-500 rounded-full" style={{ width: '100%' }} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Avg Processing Time</span>
                            <span className="text-white font-medium">{stats.avgProcessingTime} days</span>
                          </div>
                          <div className="h-1.5 bg-[#1E3A5F] rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.min(100, (stats.avgProcessingTime / 14) * 100)}%` }} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Revenue Collected</span>
                            <span className="text-white font-medium">{formatCurrency(stats.revenue)}</span>
                          </div>
                          <div className="h-1.5 bg-[#1E3A5F] rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (stats.revenue / 5000) * 100)}%` }} />
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
                              className="h-full bg-lime-500 rounded-full"
                              style={{
                                width: `${stats.totalApplications > 0
                                  ? ((stats.statusBreakdown.approved + stats.statusBreakdown.issued) / stats.totalApplications) * 100
                                  : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Services */}
                      <div className="mt-5 pt-4 border-t border-[#1E3A5F]/50">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs font-medium text-gray-300">Department Services</span>
                        </div>
                        <div className="space-y-2">
                          {stats.services.map((svc) => (
                            <div key={svc.id} className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">{svc.name}</span>
                              <span className="text-gray-500">{formatCurrency(svc.feeAmount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* ─── APPLICATIONS TAB ─── */}
            {activeTab === 'applications' && stats && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <Card className="bg-[#131F2E] border-[#1E3A5F]">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-lime-400" />
                        <h3 className="text-sm font-semibold text-white">LandGate Applications</h3>
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
                                <td className="py-3 px-3 text-lime-400 font-mono font-medium">{app.tracking_number}</td>
                                <td className="py-3 px-3 text-white">{app.applicant_name}</td>
                                <td className="py-3 px-3 text-gray-300">{app.service.name}</td>
                                <td className="py-3 px-3">
                                  <Badge className={`${statusBadgeStyle(app.status)} text-[10px] px-2 py-0`}>
                                    {formatStatus(app.status)}
                                  </Badge>
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`text-[10px] font-medium ${app.payment_status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {app.payment_status === 'paid' ? formatCurrency(app.payment_amount) : 'Unpaid'}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-gray-400">{formatDate(app.created_at)}</td>
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

            {/* ─── PARCELS TAB ─── */}
            {activeTab === 'parcels' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Search bar */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search by parcel number, address, or owner..."
                      value={parcelSearch}
                      onChange={(e) => setParcelSearch(e.target.value)}
                      className="w-full bg-[#131F2E] border border-[#1E3A5F] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/25"
                    />
                  </div>
                  <Badge className="bg-[#1E3A5F] text-gray-400 border-0 text-xs px-3 py-1.5">
                    {parcelsTotal} parcels
                  </Badge>
                </div>

                <Card className="bg-[#131F2E] border-[#1E3A5F]">
                  <CardContent className="p-5">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-[#1E3A5F]">
                            <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Parcel #</th>
                            <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Address</th>
                            <th className="text-left py-2.5 px-3 text-gray-400 font-medium">District</th>
                            <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Zone</th>
                            <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Area (sqft)</th>
                            <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Owner</th>
                            <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Status</th>
                            <th className="text-right py-2.5 px-3 text-gray-400 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parcels.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-8 text-center text-gray-500">
                                {loading ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Loading...
                                  </div>
                                ) : 'No parcels found'}
                              </td>
                            </tr>
                          ) : (
                            parcels.map((parcel) => (
                              <tr key={parcel.id} className="border-b border-[#1E3A5F]/50 hover:bg-white/[0.02] transition-colors">
                                <td className="py-3 px-3 text-lime-400 font-mono font-medium">{parcel.parcel_number}</td>
                                <td className="py-3 px-3 text-white max-w-[200px] truncate">{parcel.address}</td>
                                <td className="py-3 px-3 text-gray-300">{parcel.district}</td>
                                <td className="py-3 px-3">
                                  <span className="capitalize text-gray-400">{parcel.land_use_zone.replace('_', ' ')}</span>
                                </td>
                                <td className="py-3 px-3 text-gray-300">{parcel.area_sqft?.toLocaleString()}</td>
                                <td className="py-3 px-3 text-gray-300 max-w-[150px] truncate">{parcel.current_owner}</td>
                                <td className="py-3 px-3">
                                  <Badge className={`${parcelStatusStyle(parcel.status)} text-[10px] px-2 py-0`}>
                                    {formatStatus(parcel.status)}
                                  </Badge>
                                </td>
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

            {/* ─── LIENS TAB ─── */}
            {activeTab === 'liens' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Filter bar */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {['', 'active', 'released'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setLienFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          lienFilter === filter
                            ? 'bg-lime-500/15 text-lime-400 border border-lime-500/30'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        {filter === '' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ))}
                  </div>
                  <Badge className="bg-[#1E3A5F] text-gray-400 border-0 text-xs px-3 py-1.5">
                    {liensTotal} liens
                  </Badge>
                </div>

                <Card className="bg-[#131F2E] border-[#1E3A5F]">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-lime-400" />
                        <h3 className="text-sm font-semibold text-white">Registered Liens & Encumbrances</h3>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-[#1E3A5F]">
                            <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Type</th>
                            <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Creditor</th>
                            <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Parcel</th>
                            <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Amount</th>
                            <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Filed</th>
                            <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Released</th>
                            <th className="text-left py-2.5 px-3 text-gray-400 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {liens.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-gray-500">
                                {loading ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Loading...
                                  </div>
                                ) : 'No liens found'}
                              </td>
                            </tr>
                          ) : (
                            liens.map((lien) => (
                              <tr key={lien.id} className="border-b border-[#1E3A5F]/50 hover:bg-white/[0.02] transition-colors">
                                <td className="py-3 px-3 text-white capitalize font-medium">{lien.lien_type}</td>
                                <td className="py-3 px-3 text-gray-300 max-w-[180px] truncate">{lien.creditor_name}</td>
                                <td className="py-3 px-3 text-lime-400 font-mono">
                                  {lien.land_parcels?.parcel_number || 'N/A'}
                                </td>
                                <td className="py-3 px-3 text-gray-300">
                                  {lien.amount > 0 ? formatCurrency(lien.amount) : '—'}
                                </td>
                                <td className="py-3 px-3 text-gray-400">
                                  {lien.filed_date ? formatDate(lien.filed_date) : '—'}
                                </td>
                                <td className="py-3 px-3 text-gray-400">
                                  {lien.release_date ? formatDate(lien.release_date) : '—'}
                                </td>
                                <td className="py-3 px-3">
                                  <Badge className={`${lienStatusStyle(lien.status)} text-[10px] px-2 py-0`}>
                                    {formatStatus(lien.status)}
                                  </Badge>
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
          </>
        )}
      </main>
    </div>
  );
}
