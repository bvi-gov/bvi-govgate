'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Calculator,
  ArrowLeft,
  DollarSign,
  FileText,
  Building2,
  AlertTriangle,
  CreditCard,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  Download,
  Eye,
  BarChart3,
  PieChart,
  Users,
  ClipboardCheck,
  Shield,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const STATS = [
  {
    label: 'Total Revenue',
    value: '$2.8M',
    change: '+12.5%',
    trend: 'up' as const,
    icon: DollarSign,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  {
    label: 'Tax Returns',
    value: '3,201',
    change: '+8.3%',
    trend: 'up' as const,
    icon: FileText,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  {
    label: 'Businesses Registered',
    value: '892',
    change: '+5.1%',
    trend: 'up' as const,
    icon: Building2,
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
  },
  {
    label: 'Pending Audits',
    value: '47',
    change: '-3.2%',
    trend: 'down' as const,
    icon: AlertTriangle,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
  },
  {
    label: 'Payment Plans Active',
    value: '156',
    change: '+2.7%',
    trend: 'up' as const,
    icon: CreditCard,
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
  },
];

const REVENUE_BREAKDOWN = [
  { category: 'Income Tax', amount: '$1,240,000', percentage: 44.3, color: 'bg-amber-400' },
  { category: 'Trade License Fees', amount: '$680,000', percentage: 24.3, color: 'bg-amber-500' },
  { category: 'Business Tax', amount: '$420,000', percentage: 15.0, color: 'bg-amber-600' },
  { category: 'Property Tax', amount: '$310,000', percentage: 11.1, color: 'bg-yellow-500' },
  { category: 'Stamp Duties', amount: '$150,000', percentage: 5.3, color: 'bg-yellow-600' },
];

const MONTHLY_COLLECTIONS = [
  { month: 'Jul', amount: 180 },
  { month: 'Aug', amount: 220 },
  { month: 'Sep', amount: 195 },
  { month: 'Oct', amount: 240 },
  { month: 'Nov', amount: 310 },
  { month: 'Dec', amount: 280 },
  { month: 'Jan', amount: 350 },
  { month: 'Feb', amount: 290 },
  { month: 'Mar', amount: 330 },
  { month: 'Apr', amount: 410 },
  { month: 'May', amount: 380 },
  { month: 'Jun', amount: 460 },
];

const RECENT_TRANSACTIONS = [
  { id: 'TXN-7841', taxpayer: 'Tropical Sun Ltd.', type: 'Corporate Tax', amount: '$45,200', date: '2025-01-15', status: 'Completed' },
  { id: 'TXN-7840', taxpayer: 'Mark Richardson', type: 'Income Tax', amount: '$12,800', date: '2025-01-15', status: 'Completed' },
  { id: 'TXN-7839', taxpayer: 'Coral Bay Enterprises', type: 'Trade License', amount: '$8,500', date: '2025-01-14', status: 'Pending' },
  { id: 'TXN-7838', taxpayer: 'Sarah Waters', type: 'Property Tax', amount: '$3,400', date: '2025-01-14', status: 'Completed' },
  { id: 'TXN-7837', taxpayer: 'BVI Logistics Corp.', type: 'Business Tax', amount: '$67,900', date: '2025-01-13', status: 'Failed' },
  { id: 'TXN-7836', taxpayer: 'David Chen', type: 'Income Tax', amount: '$9,150', date: '2025-01-13', status: 'Completed' },
  { id: 'TXN-7835', taxpayer: 'Island Trading Co.', type: 'Corporate Tax', amount: '$28,600', date: '2025-01-12', status: 'Completed' },
];

const TRADE_LICENSES = [
  { id: 'TL-2025-001', businessName: 'Tropical Sun Restaurant', type: 'Food & Beverage', status: 'Active', fee: '$4,200', expiryDate: '2025-12-31', district: 'Road Town' },
  { id: 'TL-2025-002', businessName: 'Coral Bay Diving Center', type: 'Recreation', status: 'Active', fee: '$3,800', expiryDate: '2025-09-15', district: 'Coral Bay' },
  { id: 'TL-2025-003', businessName: 'BVI Tech Solutions', type: 'Professional Services', status: 'Pending Renewal', fee: '$2,500', expiryDate: '2025-02-28', district: 'Road Town' },
  { id: 'TL-2025-004', businessName: 'Paradise Gift Shop', type: 'Retail', status: 'Active', fee: '$1,800', expiryDate: '2025-11-30', district: 'Spanish Town' },
  { id: 'TL-2025-005', businessName: 'Caribbean Construction Ltd.', type: 'Construction', status: 'Active', fee: '$6,200', expiryDate: '2025-08-20', district: 'East End' },
  { id: 'TL-2025-006', businessName: 'Sunny Side Grocery', type: 'Retail', status: 'Expired', fee: '$2,100', expiryDate: '2024-12-31', district: 'Road Town' },
  { id: 'TL-2025-007', businessName: 'Marina Yacht Services', type: 'Marine Services', status: 'Active', fee: '$5,400', expiryDate: '2025-10-15', district: 'West End' },
  { id: 'TL-2025-008', businessName: 'Island Insurance Agency', type: 'Financial Services', status: 'Pending Renewal', fee: '$3,200', expiryDate: '2025-03-15', district: 'Road Town' },
];

const TAX_ASSESSMENTS = [
  { id: 'TA-2025-101', taxpayer: 'Tropical Sun Ltd.', type: 'Corporate', year: 2024, assessed: '$145,000', paid: '$145,000', status: 'Paid', dueDate: '2025-03-31' },
  { id: 'TA-2025-102', taxpayer: 'Mark Richardson', type: 'Individual', year: 2024, assessed: '$28,500', paid: '$15,000', status: 'Partial', dueDate: '2025-04-30' },
  { id: 'TA-2025-103', taxpayer: 'Coral Bay Enterprises', type: 'Corporate', year: 2024, assessed: '$92,000', paid: '$0', status: 'Overdue', dueDate: '2025-01-15' },
  { id: 'TA-2025-104', taxpayer: 'Sarah Waters', type: 'Individual', year: 2024, assessed: '$18,200', paid: '$18,200', status: 'Paid', dueDate: '2025-03-31' },
  { id: 'TA-2025-105', taxpayer: 'BVI Logistics Corp.', type: 'Corporate', year: 2024, assessed: '$210,000', paid: '$105,000', status: 'Partial', dueDate: '2025-04-30' },
  { id: 'TA-2025-106', taxpayer: 'David Chen', type: 'Individual', year: 2024, assessed: '$42,000', paid: '$0', status: 'Overdue', dueDate: '2025-01-15' },
  { id: 'TA-2025-107', taxpayer: 'Island Trading Co.', type: 'Corporate', year: 2024, assessed: '$78,500', paid: '$78,500', status: 'Paid', dueDate: '2025-03-31' },
  { id: 'TA-2025-108', taxpayer: 'Jennifer Morris', type: 'Individual', year: 2023, assessed: '$9,800', paid: '$0', status: 'Overdue', dueDate: '2024-04-30' },
];

const REGISTERED_BUSINESSES = [
  { id: 'BR-2024-001', companyName: 'Tropical Sun Ltd.', regNumber: 'BVI-2024-00142', type: 'Corp', regDate: '2024-01-15', status: 'Active', annualFee: 'Paid' },
  { id: 'BR-2024-002', companyName: 'Coral Bay Enterprises', regNumber: 'BVI-2024-00098', type: 'LLC', regDate: '2024-02-20', status: 'Active', annualFee: 'Paid' },
  { id: 'BR-2024-003', companyName: 'Richardson Consulting', regNumber: 'BVI-2024-00156', type: 'Sole Prop', regDate: '2024-03-08', status: 'Active', annualFee: 'Pending' },
  { id: 'BR-2023-004', companyName: 'BVI Logistics Corp.', regNumber: 'BVI-2023-00231', type: 'Corp', regDate: '2023-06-12', status: 'Active', annualFee: 'Paid' },
  { id: 'BR-2023-005', companyName: 'Island Trading Co.', regNumber: 'BVI-2023-00189', type: 'LLC', regDate: '2023-08-25', status: 'Active', annualFee: 'Paid' },
  { id: 'BR-2023-006', companyName: 'Sunset Beach Rentals', regNumber: 'BVI-2023-00312', type: 'LLC', regDate: '2023-04-01', status: 'Inactive', annualFee: 'Overdue' },
  { id: 'BR-2022-007', companyName: 'Blue Ocean Charters', regNumber: 'BVI-2022-00045', type: 'Corp', regDate: '2022-11-10', status: 'Dissolved', annualFee: 'N/A' },
  { id: 'BR-2024-008', companyName: 'Green Island Organics', regNumber: 'BVI-2024-00210', type: 'Sole Prop', regDate: '2024-05-18', status: 'Active', annualFee: 'Pending' },
];

const AUDIT_CASES = [
  { id: 'AUD-2025-001', business: 'Tropical Sun Ltd.', type: 'Routine', auditor: 'James Hamilton', startDate: '2025-01-10', status: 'In Progress', riskLevel: 'Low' },
  { id: 'AUD-2025-002', business: 'Coral Bay Enterprises', type: 'Complaint', auditor: 'Lisa Penn', startDate: '2025-01-05', status: 'In Progress', riskLevel: 'High' },
  { id: 'AUD-2025-003', business: 'BVI Logistics Corp.', type: 'Random', auditor: 'Michael Walker', startDate: '2025-01-20', status: 'Scheduled', riskLevel: 'Medium' },
  { id: 'AUD-2025-004', business: 'Island Trading Co.', type: 'Routine', auditor: 'Sarah Flemming', startDate: '2024-10-01', status: 'Completed', riskLevel: 'Low' },
  { id: 'AUD-2025-005', business: 'Caribbean Construction Ltd.', type: 'Complaint', auditor: 'James Hamilton', startDate: '2024-11-15', status: 'Findings', riskLevel: 'High' },
  { id: 'AUD-2025-006', business: 'Marina Yacht Services', type: 'Routine', auditor: 'Lisa Penn', startDate: '2025-02-01', status: 'Scheduled', riskLevel: 'Medium' },
  { id: 'AUD-2025-007', business: 'David Chen (Individual)', type: 'Random', auditor: 'Michael Walker', startDate: '2024-09-10', status: 'Completed', riskLevel: 'Low' },
  { id: 'AUD-2025-008', business: 'Paradise Gift Shop', type: 'Complaint', auditor: 'Sarah Flemming', startDate: '2024-12-20', status: 'Findings', riskLevel: 'Medium' },
];

const TOP_CONTRIBUTORS = [
  { name: 'BVI Logistics Corp.', amount: '$210,000', percentage: 7.5 },
  { name: 'Tropical Sun Ltd.', amount: '$145,000', percentage: 5.2 },
  { name: 'Coral Bay Enterprises', amount: '$92,000', percentage: 3.3 },
  { name: 'Island Trading Co.', amount: '$78,500', percentage: 2.8 },
  { name: 'Caribbean Construction Ltd.', amount: '$65,000', percentage: 2.3 },
];

const QUARTERLY_REVENUE = [
  { quarter: 'Q1 2024', amount: '$580,000', change: '+6.2%', trend: 'up' as const },
  { quarter: 'Q2 2024', amount: '$650,000', change: '+12.1%', trend: 'up' as const },
  { quarter: 'Q3 2024', amount: '$720,000', change: '+10.8%', trend: 'up' as const },
  { quarter: 'Q4 2024', amount: '$850,000', change: '+18.1%', trend: 'up' as const },
];

// ─── Status badge helpers ────────────────────────────────────────────────────

function getStatusBadge(status: string) {
  const map: Record<string, { className: string; icon: React.ComponentType<{ className?: string }> }> = {
    Active: { className: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/20', icon: CheckCircle2 },
    Completed: { className: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/20', icon: CheckCircle2 },
    Paid: { className: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/20', icon: CheckCircle2 },
    Expired: { className: 'bg-red-400/15 text-red-400 border-red-400/20', icon: XCircle },
    Overdue: { className: 'bg-red-400/15 text-red-400 border-red-400/20', icon: XCircle },
    Failed: { className: 'bg-red-400/15 text-red-400 border-red-400/20', icon: XCircle },
    Dissolved: { className: 'bg-gray-400/15 text-gray-400 border-gray-400/20', icon: XCircle },
    Inactive: { className: 'bg-gray-400/15 text-gray-400 border-gray-400/20', icon: Clock },
    'N/A': { className: 'bg-gray-400/15 text-gray-400 border-gray-400/20', icon: XCircle },
    'Pending Renewal': { className: 'bg-amber-400/15 text-amber-400 border-amber-400/20', icon: Clock },
    Pending: { className: 'bg-amber-400/15 text-amber-400 border-amber-400/20', icon: Clock },
    Partial: { className: 'bg-orange-400/15 text-orange-400 border-orange-400/20', icon: AlertTriangle },
    Scheduled: { className: 'bg-sky-400/15 text-sky-400 border-sky-400/20', icon: Clock },
    'In Progress': { className: 'bg-blue-400/15 text-blue-400 border-blue-400/20', icon: TrendingUp },
    Findings: { className: 'bg-violet-400/15 text-violet-400 border-violet-400/20', icon: ClipboardCheck },
  };
  const config = map[status] || { className: 'bg-gray-400/15 text-gray-400 border-gray-400/20', icon: Clock };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.className}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

function getRiskBadge(level: string) {
  const map: Record<string, string> = {
    Low: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/20',
    Medium: 'bg-amber-400/15 text-amber-400 border-amber-400/20',
    High: 'bg-red-400/15 text-red-400 border-red-400/20',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${map[level] || map.Low}`}>
      <Shield className="w-3 h-3" />
      {level}
    </span>
  );
}

function getFeeBadge(status: string) {
  const map: Record<string, string> = {
    Paid: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/20',
    Pending: 'bg-amber-400/15 text-amber-400 border-amber-400/20',
    Overdue: 'bg-red-400/15 text-red-400 border-red-400/20',
    'N/A': 'bg-gray-400/15 text-gray-400 border-gray-400/20',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${map[status] || map['N/A']}`}>
      {status}
    </span>
  );
}

// ─── Tabs Definition ─────────────────────────────────────────────────────────

type TabId = 'overview' | 'trade-licenses' | 'tax-collection' | 'business-registry' | 'audit-management' | 'financial-reports';

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabDef[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'trade-licenses', label: 'Trade Licenses', icon: Building2 },
  { id: 'tax-collection', label: 'Tax Collection', icon: DollarSign },
  { id: 'business-registry', label: 'Business Registry', icon: FileText },
  { id: 'audit-management', label: 'Audit Mgmt', icon: ClipboardCheck },
  { id: 'financial-reports', label: 'Financial Reports', icon: TrendingUp },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export function AdminMinistryRevenue() {
  const { goBack } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const maxCollection = Math.max(...MONTHLY_COLLECTIONS.map((m) => m.amount));

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="h-10 w-10 rounded-xl bg-[#131F2E] border border-[#1E3A5F] text-gray-400 hover:text-white hover:bg-[#1E3A5F] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Inland Revenue Department</h1>
              <p className="text-sm text-gray-400">
                Tax collection, business licensing, auditing &amp; revenue management
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-[#131F2E] border-[#1E3A5F] text-gray-300 hover:text-white hover:bg-[#1E3A5F] transition-colors"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export
          </Button>
          <Button
            size="sm"
            className="bg-amber-500 text-black hover:bg-amber-400 font-medium transition-colors"
          >
            <Search className="w-4 h-4 mr-1.5" />
            Search Records
          </Button>
        </div>
      </div>

      {/* ─── Stats Row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-[#131F2E] border-[#1E3A5F] hover:border-amber-400/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-red-400" />
                  )}
                  <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">vs last quarter</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ─── Tabs ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-amber-400/15 text-amber-400 border border-amber-400/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#131F2E] border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── Tab Content ─────────────────────────────────────────────────── */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'trade-licenses' && <TradeLicensesTab />}
      {activeTab === 'tax-collection' && <TaxCollectionTab />}
      {activeTab === 'business-registry' && <BusinessRegistryTab />}
      {activeTab === 'audit-management' && <AuditManagementTab />}
      {activeTab === 'financial-reports' && <FinancialReportsTab />}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const maxCollection = Math.max(...MONTHLY_COLLECTIONS.map((m) => m.amount));

  return (
    <div className="space-y-6">
      {/* Revenue Breakdown & Monthly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Revenue by Category</h3>
              </div>
              <Badge variant="outline" className="border-[#1E3A5F] text-gray-400 text-xs">
                FY 2024/25
              </Badge>
            </div>
            <div className="space-y-4">
              {REVENUE_BREAKDOWN.map((item) => (
                <div key={item.category} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{item.category}</span>
                    <span className="text-sm font-semibold text-white">{item.amount}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#0C1B2A] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-700`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Collection Trend */}
        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Monthly Collections (×$1K)</h3>
              </div>
              <Badge variant="outline" className="border-[#1E3A5F] text-gray-400 text-xs">
                Last 12 months
              </Badge>
            </div>
            <div className="flex items-end gap-2 h-52">
              {MONTHLY_COLLECTIONS.map((item) => {
                const heightPct = (item.amount / maxCollection) * 100;
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-xs text-gray-400 font-medium">{item.amount}</span>
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-amber-500 to-amber-400 transition-all duration-700"
                        style={{ height: `${heightPct}%`, minHeight: '8px' }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="bg-[#131F2E] border-[#1E3A5F]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
            </div>
            <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300 text-xs">
              View All
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E3A5F]">
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Taxpayer</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-right py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {RECENT_TRANSACTIONS.map((tx) => (
                  <tr key={tx.id} className="border-b border-[#1E3A5F]/50 hover:bg-[#0C1B2A]/50 transition-colors">
                    <td className="py-3 px-2 text-amber-400 font-mono text-xs">{tx.id}</td>
                    <td className="py-3 px-2 text-gray-200 font-medium">{tx.taxpayer}</td>
                    <td className="py-3 px-2 text-gray-400">{tx.type}</td>
                    <td className="py-3 px-2 text-right text-white font-semibold">{tx.amount}</td>
                    <td className="py-3 px-2 text-gray-400">{tx.date}</td>
                    <td className="py-3 px-2">{getStatusBadge(tx.status)}</td>
                    <td className="py-3 px-2 text-right">
                      <button className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#1E3A5F] transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
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

// ─── Trade Licenses Tab ──────────────────────────────────────────────────────

function TradeLicensesTab() {
  return (
    <Card className="bg-[#131F2E] border-[#1E3A5F]">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Trade License Applications</h3>
            <Badge variant="outline" className="border-[#1E3A5F] text-gray-400 text-xs">
              {TRADE_LICENSES.length} records
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search licenses..."
                className="h-8 pl-8 pr-3 rounded-lg bg-[#0C1B2A] border border-[#1E3A5F] text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-400/50 transition-colors"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-[#0C1B2A] border-[#1E3A5F] text-gray-300 hover:text-white hover:bg-[#1E3A5F] text-xs"
            >
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              Filter
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E3A5F]">
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">License ID</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                <th className="text-right py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {TRADE_LICENSES.map((lic) => (
                <tr key={lic.id} className="border-b border-[#1E3A5F]/50 hover:bg-[#0C1B2A]/50 transition-colors">
                  <td className="py-3 px-2 text-amber-400 font-mono text-xs">{lic.id}</td>
                  <td className="py-3 px-2 text-gray-200 font-medium">{lic.businessName}</td>
                  <td className="py-3 px-2 text-gray-400">{lic.type}</td>
                  <td className="py-3 px-2 text-gray-400">{lic.district}</td>
                  <td className="py-3 px-2 text-right text-white font-semibold">{lic.fee}</td>
                  <td className="py-3 px-2 text-gray-400">{lic.expiryDate}</td>
                  <td className="py-3 px-2">{getStatusBadge(lic.status)}</td>
                  <td className="py-3 px-2 text-right">
                    <button className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#1E3A5F] transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Tax Collection Tab ──────────────────────────────────────────────────────

function TaxCollectionTab() {
  return (
    <Card className="bg-[#131F2E] border-[#1E3A5F]">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Tax Assessments</h3>
            <Badge variant="outline" className="border-[#1E3A5F] text-gray-400 text-xs">
              {TAX_ASSESSMENTS.length} records
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search assessments..."
                className="h-8 pl-8 pr-3 rounded-lg bg-[#0C1B2A] border border-[#1E3A5F] text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-400/50 transition-colors"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-[#0C1B2A] border-[#1E3A5F] text-gray-300 hover:text-white hover:bg-[#1E3A5F] text-xs"
            >
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              Filter
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E3A5F]">
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Taxpayer</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="text-right py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Assessed</th>
                <th className="text-right py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="text-right py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {TAX_ASSESSMENTS.map((tax) => {
                const isOverdue = tax.status === 'Overdue';
                return (
                  <tr
                    key={tax.id}
                    className={`border-b border-[#1E3A5F]/50 hover:bg-[#0C1B2A]/50 transition-colors ${
                      isOverdue ? 'bg-red-500/5' : ''
                    }`}
                  >
                    <td className="py-3 px-2 text-amber-400 font-mono text-xs">{tax.id}</td>
                    <td className={`py-3 px-2 font-medium ${isOverdue ? 'text-red-300' : 'text-gray-200'}`}>
                      {tax.taxpayer}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          tax.type === 'Corporate'
                            ? 'bg-sky-400/10 text-sky-400'
                            : 'bg-violet-400/10 text-violet-400'
                        }`}
                      >
                        {tax.type}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-400">{tax.year}</td>
                    <td className={`py-3 px-2 text-right font-semibold ${isOverdue ? 'text-red-300' : 'text-white'}`}>
                      {tax.assessed}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-300">{tax.paid}</td>
                    <td className="py-3 px-2">{getStatusBadge(tax.status)}</td>
                    <td className={`py-3 px-2 ${isOverdue ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                      {tax.dueDate}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#1E3A5F] transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Business Registry Tab ───────────────────────────────────────────────────

function BusinessRegistryTab() {
  return (
    <Card className="bg-[#131F2E] border-[#1E3A5F]">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Registered Businesses</h3>
            <Badge variant="outline" className="border-[#1E3A5F] text-gray-400 text-xs">
              {REGISTERED_BUSINESSES.length} records
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search businesses..."
                className="h-8 pl-8 pr-3 rounded-lg bg-[#0C1B2A] border border-[#1E3A5F] text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-400/50 transition-colors"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-[#0C1B2A] border-[#1E3A5F] text-gray-300 hover:text-white hover:bg-[#1E3A5F] text-xs"
            >
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              Filter
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E3A5F]">
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Reg. #</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Reg. Date</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Annual Fee</th>
                <th className="text-right py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {REGISTERED_BUSINESSES.map((biz) => (
                <tr key={biz.id} className="border-b border-[#1E3A5F]/50 hover:bg-[#0C1B2A]/50 transition-colors">
                  <td className="py-3 px-2 text-amber-400 font-mono text-xs">{biz.regNumber}</td>
                  <td className="py-3 px-2 text-gray-200 font-medium">{biz.companyName}</td>
                  <td className="py-3 px-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        biz.type === 'Corp'
                          ? 'bg-sky-400/10 text-sky-400'
                          : biz.type === 'LLC'
                          ? 'bg-emerald-400/10 text-emerald-400'
                          : 'bg-violet-400/10 text-violet-400'
                      }`}
                    >
                      {biz.type}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-400">{biz.regDate}</td>
                  <td className="py-3 px-2">{getStatusBadge(biz.status)}</td>
                  <td className="py-3 px-2">{getFeeBadge(biz.annualFee)}</td>
                  <td className="py-3 px-2 text-right">
                    <button className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#1E3A5F] transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Audit Management Tab ────────────────────────────────────────────────────

function AuditManagementTab() {
  return (
    <Card className="bg-[#131F2E] border-[#1E3A5F]">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Audit Cases</h3>
            <Badge variant="outline" className="border-[#1E3A5F] text-gray-400 text-xs">
              {AUDIT_CASES.length} cases
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audits..."
                className="h-8 pl-8 pr-3 rounded-lg bg-[#0C1B2A] border border-[#1E3A5F] text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-400/50 transition-colors"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-[#0C1B2A] border-[#1E3A5F] text-gray-300 hover:text-white hover:bg-[#1E3A5F] text-xs"
            >
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              Filter
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E3A5F]">
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Case ID</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Audit Type</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Auditor</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                <th className="text-right py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {AUDIT_CASES.map((audit) => (
                <tr key={audit.id} className="border-b border-[#1E3A5F]/50 hover:bg-[#0C1B2A]/50 transition-colors">
                  <td className="py-3 px-2 text-amber-400 font-mono text-xs">{audit.id}</td>
                  <td className="py-3 px-2 text-gray-200 font-medium">{audit.business}</td>
                  <td className="py-3 px-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        audit.type === 'Routine'
                          ? 'bg-sky-400/10 text-sky-400'
                          : audit.type === 'Random'
                          ? 'bg-violet-400/10 text-violet-400'
                          : 'bg-red-400/10 text-red-400'
                      }`}
                    >
                      {audit.type}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-300">{audit.auditor}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-gray-400">{audit.startDate}</td>
                  <td className="py-3 px-2">{getStatusBadge(audit.status)}</td>
                  <td className="py-3 px-2">{getRiskBadge(audit.riskLevel)}</td>
                  <td className="py-3 px-2 text-right">
                    <button className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#1E3A5F] transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Financial Reports Tab ───────────────────────────────────────────────────

function FinancialReportsTab() {
  return (
    <div className="space-y-6">
      {/* Quarterly Revenue Comparison */}
      <Card className="bg-[#131F2E] border-[#1E3A5F]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Quarterly Revenue Comparison</h3>
            </div>
            <Badge variant="outline" className="border-amber-400/30 text-amber-400 text-xs">
              FY 2024/25
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUARTERLY_REVENUE.map((q) => (
              <div
                key={q.quarter}
                className="rounded-lg border border-[#1E3A5F] bg-[#0C1B2A] p-4 hover:border-amber-400/30 transition-colors"
              >
                <div className="text-xs text-gray-500 font-medium mb-1">{q.quarter}</div>
                <div className="text-xl font-bold text-white">{q.amount}</div>
                <div className="flex items-center gap-1 mt-2">
                  {q.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-400" />
                  )}
                  <span className={`text-xs font-medium ${q.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {q.change}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">vs prev</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Contributors & Collection Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Tax Contributors */}
        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Top 5 Tax Contributors</h3>
              </div>
            </div>
            <div className="space-y-4">
              {TOP_CONTRIBUTORS.map((contributor, index) => (
                <div key={contributor.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                          index === 0
                            ? 'bg-amber-400/20 text-amber-400'
                            : index === 1
                            ? 'bg-gray-400/20 text-gray-300'
                            : 'bg-[#0C1B2A] text-gray-500'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-200 font-medium">{contributor.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-white">{contributor.amount}</span>
                    </div>
                  </div>
                  <div className="ml-8">
                    <div className="w-full h-1.5 rounded-full bg-[#0C1B2A] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          index === 0
                            ? 'bg-amber-400'
                            : index === 1
                            ? 'bg-amber-500'
                            : 'bg-amber-600'
                        }`}
                        style={{ width: `${(contributor.percentage / 7.5) * 100}%` }}
                      />
                    </div>
                    <div className="text-right mt-0.5">
                      <span className="text-xs text-gray-500">{contributor.percentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Collection Rate */}
        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Collection Rate</h3>
              </div>
            </div>

            <div className="space-y-6">
              {/* Main collection rate */}
              <div className="text-center py-4">
                <div className="text-5xl font-bold text-amber-400 mb-1">87.3%</div>
                <p className="text-sm text-gray-400">Overall Collection Rate</p>
                <p className="text-xs text-gray-500 mt-1">Target: 90%</p>
              </div>

              <div className="w-full h-3 rounded-full bg-[#0C1B2A] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-1000"
                  style={{ width: '87.3%' }}
                />
              </div>

              {/* Breakdown */}
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Income Tax</span>
                    <span className="text-sm font-semibold text-white">91.2%</span>
                  </div>
                  <Progress value={91.2} className="h-2 [&>[data-slot=progress-indicator]]:bg-amber-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Trade License</span>
                    <span className="text-sm font-semibold text-white">94.7%</span>
                  </div>
                  <Progress value={94.7} className="h-2 [&>[data-slot=progress-indicator]]:bg-emerald-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Business Tax</span>
                    <span className="text-sm font-semibold text-white">82.5%</span>
                  </div>
                  <Progress value={82.5} className="h-2 [&>[data-slot=progress-indicator]]:bg-sky-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Property Tax</span>
                    <span className="text-sm font-semibold text-white">76.8%</span>
                  </div>
                  <Progress value={76.8} className="h-2 [&>[data-slot=progress-indicator]]:bg-violet-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Stamp Duties</span>
                    <span className="text-sm font-semibold text-white">88.1%</span>
                  </div>
                  <Progress value={88.1} className="h-2 [&>[data-slot=progress-indicator]]:bg-orange-400" />
                </div>
              </div>

              {/* Collection summary */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1E3A5F]">
                <div>
                  <div className="text-lg font-bold text-emerald-400">$2.44M</div>
                  <div className="text-xs text-gray-500">Collected</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-400">$356K</div>
                  <div className="text-xs text-gray-500">Outstanding</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
