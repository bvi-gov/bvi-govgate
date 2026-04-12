'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Building2,
  ArrowLeft,
  Users,
  FileCheck,
  TrendingUp,
  Clock,
  DollarSign,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Scale,
  FileWarning,
  Eye,
} from 'lucide-react';

// ── Mock Data ───────────────────────────────────────────────────────

const REGISTRATION_SUMMARY = [
  { type: 'Business Companies', count: 1842, percentage: 63.7, change: +4.2 },
  { type: 'LLCs', count: 456, percentage: 15.8, change: +2.1 },
  { type: 'Partnerships', count: 218, percentage: 7.5, change: -1.3 },
  { type: 'Trusts', count: 187, percentage: 6.5, change: +0.8 },
  { type: 'Investment Funds', count: 124, percentage: 4.3, change: +6.7 },
  { type: 'Other Entities', count: 63, percentage: 2.2, change: -0.5 },
];

const COMPLIANCE_TREND = [
  { month: 'Jul', score: 89 },
  { month: 'Aug', score: 91 },
  { month: 'Sep', score: 88 },
  { month: 'Oct', score: 92 },
  { month: 'Nov', score: 90 },
  { month: 'Dec', score: 93 },
  { month: 'Jan', score: 91 },
  { month: 'Feb', score: 94 },
];

const RECENT_REGULATORY_ACTIONS = [
  { id: 'RA-2025-0147', entity: 'Atlantis Capital Holdings', action: 'License renewal approved', date: '2025-01-22', type: 'approved' as const },
  { id: 'RA-2025-0146', entity: 'Caribbean Trust Services Ltd', action: 'Compliance audit initiated', date: '2025-01-21', type: 'audit' as const },
  { id: 'RA-2025-0145', entity: 'BVI Wealth Managers Inc', action: 'Warning issued for late filing', date: '2025-01-20', type: 'warning' as const },
  { id: 'RA-2025-0144', entity: 'Tortola Insurance Group', action: 'Capital adequacy review', date: '2025-01-19', type: 'review' as const },
  { id: 'RA-2025-0143', entity: 'Virgin Islands Fund SPC', action: 'Registration revoked', date: '2025-01-18', type: 'revoked' as const },
];

const COMPANIES = [
  { name: 'Atlantis Capital Holdings', regNumber: 'BC-2024-0891', type: 'LLC', agent: 'Trident Trust (BVI) Ltd', incDate: '2024-03-15', status: 'Active' as const, jurisdiction: 'BVI International' },
  { name: 'Caribbean Trust Services Ltd', regNumber: 'BC-2023-1245', type: 'Corp', agent: 'Maples Group', incDate: '2023-07-22', status: 'Active' as const, jurisdiction: 'BVI International' },
  { name: 'BVI Wealth Managers Inc', regNumber: 'BC-2022-0567', type: 'Corp', agent: 'OGIER (BVI) Ltd', incDate: '2022-11-03', status: 'Active' as const, jurisdiction: 'BVI International' },
  { name: 'Tortola Trading Co.', regNumber: 'BC-2024-1102', type: 'LLC', agent: 'BVI Financial Services', incDate: '2024-08-19', status: 'Active' as const, jurisdiction: 'BVI Domestic' },
  { name: 'Virgin Islands Fund SPC', regNumber: 'BC-2021-0345', type: 'Fund', agent: 'Walkers (BVI) Ltd', incDate: '2021-05-10', status: 'Struck Off' as const, jurisdiction: 'BVI International' },
  { name: 'Road Town Ventures Ltd', regNumber: 'BC-2024-0678', type: 'Partnership', agent: 'Harneys BVI', incDate: '2024-01-28', status: 'Active' as const, jurisdiction: 'BVI Domestic' },
  { name: 'Sageview Capital Partners', regNumber: 'BC-2023-0901', type: 'Trust', agent: 'Asiaciti Trust BVI', incDate: '2023-04-14', status: 'Active' as const, jurisdiction: 'BVI International' },
  { name: 'Island Life Insurance Co.', regNumber: 'BC-2020-0789', type: 'Corp', agent: 'Fidelity Services (BVI)', incDate: '2020-09-01', status: 'Inactive' as const, jurisdiction: 'BVI International' },
  { name: 'Coral Bay Holdings Ltd', regNumber: 'BC-2024-1345', type: 'LLC', agent: 'Vistra BVI Ltd', incDate: '2024-11-20', status: 'Active' as const, jurisdiction: 'BVI Domestic' },
  { name: 'Emerald Financial Advisory', regNumber: 'BC-2023-1567', type: 'Corp', agent: 'Conyers BVI', incDate: '2023-12-05', status: 'Active' as const, jurisdiction: 'BVI International' },
];

