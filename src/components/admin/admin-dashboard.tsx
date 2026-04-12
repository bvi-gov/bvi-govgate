'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileText, Clock, CheckCircle2, DollarSign, Users, ArrowRight,
  AlertCircle, Loader2, Building2, TrendingUp, Shield, Car, Briefcase,
  Heart, Baby, BookOpen, Store, Calculator, FileBadge, UserCheck,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface Stats {
  totalApplications: number;
  pendingCount: number;
  processingCount: number;
  approvedCount: number;
  rejectedCount: number;
  issuedCount: number;
  totalRevenue: number;
  totalServices: number;
  totalOfficers: number;
  recentApplications: any[];
  revenueByService: Record<string, number>;
  statusBreakdown: Record<string, number>;
}

interface DepartmentStats {
  name: string;
  applications: number;
  pending: number;
  approved: number;
  issued: number;
  revenue: number;
  icon: string;
}

const PIE_COLORS = ['#F59E0B', '#3B82F6', '#38BDF8', '#10B981', '#EF4444', '#22C55E'];

const deptIcons: Record<string, any> = {
  'Royal Virgin Islands Police Force': Shield,
  'Inland Revenue Department': Calculator,
  'Immigration Department': Briefcase,
  'Registry of Civil Status': Baby,
  'Department of Motor Vehicles': Car,
  'Financial Services Commission': Building2,
};

const deptColors: Record<string, string> = {
  'Royal Virgin Islands Police Force': 'from-blue-600/20 to-blue-900/20 border-blue-500/20',
  'Inland Revenue Department': 'from-amber-600/20 to-amber-900/20 border-amber-500/20',
  'Immigration Department': 'from-purple-600/20 to-purple-900/20 border-purple-500/20',
  'Registry of Civil Status': 'from-pink-600/20 to-pink-900/20 border-pink-500/20',
  'Department of Motor Vehicles': 'from-sky-600/20 to-sky-900/20 border-sky-500/20',
  'Financial Services Commission': 'from-emerald-600/20 to-emerald-900/20 border-emerald-500/20',
};

const deptAccentColors: Record<string, string> = {
  'Royal Virgin Islands Police Force': 'text-blue-400 bg-blue-400/10',
  'Inland Revenue Department': 'text-amber-400 bg-amber-400/10',
  'Immigration Department': 'text-purple-400 bg-purple-400/10',
  'Registry of Civil Status': 'text-pink-400 bg-pink-400/10',
  'Department of Motor Vehicles': 'text-sky-400 bg-sky-400/10',
  'Financial Services Commission': 'text-emerald-400 bg-emerald-400/10',
};

