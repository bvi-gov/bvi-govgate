'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { StatsCard } from './stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Users,
  FileText,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStats {
  departments: { total: number; active: number };
  members: { total: number };
  serviceRequests: {
    total: number;
    pending: number;
    completed: number;
    urgent: number;
    byStatus: Array<{ status: string; count: number }>;
    byMonth: Array<{ month: string; count: number }>;
  };
  documents: { total: number; pending: number };
  citizenRequests: { total: number; paid: number };
  revenue: { total: number };
  overduePayments: number;
  recentLogs: Array<{
    id: string;
    action: string;
    description: string;
    severity: string;
    createdAt: string;
    department?: { name: string } | null;
  }>;
  revenueByTier: Array<{ tier: string; total: number; count: number }>;
}

const CHART_COLORS = ['#d4af37', '#38bdf8', '#4ade80', '#f87171', '#a855f7', '#fb923c'];

export function DashboardView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 bg-[#152a4e] rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-80 bg-[#152a4e] rounded-xl" />
          <Skeleton className="h-80 bg-[#152a4e] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-[#d4af37] mb-4" />
        <h3 className="text-lg font-semibold text-[#e8edf5]">No Data Available</h3>
        <p className="text-sm text-[#8899b4] mt-1">Please seed the database first.</p>
        <Button onClick={() => fetch('/api/seed', { method: 'POST' }).then(() => fetchStats())} className="mt-4 bg-[#d4af37] text-[#0a1628] hover:bg-[#e6c453]">
          Initialize Demo Data
        </Button>
      </div>
    );
  }

  const revenueData = stats.revenueByTier.map(r => ({
    name: r.tier.charAt(0).toUpperCase() + r.tier.slice(1),
    revenue: r.total,
    count: r.count,
  }));

  const statusData = stats.serviceRequests.byStatus.map(s => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: s.count,
  }));

  const monthData = stats.serviceRequests.byMonth.slice().reverse().map(m => ({
    month: m.month?.substring(5) || m.month,
    requests: m.count,
  }));

  const severityColors: Record<string, string> = {
    info: 'text-[#38bdf8] bg-[#38bdf8]/10',
    warning: 'text-[#fbbf24] bg-[#fbbf24]/10',
    critical: 'text-[#f87171] bg-[#f87171]/10',
  };

  return (
    <div className="space-y-6 section-enter">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#e8edf5]">Dashboard</h2>
          <p className="text-sm text-[#8899b4]">BVI Government Digital Tower — Overview</p>
        </div>
        <Button
          onClick={fetchStats}
          variant="outline"
          size="sm"
          className="border-[#1e3a5f] text-[#8899b4] hover:text-[#e8edf5] hover:bg-[#152a4e]"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Departments"
          value={stats.departments.total}
          subtitle={`${stats.departments.active} active`}
          icon={<Building2 className="w-5 h-5 text-[#d4af37]" />}
          trend="up"
          trendValue="+2 this month"
          variant="gold"
        />
        <StatsCard
          title="Team Members"
          value={stats.members.total}
          subtitle="Across all departments"
          icon={<Users className="w-5 h-5 text-[#38bdf8]" />}
          variant="default"
        />
        <StatsCard
          title="Pending Requests"
          value={stats.serviceRequests.pending}
          subtitle={`${stats.serviceRequests.urgent} urgent`}
          icon={<Clock className="w-5 h-5 text-[#fbbf24]" />}
          variant="warning"
        />
        <StatsCard
          title="Monthly Revenue"
          value={`$${stats.revenue.total.toLocaleString()}`}
          subtitle={stats.overduePayments > 0 ? `${stats.overduePayments} overdue` : 'All current'}
          icon={<DollarSign className="w-5 h-5 text-[#4ade80]" />}
          trend="up"
          trendValue="+12% from last month"
          variant="success"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Service Requests"
          value={stats.serviceRequests.total}
          subtitle={`${stats.serviceRequests.completed} completed`}
          icon={<FileText className="w-5 h-5 text-[#a855f7]" />}
        />
        <StatsCard
          title="Citizen Requests"
          value={stats.citizenRequests.total}
          subtitle={`${stats.citizenRequests.paid} paid`}
          icon={<Globe className="w-5 h-5 text-[#38bdf8]" />}
        />
        <StatsCard
          title="Documents"
          value={stats.documents.total}
          subtitle={`${stats.documents.pending} pending review`}
          icon={<FileText className="w-5 h-5 text-[#fb923c]" />}
        />
        <StatsCard
          title="Overdue Payments"
          value={stats.overduePayments}
          subtitle="Requires attention"
          icon={<AlertTriangle className="w-5 h-5 text-[#f87171]" />}
          variant={stats.overduePayments > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Requests Chart */}
        <Card className="border-[#1e3a5f] bg-[#0f2140]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#8899b4]">Monthly Service Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {monthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                  <XAxis dataKey="month" tick={{ fill: '#8899b4', fontSize: 11 }} axisLine={{ stroke: '#1e3a5f' }} />
                  <YAxis tick={{ fill: '#8899b4', fontSize: 11 }} axisLine={{ stroke: '#1e3a5f' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#152a4e', border: '1px solid #1e3a5f', borderRadius: '8px' }}
                    labelStyle={{ color: '#e8edf5' }}
                    itemStyle={{ color: '#d4af37' }}
                  />
                  <Bar dataKey="requests" fill="#d4af37" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-[#8899b4] text-sm">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Tier / Status Distribution */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="border-[#1e3a5f] bg-[#0f2140]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#8899b4]">Revenue by Tier</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={revenueData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                    <XAxis type="number" tick={{ fill: '#8899b4', fontSize: 11 }} axisLine={{ stroke: '#1e3a5f' }} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#8899b4', fontSize: 11 }} axisLine={{ stroke: '#1e3a5f' }} width={80} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#152a4e', border: '1px solid #1e3a5f', borderRadius: '8px' }}
                      labelStyle={{ color: '#e8edf5' }}
                      itemStyle={{ color: '#d4af37' }}
                    />
                    <Bar dataKey="revenue" fill="#38bdf8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-44 text-[#8899b4] text-sm">No data available</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#1e3a5f] bg-[#0f2140]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#8899b4]">Request Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" paddingAngle={3}>
                        {statusData.map((_, idx) => (
                          <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 flex-1">
                    {statusData.map((s, idx) => (
                      <div key={s.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                          <span className="text-[#8899b4]">{s.name}</span>
                        </div>
                        <span className="text-[#e8edf5] font-medium">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-[#8899b4] text-sm">No data available</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="border-[#1e3a5f] bg-[#0f2140]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-[#8899b4]">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {stats.recentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#152a4e] transition-colors">
                <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                  log.severity === 'info' ? 'bg-[#38bdf8]' :
                  log.severity === 'warning' ? 'bg-[#fbbf24]' : 'bg-[#f87171]'
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#e8edf5]">{log.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded', severityColors[log.severity])}>
                      {log.severity}
                    </span>
                    {log.department && (
                      <span className="text-[10px] text-[#8899b4]">{log.department.name}</span>
                    )}
                    <span className="text-[10px] text-[#8899b4] ml-auto flex-shrink-0">
                      {format(new Date(log.createdAt), 'MMM d, HH:mm')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...inputs: (string | undefined | false)[]) {
  return inputs.filter(Boolean).join(' ');
}