const COMPLIANCE_DATA = [
  { entity: 'Atlantis Capital Holdings', score: 98, lastFiling: '2025-01-10', nextDeadline: '2025-04-10', status: 'Compliant' as const, risk: 'Low' as const },
  { entity: 'Caribbean Trust Services Ltd', score: 87, lastFiling: '2024-12-28', nextDeadline: '2025-03-28', status: 'Compliant' as const, risk: 'Low' as const },
  { entity: 'BVI Wealth Managers Inc', score: 62, lastFiling: '2024-10-15', nextDeadline: '2025-01-15', status: 'Warning' as const, risk: 'Medium' as const },
  { entity: 'Tortola Trading Co.', score: 95, lastFiling: '2025-01-18', nextDeadline: '2025-04-18', status: 'Compliant' as const, risk: 'Low' as const },
  { entity: 'Tortola Insurance Group', score: 45, lastFiling: '2024-08-22', nextDeadline: '2025-01-05', status: 'Non-Compliant' as const, risk: 'Critical' as const },
  { entity: 'Road Town Ventures Ltd', score: 78, lastFiling: '2024-12-01', nextDeadline: '2025-03-01', status: 'Warning' as const, risk: 'Medium' as const },
  { entity: 'Sageview Capital Partners', score: 91, lastFiling: '2025-01-05', nextDeadline: '2025-04-05', status: 'Compliant' as const, risk: 'Low' as const },
  { entity: 'Coral Bay Holdings Ltd', score: 72, lastFiling: '2024-11-20', nextDeadline: '2025-02-20', status: 'Warning' as const, risk: 'Medium' as const },
  { entity: 'Emerald Financial Advisory', score: 34, lastFiling: '2024-06-10', nextDeadline: '2024-12-10', status: 'Non-Compliant' as const, risk: 'High' as const },
  { entity: 'Island Life Insurance Co.', score: 55, lastFiling: '2024-09-18', nextDeadline: '2025-01-08', status: 'Warning' as const, risk: 'High' as const },
];

const LICENSES = [
  { entity: 'Atlantis Capital Holdings', type: 'Investment', licenseNumber: 'FSC-INV-2024-0312', status: 'Active' as const, expiry: '2026-03-15' },
  { entity: 'Caribbean Trust Services Ltd', type: 'Trust', licenseNumber: 'FSC-TRU-2023-0178', status: 'Active' as const, expiry: '2025-07-22' },
  { entity: 'BVI Wealth Managers Inc', type: 'Fiduciary', licenseNumber: 'FSC-FID-2022-0045', status: 'Under Review' as const, expiry: '2025-11-03' },
  { entity: 'Tortola Insurance Group', type: 'Insurance', licenseNumber: 'FSC-INS-2021-0089', status: 'Suspended' as const, expiry: '2025-05-10' },
  { entity: 'BVI Global Bank Ltd', type: 'Banking', licenseNumber: 'FSC-BNK-2020-0012', status: 'Active' as const, expiry: '2025-12-31' },
  { entity: 'Sageview Capital Partners', type: 'Investment', licenseNumber: 'FSC-INV-2023-0256', status: 'Active' as const, expiry: '2026-04-14' },
  { entity: 'Emerald Financial Advisory', type: 'Fiduciary', licenseNumber: 'FSC-FID-2023-0298', status: 'Revoked' as const, expiry: '2024-12-05' },
  { entity: 'Coral Bay Holdings Ltd', type: 'Investment', licenseNumber: 'FSC-INV-2024-0412', status: 'Active' as const, expiry: '2026-11-20' },
  { entity: 'Paradise Wealth Fund', type: 'Investment', licenseNumber: 'FSC-INV-2022-0187', status: 'Active' as const, expiry: '2025-09-01' },
  { entity: 'Virgin Islands Credit Union', type: 'Banking', licenseNumber: 'FSC-BNK-2021-0023', status: 'Active' as const, expiry: '2026-06-30' },
];