export function AdminDashboard() {
  const { setCurrentView, adminName, adminRole, setCurrentApplicationId } = useAppStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [departments, setDepartments] = useState<DepartmentStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [statsRes, appRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/applications?limit=200'),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (appRes.ok) {
        const data = await appRes.json();
        const apps = data.applications || [];

        // Build department stats
        const deptMap: Record<string, { applications: number; pending: number; approved: number; issued: number; revenue: number; icon: string }> = {};
        apps.forEach((app: any) => {
          const dept = app.service?.department || 'Unknown';
          if (!deptMap[dept]) deptMap[dept] = { applications: 0, pending: 0, approved: 0, issued: 0, revenue: 0, icon: '' };
          deptMap[dept].applications++;
          if (app.status === 'payment_pending' || app.status === 'submitted') deptMap[dept].pending++;
          if (app.status === 'approved') deptMap[dept].approved++;
          if (app.status === 'issued') deptMap[dept].issued++;
          if (app.paymentStatus === 'paid') deptMap[dept].revenue += app.paymentAmount || 0;
          deptMap[dept].icon = app.service?.department || '';
        });
        setDepartments(Object.entries(deptMap).map(([name, d]) => ({ name, ...d })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToQueue = () => setCurrentView('admin-queue');
  const handleViewApplication = (id: string) => {
    setCurrentApplicationId(id);
    setCurrentView('admin-processing');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-8 bg-gray-700 rounded w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const pieData = [
    { name: 'Payment Pending', value: stats.pendingCount },
    { name: 'Processing', value: stats.processingCount },
    { name: 'Approved', value: stats.approvedCount },
    { name: 'Rejected', value: stats.rejectedCount },
    { name: 'Issued', value: stats.issuedCount },
  ].filter((d) => d.value > 0);

  const barData = Object.entries(stats.revenueByService || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, amount]) => ({
      name: name.length > 22 ? name.substring(0, 22) + '...' : name,
      fullName: name,
      amount,
    }));

  const totalPending = stats.pendingCount;
  const completionRate = stats.totalApplications > 0
    ? Math.round(((stats.approvedCount + stats.issuedCount) / stats.totalApplications) * 100)
    : 0;

  return (
    <div className="space-y-6 section-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm">
            Welcome back, {adminName}{' '}
            <span className="text-[#FFD100]">({adminRole === 'admin' ? 'Administrator' : adminRole === 'senior_officer' ? 'Senior Officer' : 'Officer'})</span>
          </p>
        </div>
        <Button onClick={handleGoToQueue} className="bg-[#009B3A] text-white hover:bg-[#007A2E]">
          Go to Application Queue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Applications', value: stats.totalApplications, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Pending Review', value: totalPending, icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          { label: 'Completion Rate', value: `${completionRate}%`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Total Revenue', value: `$${(stats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-[#FFD100]', bg: 'bg-[#FFD100]/10' },
          { label: 'Active Officers', value: stats.totalOfficers, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-[#131F2E] border-[#1E3A5F]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Departments Grid - THE KEY SECTION */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-white">Ministries & Departments</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const IconComp = deptIcons[dept.name] || Building2;
            const gradient = deptColors[dept.name] || 'from-gray-600/20 to-gray-900/20 border-gray-500/20';
            const accent = deptAccentColors[dept.name] || 'text-gray-400 bg-gray-400/10';
            const pct = dept.applications > 0 ? Math.round(((dept.approved + dept.issued) / dept.applications) * 100) : 0;

            return (
              <Card
                key={dept.name}
                className={`bg-gradient-to-br ${gradient} border cursor-pointer hover:scale-[1.01] transition-transform`}
                onClick={handleGoToQueue}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate">{dept.name}</h3>
                        <p className="text-xs text-gray-500">{dept.applications} applications</p>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-amber-400">{dept.pending}</div>
                      <div className="text-[10px] text-gray-500">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-sky-400">{dept.applications - dept.approved - dept.issued - dept.pending - (dept.rejected || 0)}</div>
                      <div className="text-[10px] text-gray-500">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-emerald-400">{dept.approved + dept.issued}</div>
                      <div className="text-[10px] text-gray-500">Done</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#FFD100]">${dept.revenue}</div>
                      <div className="text-[10px] text-gray-500">Revenue</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#0C1B2A] rounded-full h-1.5">
                    <div
                      className="bg-[#009B3A] h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">{pct}% completion rate</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-5">
            <h3 className="text-white font-semibold mb-4">Application Status Breakdown</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#182A3D', border: '1px solid #1E3A5F', borderRadius: '8px', color: '#fff' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500">No data</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-5">
            <h3 className="text-white font-semibold mb-4">Revenue by Service</h3>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
                  <XAxis type="number" stroke="#64748B" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" stroke="#64748B" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip
                    contentStyle={{ background: '#182A3D', border: '1px solid #1E3A5F', borderRadius: '8px', color: '#fff' }}
                    formatter={(value: number) => [`$${value}`, 'Revenue']}
                  />
                  <Bar dataKey="amount" fill="#009B3A" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500">No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card className="bg-[#131F2E] border-[#1E3A5F]">
        <CardContent className="p-5">
          <h3 className="text-white font-semibold mb-4">Recent Applications</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs uppercase border-b border-[#1E3A5F]">
                  <th className="text-left pb-3 font-medium">Tracking #</th>
                  <th className="text-left pb-3 font-medium">Applicant</th>
                  <th className="text-left pb-3 font-medium hidden sm:table-cell">Service</th>
                  <th className="text-left pb-3 font-medium hidden md:table-cell">Department</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium hidden lg:table-cell">Date</th>
                  <th className="text-right pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {(stats.recentApplications || []).map((app: any) => (
                  <tr
                    key={app.id}
                    className="border-b border-[#1E3A5F]/50 hover:bg-[#182A3D]/50 cursor-pointer"
                    onClick={() => handleViewApplication(app.id)}
                  >
                    <td className="py-3 font-mono text-xs text-gray-300">{app.trackingNumber}</td>
                    <td className="py-3 text-white">{app.applicantName}</td>
                    <td className="py-3 text-gray-300 hidden sm:table-cell">{app.service?.name}</td>
                    <td className="py-3 text-gray-400 hidden md:table-cell text-xs">{app.service?.department}</td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        app.status === 'issued' ? 'bg-emerald-400/10 text-emerald-400' :
                        app.status === 'approved' ? 'bg-emerald-400/10 text-emerald-400' :
                        app.status === 'rejected' ? 'bg-red-400/10 text-red-400' :
                        app.status === 'processing' ? 'bg-sky-400/10 text-sky-400' :
                        app.status === 'payment_pending' ? 'bg-amber-400/10 text-amber-400' :
                        'bg-blue-400/10 text-blue-400'
                      }`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400 text-xs hidden lg:table-cell">
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="ghost" size="sm" className="text-[#009B3A] hover:text-[#009B3A]/80 text-xs h-7">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
