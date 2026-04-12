'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  Loader2,
  ArrowRight,
  Eye,
  Filter,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';

interface Application {
  id: string;
  trackingNumber: string;
  applicantName: string;
  applicantEmail: string;
  status: string;
  paymentStatus: string;
  paymentAmount: number;
  service: { name: string; icon: string; category: string; department: string };
  createdAt: string;
}

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'payment_pending', label: 'Payment Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'issued', label: 'Issued' },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  payment_pending: { label: 'Payment Pending', color: 'bg-amber-400/10 text-amber-400 border-amber-400/20' },
  submitted: { label: 'Submitted', color: 'bg-blue-400/10 text-blue-400 border-blue-400/20' },
  processing: { label: 'Processing', color: 'bg-sky-400/10 text-sky-400 border-sky-400/20' },
  approved: { label: 'Approved', color: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
  rejected: { label: 'Rejected', color: 'bg-red-400/10 text-red-400 border-red-400/20' },
  issued: { label: 'Issued', color: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
};

export function AdminQueue() {
  const { setCurrentView, setCurrentApplicationId } = useAppStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.set('status', activeTab);
      params.set('limit', '100');
      const res = await fetch(`/api/applications?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAllApplications(data.applications || []);
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique departments and services
  const departments = [...new Set(allApplications.map(a => a.service?.department).filter(Boolean))] as string[];
  const services = [...new Set(allApplications.map(a => a.service?.name).filter(Boolean))] as string[];

  // Apply all filters
  const filtered = applications.filter((app) => {
    // Search
    const name = (app.applicantName || '').toLowerCase();
    const email = (app.applicantEmail || '').toLowerCase();
    const tracking = (app.trackingNumber || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      name.includes(query) ||
      tracking.includes(query) ||
      email.includes(query);

    // Date range
    const appDate = app.createdAt ? new Date(app.createdAt) : null;
    const isValidDate = appDate && !isNaN(appDate.getTime());
    const matchesDateFrom = !dateFrom || (isValidDate && appDate >= new Date(dateFrom));
    const matchesDateTo = !dateTo || (isValidDate && appDate <= new Date(dateTo + 'T23:59:59'));

    // Month filter
    let matchesMonth = true;
    if (monthFilter && isValidDate) {
      const [year, month] = monthFilter.split('-').map(Number);
      matchesMonth = appDate.getFullYear() === year && (appDate.getMonth() + 1) === month;
    }

    // Department filter
    const matchesDepartment = departmentFilter === 'all' || app.service?.department === departmentFilter;

    // Service filter
    const matchesService = serviceFilter === 'all' || app.service?.name === serviceFilter;

    return matchesSearch && matchesDateFrom && matchesDateTo && matchesMonth && matchesDepartment && matchesService;
  });

  const handleView = (id: string) => {
    setCurrentApplicationId(id);
    setCurrentView('admin-processing');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setMonthFilter('');
    setDepartmentFilter('all');
    setServiceFilter('all');
  };

  const hasActiveFilters = dateFrom || dateTo || monthFilter || departmentFilter !== 'all' || serviceFilter !== 'all';

  return (
    <div className="space-y-6 section-enter">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Application Queue</h1>
        <p className="text-gray-400 text-sm mt-1">
          {filtered.length} of {applications.length} application{applications.length !== 1 ? 's' : ''} shown
          {hasActiveFilters && ' (filtered)'}
        </p>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.value
                  ? 'bg-[#009B3A] text-white'
                  : 'bg-[#131F2E] text-gray-400 hover:text-white hover:bg-[#182A3D]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search by name, email, or tracking #"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-[#131F2E] border-[#1E3A5F] text-white placeholder:text-gray-500 text-sm"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`border-[#1E3A5F] text-xs h-9 ${showAdvancedFilters ? 'bg-[#009B3A]/10 border-[#009B3A]/30 text-[#009B3A]' : 'text-gray-400'}`}
          >
            <Filter className="w-3.5 h-3.5 mr-1" />
            Filters
            {hasActiveFilters && (
              <Badge className="ml-1 bg-[#009B3A] text-white text-[10px] h-4 min-w-4 px-1">!</Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="bg-[#131F2E] border border-[#1E3A5F] rounded-xl p-4 space-y-3 section-enter">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Advanced Filters</h3>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="text-red-400 text-xs h-6 px-2">
                <X className="w-3 h-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Date range */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400">Date Range</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="pl-7 h-8 bg-[#0C1B2A] border-[#1E3A5F] text-white text-xs"
                  />
                </div>
                <span className="text-gray-500 text-xs">to</span>
                <div className="relative flex-1">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="pl-7 h-8 bg-[#0C1B2A] border-[#1E3A5F] text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Month quick filter */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400">Month / Year</label>
              <Input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="h-8 bg-[#0C1B2A] border-[#1E3A5F] text-white text-xs"
              />
            </div>

            {/* Department filter */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400">Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full h-8 bg-[#0C1B2A] border border-[#1E3A5F] text-white text-xs rounded-md px-2"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Service type filter */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400">Service Type</label>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full h-8 bg-[#0C1B2A] border border-[#1E3A5F] text-white text-xs rounded-md px-2"
              >
                <option value="all">All Services</option>
                {services.map(svc => (
                  <option key={svc} value={svc}>{svc}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#131F2E] border border-[#1E3A5F] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Search className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm">No applications found</p>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="text-gray-400 text-xs mt-2">
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0">
                <tr className="text-gray-400 text-xs uppercase bg-[#0C1B2A]">
                  <th className="text-left px-4 py-3 font-medium">Tracking #</th>
                  <th className="text-left px-4 py-3 font-medium">Applicant</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Service</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Payment</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Date</th>
                  <th className="text-right px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr
                    key={app.id}
                    className="border-t border-[#1E3A5F]/50 hover:bg-[#182A3D]/50 cursor-pointer transition-colors"
                    onClick={() => handleView(app.id)}
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-300">{app.trackingNumber}</td>
                    <td className="px-4 py-3.5">
                      <div className="text-white font-medium">{app.applicantName}</div>
                      <div className="text-xs text-gray-500">{app.applicantEmail}</div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-300 hidden md:table-cell">
                      <div>{app.service?.name}</div>
                      <div className="text-[10px] text-gray-500">{app.service?.department}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[app.status]?.color || ''}`}>
                        {statusConfig[app.status]?.label || app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className={`text-xs ${app.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {app.paymentStatus === 'paid' ? `Paid $${(app.paymentAmount || 0).toFixed(2)}` : `Unpaid $${(app.paymentAmount || 0).toFixed(2)}`}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs hidden lg:table-cell">
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#009B3A] hover:text-[#009B3A]/80 text-xs h-7"
                        onClick={(e) => { e.stopPropagation(); handleView(app.id); }}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