const FILING_DEADLINES = [
  { entity: 'Atlantis Capital Holdings', filingType: 'Annual Return', dueDate: '2025-04-10', status: 'Upcoming' as const },
  { entity: 'BVI Wealth Managers Inc', filingType: 'Benefit Ownership', dueDate: '2025-01-15', status: 'Overdue' as const },
  { entity: 'Tortola Insurance Group', filingType: 'Audit Report', dueDate: '2025-01-05', status: 'Overdue' as const },
  { entity: 'Tortola Trading Co.', filingType: 'Financial Statement', dueDate: '2025-04-18', status: 'Upcoming' as const },
  { entity: 'Caribbean Trust Services Ltd', filingType: 'Annual Return', dueDate: '2025-03-28', status: 'Upcoming' as const },
  { entity: 'Road Town Ventures Ltd', filingType: 'Benefit Ownership', dueDate: '2025-03-01', status: 'Upcoming' as const },
  { entity: 'Emerald Financial Advisory', filingType: 'Audit Report', dueDate: '2024-12-10', status: 'Overdue' as const },
  { entity: 'Sageview Capital Partners', filingType: 'Financial Statement', dueDate: '2025-04-05', status: 'Upcoming' as const },
  { entity: 'BVI Global Bank Ltd', filingType: 'Annual Return', dueDate: '2025-03-31', status: 'Submitted' as const },
  { entity: 'Coral Bay Holdings Ltd', filingType: 'Benefit Ownership', dueDate: '2025-02-20', status: 'Submitted' as const },
  { entity: 'Paradise Wealth Fund', filingType: 'Audit Report', dueDate: '2025-05-15', status: 'Upcoming' as const },
  { entity: 'Island Life Insurance Co.', filingType: 'Financial Statement', dueDate: '2025-01-08', status: 'Overdue' as const },
];

const REGULATORY_ALERTS = [
  { id: 'ALR-2025-001', date: '2025-01-22', type: 'Directive' as const, entity: 'All Licensed Banks', description: 'New capital adequacy requirements effective Q2 2025. All banking licensees must submit updated capital plans by March 31.', severity: 'High' as const },
  { id: 'ALR-2025-002', date: '2025-01-20', type: 'Warning' as const, entity: 'BVI Wealth Managers Inc', description: 'Failure to submit Q4 2024 financial statements within the regulatory timeframe. Immediate compliance action required.', severity: 'High' as const },
  { id: 'ALR-2025-003', date: '2025-01-19', type: 'Fine' as const, entity: 'Emerald Financial Advisory', description: 'Regulatory fine of $25,000 imposed for non-compliance with AML/CFT reporting obligations over a 6-month period.', severity: 'High' as const },
  { id: 'ALR-2025-004', date: '2025-01-18', type: 'Suspension' as const, entity: 'Tortola Insurance Group', description: 'License suspended pending investigation into potential solvency concerns. Policyholder funds protected under FSC protocols.', severity: 'High' as const },
  { id: 'ALR-2025-005', date: '2025-01-17', type: 'Directive' as const, entity: 'All Investment Licensees', description: 'Updated beneficial ownership disclosure requirements. Enhanced verification procedures must be in place by February 28.', severity: 'Medium' as const },
  { id: 'ALR-2025-006', date: '2025-01-15', type: 'Warning' as const, entity: 'Island Life Insurance Co.', description: 'Advisory notice regarding delayed annual filing. Entity has 14 days to remedy or face escalation.', severity: 'Medium' as const },
  { id: 'ALR-2025-007', date: '2025-01-14', type: 'Fine' as const, entity: 'Coral Bay Holdings Ltd', description: 'Late filing penalty of $5,000 for delayed beneficial ownership declaration submission.', severity: 'Low' as const },
  { id: 'ALR-2025-008', date: '2025-01-12', type: 'Directive' as const, entity: 'All Licensed Entities', description: 'Annual regulatory fees for 2025 now due. Payment deadline: February 15, 2025.', severity: 'Info' as const },
  { id: 'ALR-2025-009', date: '2025-01-10', type: 'Warning' as const, entity: 'Road Town Ventures Ltd', description: 'Beneficial ownership information incomplete. Verification documentation required within 30 days.', severity: 'Low' as const },
  { id: 'ALR-2025-010', date: '2025-01-08', type: 'Suspension' as const, entity: 'Virgin Islands Fund SPC', description: 'Entity registration revoked due to failure to maintain a registered agent and failure to file annual returns for two consecutive years.', severity: 'Medium' as const },
];

