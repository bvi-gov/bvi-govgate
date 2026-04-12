'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Building2, TrendingUp, Clock, CheckCircle2, DollarSign,
  Users, ArrowRight, FileText, AlertTriangle,
} from 'lucide-react';

const COLORS = ['#009B3A', '#FFD100', '#38BDF8', '#EF4444', '#A78BFA', '#F97316', '#EC4899', '#06B6D4'];

interface DepartmentDetail {
  name: string;
  total: number;
  pending: number;
  processing: number;
  approved: number;
  rejected: number;
  issued: number;
  revenue: number;
  avgDays: number;
  color: string;
}

interface MonthlyData {
  month: string;
  applications: number;
  revenue: number;
}

export function AdminReports() {
  const { setCurrentView, setCurrentApplicationId } = useAppStore();
  const [departments, setDepartments] = useState<DepartmentDetail[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [appRes, payRes] = await Promise.all([
          fetch('/api/applications?limit=200'),
          fetch('/api/payments'),
        ]);
        const appData = appRes.ok ? await appRes.json() : { applications: [] };
        const payData = payRes.ok ? await payRes.json() : [];
        const applications = appData.applications || [];

        // Department breakdown
        const deptMap: Record<string, DepartmentDetail> = {};
        const deptColorMap: Record<string, string> = {};
        const deptColors = ['#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#10B981'];
        let colorIdx = 0;

        applications.forEach((app: any) => {
          const dept = app.service?.department || 'Unknown';
          if (!deptMap[dept]) {
            deptColorMap[dept] = deptColors[colorIdx % deptColors.length];
            colorIdx++;
            deptMap[dept] = { name: dept, total: 0, pending: 0, processing: 0, approved: 0, rejected: 0, issued: 0, revenue: 0, avgDays: 0, color: deptColorMap[dept] };
          }
          deptMap[dept].total++;
          if (app.status === 'payment_pending' || app.status === 'submitted') deptMap[dept].pending++;
          if (app.status === 'processing') deptMap[dept].processing++;
          if (app.status === 'approved') deptMap[dept].approved++;
          if (app.status === 'rejected') deptMap[dept].rejected++;
          if (app.status === 'issued') deptMap[dept].issued++;
          if (app.paymentStatus === 'paid') deptMap[dept].revenue += app.paymentAmount || 0;
        });

        // Calculate avg processing time per dept
        Object.values(deptMap).forEach(dept => {
          const completed = applications.filter((a: any) =>
            a.service?.department === dept.name && a.reviewedAt && a.status !== 'payment_pending'
          );
          if (completed.length > 0) {
            const totalDays = completed.reduce((sum: number, a: any) => {
              const diff = new Date(a.reviewedAt).getTime() - new Date(a.createdAt).getTime();
              return sum + diff / (1000 * 60 * 60 * 24);
            }, 0);
            dept.avgDays = Math.round(totalDays / completed.length * 10) / 10;
          }
        });

        setDepartments(Object.values(deptMap).sort((a, b) => b.total - a.total));

        // Monthly data
        const monthMap: Record<string, MonthlyData> = {};
        applications.forEach((app: any) => {
          const d = new Date(app.createdAt);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          if (!monthMap[key]) monthMap[key] = { month: monthLabel, applications: 0, revenue: 0 };
          monthMap[key].applications++;
          if (app.paymentStatus === 'paid') monthMap[key].revenue += app.paymentAmount || 0;
        });
        setMonthlyData(Object.entries(monthMap).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v));

        // Category data
        const catMap: Record<string, number> = {};
        applications.forEach((app: any) => {
          const cat = app.service?.category || 'Other';
          catMap[cat] = (catMap[cat] || 0) + 1;
        });
        setCategoryData(Object.entries(catMap).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-800 rounded-xl" />
          <div className="h-80 bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  const totalApps = departments.reduce((s, d) => s + d.total, 0);
  const totalRevenue = departments.reduce((s, d) => s + d.revenue, 0);
  const totalIssued = departments.reduce((s, d) => s + d.issued, 0);
  const totalPending = departments.reduce((s, d) => s + d.pending + d.processing, 0);
  const avgAllDays = departments.length > 0
    ? Math.round(departments.reduce((s, d) => s + d.avgDays, 0) / departments.filter(d => d.avgDays > 0).length * 10) / 10
    : 0;

  return (
    <div className="space-y-6 section-enter">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Performance overview by ministry and department</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Applications', value: totalApps, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Pending/Active', value: totalPending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          { label: 'Documents Issued', value: totalIssued, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-[#FFD100]', bg: 'bg-[#FFD100]/10' },
          { label: 'Avg Processing', value: `${avgAllDays} days`, icon: TrendingUp, color: 'text-sky-400', bg: 'bg-sky-400/10' },
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

      {/* Department Performance Table */}
      <Card className="bg-[#131F2E] border-[#1E3A5F]">
        <CardContent className="p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-400" />
            Department Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs uppercase border-b border-[#1E3A5F]">
                  <th className="text-left pb-3 font-medium">Department</th>
                  <th className="text-center pb-3 font-medium">Total</th>
                  <th className="text-center pb-3 font-medium">Pending</th>
                  <th className="text-center pb-3 font-medium">Processing</th>
                  <th className="text-center pb-3 font-medium">Approved</th>
                  <th className="text-center pb-3 font-medium">Rejected</th>
                  <th className="text-center pb-3 font-medium">Issued</th>
                  <th className="text-right pb-3 font-medium">Revenue</th>
                  <th className="text-center pb-3 font-medium">Avg Days</th>
                  <th className="text-center pb-3 font-medium">Rate</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => {
                  const rate = dept.total > 0 ? Math.round(((dept.approved + dept.issued) / dept.total) * 100) : 0;
                  return (
                    <tr key={dept.name} className="border-t border-[#1E3A5F]/50 hover:bg-[#182A3D]/30">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-6 rounded-full" style={{ backgroundColor: dept.color }} />
                          <span className="text-white font-medium text-xs">{dept.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-center text-white font-medium">{dept.total}</td>
                      <td className="py-3 text-center text-amber-400">{dept.pending}</td>
                      <td className="py-3 text-center text-sky-400">{dept.processing}</td>
                      <td className="py-3 text-center text-emerald-400">{dept.approved}</td>
                      <td className="py-3 text-center text-red-400">{dept.rejected}</td>
                      <td className="py-3 text-center text-emerald-300 font-medium">{dept.issued}</td>
                      <td className="py-3 text-right text-[#FFD100] font-medium">${dept.revenue.toLocaleString()}</td>
                      <td className="py-3 text-center text-gray-300">{dept.avgDays > 0 ? dept.avgDays : '-'}</td>
                      <td className="py-3 text-center">
                        <Badge className={`text-[10px] ${rate >= 80 ? 'bg-emerald-400/10 text-emerald-400' : rate >= 50 ? 'bg-amber-400/10 text-amber-400' : 'bg-red-400/10 text-red-400'}`}>
                          {rate}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Department */}
        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-5">
            <h3 className="text-white font-semibold mb-4">Revenue by Department</h3>
            {departments.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departments.map(d => ({ name: d.name.length > 20 ? d.name.substring(0, 20) + '...' : d.name, fullName: d.name, revenue: d.revenue }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
                  <XAxis type="number" stroke="#64748B" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" stroke="#64748B" tick={{ fontSize: 10 }} width={130} />
                  <Tooltip
                    contentStyle={{ background: '#182A3D', border: '1px solid #1E3A5F', borderRadius: '8px', color: '#fff' }}
                    formatter={(value: number) => [`$${value}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                    {departments.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm">No data</div>
            )}
          </CardContent>
        </Card>

        {/* Applications by Category */}
        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-5">
            <h3 className="text-white font-semibold mb-4">Applications by Category</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#182A3D', border: '1px solid #1E3A5F', borderRadius: '8px', color: '#fff' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm">No data</div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        {monthlyData.length > 0 && (
          <Card className="bg-[#131F2E] border-[#1E3A5F] lg:col-span-2">
            <CardContent className="p-5">
              <h3 className="text-white font-semibold mb-4">Monthly Applications Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
                  <XAxis dataKey="month" stroke="#64748B" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#182A3D', border: '1px solid #1E3A5F', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="applications" fill="#009B3A" radius={[4, 4, 0, 0]} name="Applications" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