// ── Helper Components ───────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    Active: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30',
    Inactive: 'bg-gray-400/15 text-gray-400 border-gray-400/30',
    'Struck Off': 'bg-red-400/15 text-red-400 border-red-400/30',
    Compliant: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30',
    Warning: 'bg-amber-400/15 text-amber-400 border-amber-400/30',
    'Non-Compliant': 'bg-red-400/15 text-red-400 border-red-400/30',
    Suspended: 'bg-red-400/15 text-red-400 border-red-400/30',
    Revoked: 'bg-red-400/15 text-red-400 border-red-400/30',
    'Under Review': 'bg-blue-400/15 text-blue-400 border-blue-400/30',
    Upcoming: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30',
    Overdue: 'bg-red-400/15 text-red-400 border-red-400/30',
    Submitted: 'bg-gray-400/15 text-gray-400 border-gray-400/30',
  };
  return (
    <Badge variant="outline" className={variants[status] || 'bg-gray-400/15 text-gray-400 border-gray-400/30'}>
      {status}
    </Badge>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  const variants: Record<string, string> = {
    Low: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30',
    Medium: 'bg-amber-400/15 text-amber-400 border-amber-400/30',
    High: 'bg-orange-400/15 text-orange-400 border-orange-400/30',
    Critical: 'bg-red-400/15 text-red-400 border-red-400/30',
  };
  return (
    <Badge variant="outline" className={variants[risk] || 'bg-gray-400/15 text-gray-400 border-gray-400/30'}>
      {risk === 'Critical' && <AlertCircle className="w-3 h-3 mr-1" />}
      {risk}
    </Badge>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const variants: Record<string, string> = {
    Info: 'bg-blue-400/15 text-blue-400 border-blue-400/30',
    Low: 'bg-amber-400/15 text-amber-400 border-amber-400/30',
    Medium: 'bg-orange-400/15 text-orange-400 border-orange-400/30',
    High: 'bg-red-400/15 text-red-400 border-red-400/30',
  };
  const icons: Record<string, React.ReactNode> = {
    Info: <Info className="w-3 h-3" />,
    Low: <AlertTriangle className="w-3 h-3" />,
    Medium: <AlertCircle className="w-3 h-3" />,
    High: <XCircle className="w-3 h-3" />,
  };
  return (
    <Badge variant="outline" className={variants[severity] || 'bg-gray-400/15 text-gray-400 border-gray-400/30'}>
      {icons[severity]}
      {severity}
    </Badge>
  );
}

function AlertTypeBadge({ type }: { type: string }) {
  const variants: Record<string, string> = {
    Warning: 'bg-amber-400/15 text-amber-400 border-amber-400/30',
    Directive: 'bg-purple-400/15 text-purple-400 border-purple-400/30',
    Fine: 'bg-red-400/15 text-red-400 border-red-400/30',
    Suspension: 'bg-red-400/15 text-red-400 border-red-400/30',
  };
  const icons: Record<string, React.ReactNode> = {
    Warning: <AlertTriangle className="w-3 h-3" />,
    Directive: <Scale className="w-3 h-3" />,
    Fine: <DollarSign className="w-3 h-3" />,
    Suspension: <XCircle className="w-3 h-3" />,
  };
  return (
    <Badge variant="outline" className={variants[type] || 'bg-gray-400/15 text-gray-400 border-gray-400/30'}>
      {icons[type]}
      {type}
    </Badge>
  );
}

function ComplianceScoreBar({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 85) return 'bg-emerald-500';
    if (s >= 70) return 'bg-amber-500';
    if (s >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };
  const getTextColor = (s: number) => {
    if (s >= 85) return 'text-emerald-400';
    if (s >= 70) return 'text-amber-400';
    if (s >= 50) return 'text-orange-400';
    return 'text-red-400';
  };
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 rounded-full bg-[#1E3A5F] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-xs font-semibold min-w-[32px] ${getTextColor(score)}`}>{score}%</span>
    </div>
  );
}

function ActionTypeTag({ type }: { type: string }) {
  const variants: Record<string, { color: string; icon: React.ReactNode }> = {
    approved: { color: 'text-emerald-400 bg-emerald-400/10', icon: <CheckCircle2 className="w-3 h-3" /> },
    audit: { color: 'text-blue-400 bg-blue-400/10', icon: <Eye className="w-3 h-3" /> },
    warning: { color: 'text-amber-400 bg-amber-400/10', icon: <AlertTriangle className="w-3 h-3" /> },
    review: { color: 'text-purple-400 bg-purple-400/10', icon: <Scale className="w-3 h-3" /> },
    revoked: { color: 'text-red-400 bg-red-400/10', icon: <XCircle className="w-3 h-3" /> },
  };
  const v = variants[type] || variants.review;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${v.color}`}>
      {v.icon}
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

// ── Tab Content Components ───────────────────────────────────────────

function OverviewTab() {
  const maxTrend = Math.max(...COMPLIANCE_TREND.map((t) => t.score));

  return (
    <div className="space-y-6">
      {/* Entity Registration Summary */}
      <Card className="bg-[#131F2E] border-[#1E3A5F]">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Entity Registration Summary</h3>
            <Badge variant="outline" className="ml-auto border-[#1E3A5F] text-gray-500 text-[10px]">
              Total: 2,890
            </Badge>
          </div>
          <div className="space-y-3">
            {REGISTRATION_SUMMARY.map((item) => (
              <div key={item.type} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-40 truncate" title={item.type}>
                  {item.type}
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-[#1E3A5F] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-white w-12 text-right">{item.count.toLocaleString()}</span>
                <span className="text-[10px] text-gray-500 w-16 text-right">
                  {item.percentage}%
                </span>
                <span
                  className={`text-[10px] font-medium flex items-center gap-0.5 w-14 justify-end ${
                    item.change > 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {item.change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {item.change > 0 ? '+' : ''}
                  {item.change}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Score Trend + Recent Regulatory Actions side by side on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Score Trend */}
        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Compliance Score Trend</h3>
              <Badge variant="outline" className="ml-auto border-emerald-400/30 text-emerald-400 text-[10px]">
                8 months
              </Badge>
            </div>
            <div className="flex items-end gap-2 h-40">
              {COMPLIANCE_TREND.map((item) => {
                const height = ((item.score - 80) / (maxTrend - 80)) * 100;
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 font-medium">{item.score}</span>
                    <div
                      className="w-full rounded-t-sm bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-500 min-h-[4px]"
                      style={{ height: `${Math.max(height, 8)}%` }}
                    />
                    <span className="text-[10px] text-gray-500">{item.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-[#1E3A5F]/50 flex items-center justify-between">
              <span className="text-xs text-gray-400">Average compliance score</span>
              <span className="text-sm font-bold text-emerald-400">91.0%</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Regulatory Actions */}
        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Recent Regulatory Actions</h3>
            </div>
            <div className="space-y-2.5">
              {RECENT_REGULATORY_ACTIONS.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start gap-3 p-2.5 rounded-lg bg-[#0C1B2A]/50 hover:bg-[#0C1B2A] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-white truncate">{action.entity}</span>
                      <ActionTypeTag type={action.type} />
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">{action.action}</p>
                    <span className="text-[10px] text-gray-500 mt-1 inline-block">{action.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CompanyRegistrationTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const filtered = COMPANIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.regNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="bg-[#131F2E] border-[#1E3A5F]">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Company Registration Registry</h3>
            <Badge variant="outline" className="border-[#1E3A5F] text-gray-500 text-[10px]">
              {filtered.length} entities
            </Badge>
          </div>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by name or reg. number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0C1B2A] border border-[#1E3A5F] rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="rounded-lg border border-[#1E3A5F] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-[#1E3A5F] hover:bg-transparent bg-[#0C1B2A]/60">
                <TableHead className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Company Name</TableHead>
                <TableHead className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Reg. Number</TableHead>
                <TableHead className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Type</TableHead>
                <TableHead className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider hidden lg:table-cell">Registered Agent</TableHead>
                <TableHead className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider hidden md:table-cell">Inc. Date</TableHead>
                <TableHead className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider hidden xl:table-cell">Jurisdiction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((company) => (
                <TableRow key={company.regNumber} className="border-[#1E3A5F]/50 hover:bg-[#0C1B2A]/40">
                  <TableCell className="text-xs text-white font-medium py-3">{company.name}</TableCell>
                  <TableCell className="text-xs text-gray-400 font-mono">{company.regNumber}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-[#1E3A5F] text-gray-300 text-[10px]">
                      {company.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-400 hidden lg:table-cell">{company.agent}</TableCell>
                  <TableCell className="text-xs text-gray-400 hidden md:table-cell">{company.incDate}</TableCell>
                  <TableCell>
                    <StatusBadge status={company.status} />
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <Badge
                      variant="outline"
                      className={
                        company.jurisdiction === 'BVI International'
                          ? 'border-emerald-400/30 text-emerald-400 text-[10px]'
                          : 'border-sky-400/30 text-sky-400 text-[10px]'
                      }
                    >
                      {company.jurisdiction}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function ComplianceTrackerTab() {
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const filtered =
    riskFilter === 'all'
      ? COMPLIANCE_DATA
      : COMPLIANCE_DATA.filter((c) => c.risk === riskFilter);

  return (
    <Card className="bg-[#131F2E] border-[#1E3A5F]">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Compliance Tracker</h3>
            <Badge variant="outline" className="border-[#1E3A5F] text-gray-500 text-[10px]">
              {filtered.length} entities
            </Badge>
          </div>
          <div className="flex items-center gap-1.5">
            {(['all', 'Low', 'Medium', 'High', 'Critical'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
                  riskFilter === r
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-[#1E3A5F]/30'
                }`}
              >
                {r === 'all' ? 'All Risks' : r}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[#1E3A5F] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-[#1E3A5F] hover:bg-transparent bg-[#0C1B2A]/60">
                <TableHead className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Entity</TableHead>
                <TableHead className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Compliance Score</TableHead>
                <TableHead className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider hidden md:table-cell">Last Filing</TableHead>
                <TableHead className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider hidden lg:table-cell">Next Deadline</TableHead>
                <TableHead className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item, idx) => (
                <TableRow key={idx} className="border-[#1E3A5F]/50 hover:bg-[#0C1B2A]/40">
                  <TableCell className="text-xs text-white font-medium py-3">{item.entity}</TableCell>
                  <TableCell>
                    <ComplianceScoreBar score={item.score} />
                  </TableCell>
                  <TableCell className="text-xs text-gray-400 hidden md:table-cell">{item.lastFiling}</TableCell>
                  <TableCell className="text-xs text-gray-400 hidden lg:table-cell">
                    <span className={item.status === 'Non-Compliant' ? 'text-red-400 font-medium' : ''}>
                      {item.nextDeadline}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell>
                    <RiskBadge risk={item.risk} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function LicenseMonitoringTab() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const filtered =
    statusFilter === 'all'
      ? LICENSES
      : LICENSES.filter((l) => l.status === statusFilter);

  return (
    <Card className="bg-[#131F2E] border-[#1E3A5F]">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Financial Services Licenses</h3>
            <Badge variant="outline" className="border-[#1E3A5F] text-gray-500 text-[10px]">
              {filtered.length} licenses
            </Badge>
          </div>
          <div className="flex items-center gap-1.5">
            {(['all', 'Active', 'Suspended', 'Revoked', 'Under Review'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-[#1E3A5F]/30'
                }`}
              >
                {s === 'all' ? 'All Status' : s}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[#1E3A5F] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-[#1E3A5F] hover:bg-transparent bg-[#0C1B2A]/60">
                <TableHead className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Entity</TableHead>
                <TableHead className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">License Type</TableHead>
                <TableHead className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">License Number</TableHead>
                <TableHead className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider hidden sm:table-cell">Expiry Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((license) => (
                <TableRow key={license.licenseNumber} className="border-[#1E3A5F]/50 hover:bg-[#0C1B2A]/40">
                  <TableCell className="text-xs text-white font-medium py-3">{license.entity}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        license.type === 'Banking'
                          ? 'border-yellow-400/30 text-yellow-400'
                          : license.type === 'Insurance'
                            ? 'border-sky-400/30 text-sky-400'
                            : license.type === 'Investment'
                              ? 'border-purple-400/30 text-purple-400'
                              : license.type === 'Trust'
                                ? 'border-emerald-400/30 text-emerald-400'
                                : 'border-pink-400/30 text-pink-400'
                      }`}
                    >
                      {license.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-400 font-mono">{license.licenseNumber}</TableCell>
                  <TableCell>
                    <StatusBadge status={license.status} />
                  </TableCell>
                  <TableCell className="text-xs text-gray-400 hidden sm:table-cell">{license.expiry}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function FilingDeadlinesTab() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const filtered =
    statusFilter === 'all'
      ? FILING_DEADLINES
      : FILING_DEADLINES.filter((f) => f.status === statusFilter);

  const overdueCount = FILING_DEADLINES.filter((f) => f.status === 'Overdue').length;
  const upcomingCount = FILING_DEADLINES.filter((f) => f.status === 'Upcoming').length;
  const submittedCount = FILING_DEADLINES.filter((f) => f.status === 'Submitted').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-400/10 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-red-400">{overdueCount}</div>
                <div className="text-[10px] text-gray-500">Overdue</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-emerald-400">{upcomingCount}</div>
                <div className="text-[10px] text-gray-500">Upcoming</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-400/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-400">{submittedCount}</div>
                <div className="text-[10px] text-gray-500">Submitted</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#131F2E] border-[#1E3A5F]">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Regulatory Filing Deadlines</h3>
              <Badge variant="outline" className="border-[#1E3A5F] text-gray-500 text-[10px]">
                {filtered.length} filings
              </Badge>
            </div>
            <div className="flex items-center gap-1.5">
              {(['all', 'Upcoming', 'Overdue', 'Submitted'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
                    statusFilter === s
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-[#1E3A5F]/30'
                  }`}
                >
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#1E3A5F] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-[#1E3A5F] hover:bg-transparent bg-[#0C1B2A]/60">
                  <TableHead className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Entity</TableHead>
                  <TableHead className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Filing Type</TableHead>
                  <TableHead className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Due Date</TableHead>
                  <TableHead className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((filing, idx) => (
                  <TableRow key={idx} className="border-[#1E3A5F]/50 hover:bg-[#0C1B2A]/40">
                    <TableCell className="text-xs text-white font-medium py-3">{filing.entity}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          filing.filingType === 'Annual Return'
                            ? 'border-emerald-400/30 text-emerald-400'
                            : filing.filingType === 'Audit Report'
                              ? 'border-amber-400/30 text-amber-400'
                              : filing.filingType === 'Benefit Ownership'
                                ? 'border-purple-400/30 text-purple-400'
                                : 'border-sky-400/30 text-sky-400'
                        }`}
                      >
                        {filing.filingType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-400">
                      <span className={filing.status === 'Overdue' ? 'text-red-400 font-medium' : ''}>
                        {filing.dueDate}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={filing.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RegulatoryAlertsTab() {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const filtered =
    severityFilter === 'all'
      ? REGULATORY_ALERTS
      : REGULATORY_ALERTS.filter((a) => a.severity === severityFilter);

  return (
    <Card className="bg-[#131F2E] border-[#1E3A5F]">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <FileWarning className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Regulatory Alerts & Updates</h3>
            <Badge variant="outline" className="border-[#1E3A5F] text-gray-500 text-[10px]">
              {filtered.length} alerts
            </Badge>
          </div>
          <div className="flex items-center gap-1.5">
            {(['all', 'Info', 'Low', 'Medium', 'High'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
                  severityFilter === s
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-[#1E3A5F]/30'
                }`}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((alert) => (
            <div
              key={alert.id}
              className="relative p-4 rounded-lg border border-[#1E3A5F] bg-[#0C1B2A]/40 hover:bg-[#0C1B2A] transition-colors"
            >
              {/* Severity accent bar */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
                  alert.severity === 'High'
                    ? 'bg-red-500'
                    : alert.severity === 'Medium'
                      ? 'bg-orange-500'
                      : alert.severity === 'Low'
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                }`}
              />

              <div className="flex flex-col sm:flex-row sm:items-start gap-3 pl-2">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[10px] text-gray-500 font-mono">{alert.id}</span>
                    <span className="text-[10px] text-gray-500">·</span>
                    <span className="text-[10px] text-gray-500">{alert.date}</span>
                    <AlertTypeBadge type={alert.type} />
                    <SeverityBadge severity={alert.severity} />
                  </div>
                  <div className="text-xs font-semibold text-white mb-1">{alert.entity}</div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{alert.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export function AdminMinistryFSC() {
  const { goBack, activeMinistryTab, setActiveMinistryTab } = useAppStore();

  const STATS = [
    {
      label: 'Registered Entities',
      value: '2,890',
      icon: Building2,
      change: '+4.2%',
      changeUp: true,
    },
    {
      label: 'Active Licenses',
      value: '1,456',
      icon: FileCheck,
      change: '+2.8%',
      changeUp: true,
    },
    {
      label: 'Compliance Rate',
      value: '94%',
      icon: ShieldCheck,
      change: '+1.2%',
      changeUp: true,
    },
    {
      label: 'Pending Filings',
      value: '89',
      icon: Clock,
      change: '-12.5%',
      changeUp: false,
    },
    {
      label: 'Annual Revenue',
      value: '$3.4M',
      icon: DollarSign,
      change: '+8.7%',
      changeUp: true,
    },
  ];

  const TAB_ITEMS = [
    { value: 'overview', label: 'Overview', icon: BarChart3 },
    { value: 'companies', label: 'Company Registration', icon: Building2 },
    { value: 'compliance', label: 'Compliance Tracker', icon: ShieldCheck },
    { value: 'licenses', label: 'License Monitoring', icon: FileCheck },
    { value: 'filings', label: 'Filing Deadlines', icon: Calendar },
    { value: 'alerts', label: 'Regulatory Alerts', icon: FileWarning },
  ];

  return (
    <div className="space-y-6 section-enter">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          onClick={goBack}
          className="shrink-0 text-gray-400 hover:text-white hover:bg-[#1E3A5F]/50 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white">Financial Services Commission</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Financial sector regulation, company registration, compliance monitoring &amp; regulatory oversight
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {STATS.map((stat) => (
          <Card key={stat.label} className="bg-[#131F2E] border-[#1E3A5F] hover:border-emerald-500/20 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <stat.icon className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-bold text-white leading-tight">{stat.value}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{stat.label}</div>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#1E3A5F]/50 flex items-center justify-between">
                <span
                  className={`text-[10px] font-medium flex items-center gap-0.5 ${
                    stat.changeUp ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {stat.changeUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </span>
                <span className="text-[10px] text-gray-600">vs last quarter</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeMinistryTab} onValueChange={setActiveMinistryTab} className="space-y-4">
        <TabsList className="bg-[#131F2E] border border-[#1E3A5F] p-1 flex-wrap h-auto gap-1">
          {TAB_ITEMS.map((tab) => {
            const IconComp = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-xs text-gray-400 data-[state=active]:text-emerald-400 data-[state=active]:bg-emerald-500/10 data-[state=active]:border-emerald-500/20 px-3 py-1.5 gap-1.5"
              >
                <IconComp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="companies">
          <CompanyRegistrationTab />
        </TabsContent>
        <TabsContent value="compliance">
          <ComplianceTrackerTab />
        </TabsContent>
        <TabsContent value="licenses">
          <LicenseMonitoringTab />
        </TabsContent>
        <TabsContent value="filings">
          <FilingDeadlinesTab />
        </TabsContent>
        <TabsContent value="alerts">
          <RegulatoryAlertsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
