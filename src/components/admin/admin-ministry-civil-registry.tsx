'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Baby,
  ArrowLeft,
  Heart,
  CloudOff,
  FileEdit,
  Users,
  BarChart3,
  Download,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Scale,
  Gavel,
  ClipboardList,
  Search,
  Eye,
  ChevronRight,
  Activity,
  MapPin,
  Calendar,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  FileSearch,
  PenTool,
} from 'lucide-react';

// ── Mock Data ────────────────────────────────────────────────────────────────

const MONTHLY_DATA = [
  { month: 'Jan', births: 178, deaths: 72, marriages: 35 },
  { month: 'Feb', births: 165, deaths: 68, marriages: 42 },
  { month: 'Mar', births: 190, deaths: 75, marriages: 38 },
  { month: 'Apr', births: 182, deaths: 80, marriages: 30 },
  { month: 'May', births: 175, deaths: 65, marriages: 45 },
  { month: 'Jun', births: 168, deaths: 70, marriages: 50 },
  { month: 'Jul', births: 160, deaths: 60, marriages: 28 },
  { month: 'Aug', births: 155, deaths: 58, marriages: 32 },
  { month: 'Sep', births: 148, deaths: 62, marriages: 25 },
  { month: 'Oct', births: 140, deaths: 55, marriages: 22 },
  { month: 'Nov', births: 135, deaths: 52, marriages: 30 },
  { month: 'Dec', births: 134, deaths: 30, marriages: 35 },
];

const CERTIFICATE_REQUESTS = [
  { id: 'CR-001', name: 'Maria L. Smith', type: 'Birth', status: 'Approved', dateRequested: '2024-11-15', certNumber: 'BVI-B-2024-0892' },
  { id: 'CR-002', name: 'James E. Pickering', type: 'Death', status: 'Processing', dateRequested: '2024-12-01', certNumber: null },
  { id: 'CR-003', name: 'Amara J. Toussaint', type: 'Marriage', status: 'Issued', dateRequested: '2024-10-22', certNumber: 'BVI-M-2024-0415' },
  { id: 'CR-004', name: 'David R. Wheatley', type: 'Birth', status: 'Pending', dateRequested: '2024-12-08', certNumber: null },
  { id: 'CR-005', name: 'Sophia A. Fahie', type: 'Birth', status: 'Approved', dateRequested: '2024-11-28', certNumber: 'BVI-B-2024-0901' },
  { id: 'CR-006', name: 'Oliver T. Georges', type: 'Death', status: 'Approved', dateRequested: '2024-11-10', certNumber: 'BVI-D-2024-0234' },
  { id: 'CR-007', name: 'Elena M. Castro', type: 'Marriage', status: 'Processing', dateRequested: '2024-12-05', certNumber: null },
  { id: 'CR-008', name: 'Michael P. Vanterpool', type: 'Birth', status: 'Issued', dateRequested: '2024-09-14', certNumber: 'BVI-B-2024-0756' },
  { id: 'CR-009', name: 'Chloe N. Romney', type: 'Marriage', status: 'Pending', dateRequested: '2024-12-10', certNumber: null },
  { id: 'CR-010', name: 'Isaac D. Hodge', type: 'Death', status: 'Issued', dateRequested: '2024-10-30', certNumber: 'BVI-D-2024-0218' },
  { id: 'CR-011', name: 'Liam K. De Castro', type: 'Birth', status: 'Approved', dateRequested: '2024-12-03', certNumber: 'BVI-B-2024-0920' },
  { id: 'CR-012', name: 'Anya R. Penn', type: 'Marriage', status: 'Approved', dateRequested: '2024-11-20', certNumber: 'BVI-M-2024-0430' },
];

const AMENDMENT_REQUESTS = [
  { id: 'AM-001', type: 'Name Change', applicant: 'Patricia A. Leslie', currentRecord: 'Patricia Ann Thomas', requestedChange: 'Patricia Ann Leslie', status: 'Approved', documents: 4 },
  { id: 'AM-002', type: 'Correction', applicant: 'Robert K. Fahie', currentRecord: 'Birth date: 15-Mar-1985', requestedChange: 'Birth date: 15-Mar-1983', status: 'Pending', documents: 3 },
  { id: 'AM-003', type: 'Late Registration', applicant: 'Diana M. Vanterpool', currentRecord: 'No birth record on file', requestedChange: 'Register birth of child born 12-Aug-2024', status: 'Approved', documents: 5 },
  { id: 'AM-004', type: 'Correction', applicant: 'Thomas J. Smith', currentRecord: 'Spelling: Thomes', requestedChange: 'Spelling: Thomas', status: 'Rejected', documents: 2 },
  { id: 'AM-005', type: 'Name Change', applicant: 'Keisha B. Hodge', currentRecord: 'Keisha Brathwaite', requestedChange: 'Keisha Brathwaite-Hodge', status: 'Pending', documents: 3 },
  { id: 'AM-006', type: 'Correction', applicant: 'Andrew L. Scatliffe', currentRecord: 'Place of birth: St. Thomas', requestedChange: 'Place of birth: Road Town, Tortola', status: 'Approved', documents: 4 },
  { id: 'AM-007', type: 'Late Registration', applicant: 'Jennifer P. Wheatley', currentRecord: 'No marriage record', requestedChange: 'Register marriage solemnized 05-Sep-2024', status: 'Pending', documents: 6 },
  { id: 'AM-008', type: 'Name Change', applicant: 'Carlos E. Maduro', currentRecord: 'Carlos Eduardo Rivera', requestedChange: 'Carlos Eduardo Maduro', status: 'Rejected', documents: 2 },
];

const ADOPTION_CASES = [
  { id: 'AD-001', childInitials: 'A.J.', childAge: '3 yrs', adoptiveParents: 'Mark & Lisa Turnbull', status: 'Finalized', dateFiled: '2023-06-15', socialWorker: 'Dr. Patricia Lettsome' },
  { id: 'AD-002', childInitials: 'K.R.', childAge: '5 yrs', adoptiveParents: 'James & Sofia Allen', status: 'Court Order', dateFiled: '2024-01-20', socialWorker: 'Ms. Karen Christopher' },
  { id: 'AD-003', childInitials: 'T.W.', childAge: '1 yr', adoptiveParents: 'David & Michelle George', status: 'Review', dateFiled: '2024-08-10', socialWorker: 'Dr. Patricia Lettsome' },
  { id: 'AD-004', childInitials: 'M.D.', childAge: '4 yrs', adoptiveParents: 'Pending Assignment', status: 'Application', dateFiled: '2024-11-01', socialWorker: 'Ms. Karen Christopher' },
  { id: 'AD-005', childInitials: 'S.L.', childAge: '2 yrs', adoptiveParents: 'Robert & Amanda Fahie', status: 'Review', dateFiled: '2024-09-05', socialWorker: 'Dr. Patricia Lettsome' },
  { id: 'AD-006', childInitials: 'B.C.', childAge: '6 yrs', adoptiveParents: 'Peter & Helen Wheatley', status: 'Court Order', dateFiled: '2024-02-14', socialWorker: 'Mr. Vincent Scatliffe' },
  { id: 'AD-007', childInitials: 'N.P.', childAge: '8 mos', adoptiveParents: 'Andrew & Claire Donovan', status: 'Application', dateFiled: '2024-12-02', socialWorker: 'Ms. Karen Christopher' },
];

const TOP_BABY_NAMES = [
  { name: 'Olivia', count: 34, gender: 'F' },
  { name: 'Liam', count: 31, gender: 'M' },
  { name: 'Amara', count: 28, gender: 'F' },
  { name: 'Noah', count: 25, gender: 'M' },
  { name: 'Sophia', count: 23, gender: 'F' },
];

const ISLAND_BIRTH_RATES = [
  { island: 'Tortola', rate: 68, count: 1448, total: 28900 },
  { island: 'Virgin Gorda', rate: 52, count: 390, total: 7500 },
  { island: 'Anegada', rate: 38, count: 119, total: 3130 },
  { island: 'Jost Van Dyke', rate: 29, count: 86, total: 2965 },
];

// ── Helper Components ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; icon: React.ElementType }> = {
    Approved: { className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', icon: CheckCircle2 },
    Processing: { className: 'bg-amber-500/15 text-amber-400 border-amber-500/25', icon: Clock },
    Pending: { className: 'bg-pink-500/15 text-pink-400 border-pink-500/25', icon: AlertCircle },
    Issued: { className: 'bg-sky-500/15 text-sky-400 border-sky-500/25', icon: FileText },
    Rejected: { className: 'bg-red-500/15 text-red-400 border-red-500/25', icon: XCircle },
    Finalized: { className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', icon: CheckCircle2 },
    'Court Order': { className: 'bg-violet-500/15 text-violet-400 border-violet-500/25', icon: Gavel },
    Application: { className: 'bg-pink-500/15 text-pink-400 border-pink-500/25', icon: ClipboardList },
    Review: { className: 'bg-amber-500/15 text-amber-400 border-amber-500/25', icon: Search },
  };
  const c = config[status] || { className: 'bg-gray-500/15 text-gray-400 border-gray-500/25', icon: AlertCircle };
  const Icon = c.icon;
  return (
    <Badge variant="outline" className={`text-[11px] gap-1 ${c.className}`}>
      <Icon className="w-3 h-3" />
      {status}
    </Badge>
  );
}

function ProgressBar({ value, max, color = 'bg-pink-500', label }: { value: number; max: number; color?: string; label?: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">{label}</span>
          <span className="text-white font-medium">{value.toLocaleString()}</span>
        </div>
      )}
      <div className="h-2 bg-[#0C1B2A] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Tab Panels ───────────────────────────────────────────────────────────────

function OverviewTab() {
  const totalBirths = MONTHLY_DATA.reduce((s, d) => s + d.births, 0);
  const totalDeaths = MONTHLY_DATA.reduce((s, d) => s + d.deaths, 0);
  const totalMarriages = MONTHLY_DATA.reduce((s, d) => s + d.marriages, 0);
  const maxVal = Math.max(...MONTHLY_DATA.map((d) => d.births));

  const genderData = [
    { label: 'Male Births', value: 1098, pct: 51.5, color: 'bg-sky-500' },
    { label: 'Female Births', value: 1032, pct: 48.5, color: 'bg-pink-500' },
  ];

  const ageData = [
    { range: '0–18', births: 0, deaths: 12, label: 'Under 18 deaths' },
    { range: '19–35', births: 0, deaths: 28, label: 'Deaths age 19–35' },
    { range: '36–55', births: 0, deaths: 195, label: 'Deaths age 36–55' },
    { range: '56–70', births: 0, deaths: 312, label: 'Deaths age 56–70' },
    { range: '71+', births: 0, deaths: 300, label: 'Deaths age 71+' },
  ];

  return (
    <div className="space-y-6">
      {/* Annual Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                <Baby className="w-5 h-5 text-pink-400" />
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />+4.2%
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{totalBirths.toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">Total Births (2024)</div>
          </CardContent>
        </Card>
        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-500/10 flex items-center justify-center">
                <CloudOff className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-center gap-1 text-red-400 text-xs font-medium">
                <ArrowDownRight className="w-3.5 h-3.5" />-1.8%
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{totalDeaths.toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">Total Deaths (2024)</div>
          </CardContent>
        </Card>
        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-400" />
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />+6.7%
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{totalMarriages.toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">Total Marriages (2024)</div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card className="bg-[#131F2E] border-[#1E3A5F]">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-pink-400" />
            Monthly Vital Statistics
          </h3>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {MONTHLY_DATA.map((row) => (
              <div key={row.month} className="flex items-center gap-4">
                <span className="text-xs text-gray-400 w-8 shrink-0 font-medium">{row.month}</span>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 bg-[#0C1B2A] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-pink-500 transition-all duration-700"
                        style={{ width: `${(row.births / maxVal) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-pink-300 w-14 text-right font-medium">{row.births} births</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-[#0C1B2A] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gray-500/60 transition-all duration-700"
                        style={{ width: `${(row.deaths / maxVal) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 w-14 text-right">{row.deaths} deaths</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-[#0C1B2A] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-pink-300/40 transition-all duration-700"
                        style={{ width: `${(row.marriages / maxVal) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 w-14 text-right">{row.marriages} mrgs</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-4 pt-3 border-t border-[#1E3A5F]/50">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded-full bg-pink-500" />
              <span className="text-[11px] text-gray-400">Births</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded-full bg-gray-500/60" />
              <span className="text-[11px] text-gray-400">Deaths</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded-full bg-pink-300/40" />
              <span className="text-[11px] text-gray-400">Marriages</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gender Breakdown & Age Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-pink-400" />
              Birth Gender Breakdown
            </h3>
            <div className="space-y-4">
              {genderData.map((g) => (
                <div key={g.label} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">{g.label}</span>
                    <span className="text-white font-medium">{g.value.toLocaleString()} ({g.pct}%)</span>
                  </div>
                  <div className="h-4 bg-[#0C1B2A] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${g.color}`}
                      style={{ width: `${g.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-pink-400" />
              Death Age Distribution (2024)
            </h3>
            <div className="space-y-3">
              {ageData.map((a) => (
                <ProgressBar
                  key={a.range}
                  value={a.deaths}
                  max={320}
                  color="bg-gray-500/70"
                  label={a.label}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CertificatesTab() {
  const [certTab, setCertTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = CERTIFICATE_REQUESTS.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.certNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTab = certTab === 'all' || c.type.toLowerCase() === certTab;
    return matchSearch && matchTab;
  });

  const certTabs = [
    { key: 'all', label: 'All', count: CERTIFICATE_REQUESTS.length },
    { key: 'birth', label: 'Birth', count: CERTIFICATE_REQUESTS.filter((c) => c.type === 'Birth').length },
    { key: 'death', label: 'Death', count: CERTIFICATE_REQUESTS.filter((c) => c.type === 'Death').length },
    { key: 'marriage', label: 'Marriage', count: CERTIFICATE_REQUESTS.filter((c) => c.type === 'Marriage').length },
  ];

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {certTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setCertTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              certTab === t.key
                ? 'bg-pink-500 text-white'
                : 'bg-[#131F2E] text-gray-400 border border-[#1E3A5F] hover:text-white'
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search by name, certificate number, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#131F2E] border border-[#1E3A5F] text-white text-sm placeholder:text-gray-500 pl-9 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500/50"
        />
      </div>

      {/* Table */}
      <Card className="bg-[#131F2E] border-[#1E3A5F] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E3A5F]">
                <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Person</th>
                <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Type</th>
                <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Status</th>
                <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Date Requested</th>
                <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Cert #</th>
                <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500 text-sm">
                    No certificate requests found.
                  </td>
                </tr>
              ) : (
                filtered.map((cert) => (
                  <tr key={cert.id} className="border-b border-[#1E3A5F]/50 hover:bg-[#0C1B2A]/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-pink-400">
                            {cert.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-medium text-xs">{cert.name}</div>
                          <div className="text-gray-500 text-[11px]">{cert.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-[10px] ${
                        cert.type === 'Birth' ? 'border-pink-500/30 text-pink-300 bg-pink-500/10' :
                        cert.type === 'Death' ? 'border-gray-500/30 text-gray-300 bg-gray-500/10' :
                        'border-violet-500/30 text-violet-300 bg-violet-500/10'
                      }`}>
                        {cert.type === 'Birth' && <Baby className="w-3 h-3 mr-1" />}
                        {cert.type === 'Death' && <CloudOff className="w-3 h-3 mr-1" />}
                        {cert.type === 'Marriage' && <Heart className="w-3 h-3 mr-1" />}
                        {cert.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={cert.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(cert.dateRequested).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      {cert.certNumber ? (
                        <span className="text-xs font-mono text-pink-300">{cert.certNumber}</span>
                      ) : (
                        <span className="text-xs text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-gray-400 hover:text-white">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {(cert.status === 'Approved' || cert.status === 'Issued') && (
                          <Button size="sm" className="h-7 px-2.5 bg-pink-500 hover:bg-pink-600 text-white text-[11px] font-medium gap-1">
                            <Download className="w-3 h-3" />
                            PDF
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function VitalStatisticsTab() {
  const stats = [
    { label: 'Birth Rate', value: '12.8', unit: 'per 1,000', change: '+0.4', trend: 'up', icon: Baby, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: 'Death Rate', value: '5.1', unit: 'per 1,000', change: '-0.2', trend: 'down', icon: CloudOff, color: 'text-gray-400', bg: 'bg-gray-500/10' },
    { label: 'Marriage Rate', value: '2.5', unit: 'per 1,000', change: '+0.3', trend: 'up', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: 'Population Estimate', value: '31,500', unit: 'persons', change: '+1.2%', trend: 'up', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  const yearlyTrend = [
    { year: '2019', births: 1870, deaths: 910, marriages: 380 },
    { year: '2020', births: 1740, deaths: 1020, marriages: 180 },
    { year: '2021', births: 1810, deaths: 890, marriages: 290 },
    { year: '2022', births: 1960, deaths: 860, marriages: 350 },
    { year: '2023', births: 2040, deaths: 862, marriages: 386 },
    { year: '2024', births: 2130, deaths: 847, marriages: 412 },
  ];

  const maxTrend = 2500;

  return (
    <div className="space-y-6">
      {/* Rate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="bg-[#131F2E] border-[#1E3A5F]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-medium ${
                  s.trend === 'up' && s.label !== 'Death Rate' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {s.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {s.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.unit} · {s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 5-Year Trend */}
      <Card className="bg-[#131F2E] border-[#1E3A5F]">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-pink-400" />
            5-Year Vital Trends
          </h3>
          <p className="text-xs text-gray-500 mb-4">Annual comparison of vital events in the BVI</p>
          <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
            {yearlyTrend.map((row) => (
              <div key={row.year} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-medium w-10">{row.year}</span>
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="text-pink-300">{row.births} B</span>
                    <span className="text-gray-400">{row.deaths} D</span>
                    <span className="text-pink-200/60">{row.marriages} M</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex-1 h-3 bg-[#0C1B2A] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-pink-500 transition-all duration-700"
                      style={{ width: `${(row.births / maxTrend) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex-1 h-2 bg-[#0C1B2A] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gray-500/60 transition-all duration-700"
                      style={{ width: `${(row.deaths / maxTrend) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-4 pt-3 border-t border-[#1E3A5F]/50">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded-full bg-pink-500" />
              <span className="text-[11px] text-gray-400">Births</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded-full bg-gray-500/60" />
              <span className="text-[11px] text-gray-400">Deaths</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-pink-400" />
              Natural Increase
            </h3>
            <div className="text-3xl font-bold text-emerald-400 mb-1">+1,283</div>
            <p className="text-xs text-gray-400">Births minus deaths — net population growth from natural change</p>
            <div className="mt-3 h-3 bg-[#0C1B2A] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: '78%' }} />
            </div>
            <div className="text-[10px] text-gray-500 mt-1">78% of total growth attributed to natural increase</div>
          </CardContent>
        </Card>
        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-pink-400" />
              Crude Rates Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Birth Rate</span>
                <span className="text-sm font-semibold text-pink-400">12.8 / 1,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Death Rate</span>
                <span className="text-sm font-semibold text-gray-400">5.1 / 1,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Marriage Rate</span>
                <span className="text-sm font-semibold text-pink-300">2.5 / 1,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Infant Mortality</span>
                <span className="text-sm font-semibold text-amber-400">3.2 / 1,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Life Expectancy</span>
                <span className="text-sm font-semibold text-emerald-400">79.4 yrs</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RecordAmendmentsTab() {
  const [filter, setFilter] = useState('all');

  const filtered = AMENDMENT_REQUESTS.filter((a) => {
    return filter === 'all' || a.status.toLowerCase() === filter;
  });

  const typeIcon: Record<string, React.ElementType> = {
    'Name Change': PenTool,
    'Correction': FileEdit,
    'Late Registration': ClipboardList,
  };

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        {['all', 'pending', 'approved', 'rejected'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f
                ? 'bg-pink-500 text-white'
                : 'bg-[#131F2E] text-gray-400 border border-[#1E3A5F] hover:text-white'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-1 text-[10px] opacity-70">
              ({f === 'all' ? AMENDMENT_REQUESTS.length : AMENDMENT_REQUESTS.filter((a) => a.status.toLowerCase() === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="bg-[#131F2E] border-[#1E3A5F] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E3A5F]">
                <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">ID</th>
                <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Type</th>
                <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Applicant</th>
                <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Current Record</th>
                <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Requested Change</th>
                <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Status</th>
                <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Docs</th>
                <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500 text-sm">
                    No amendment requests found.
                  </td>
                </tr>
              ) : (
                filtered.map((am) => {
                  const TypeIcon = typeIcon[am.type] || FileEdit;
                  return (
                    <tr key={am.id} className="border-b border-[#1E3A5F]/50 hover:bg-[#0C1B2A]/50 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">{am.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <TypeIcon className="w-3.5 h-3.5 text-pink-400" />
                          <span className="text-xs text-white">{am.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-white font-medium">{am.applicant}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 max-w-[160px] truncate">{am.currentRecord}</td>
                      <td className="px-4 py-3 text-xs text-pink-300 max-w-[180px] truncate">{am.requestedChange}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={am.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-400">{am.documents}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-gray-400 hover:text-white">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function AdoptionRegistryTab() {
  const [filter, setFilter] = useState('all');

  const filtered = ADOPTION_CASES.filter((a) => {
    return filter === 'all' || a.status.toLowerCase().replace(' ', '-') === filter;
  });

  const statusFilters = [
    { key: 'all', label: 'All' },
    { key: 'application', label: 'Application' },
    { key: 'review', label: 'Review' },
    { key: 'court-order', label: 'Court Order' },
    { key: 'finalized', label: 'Finalized' },
  ];

  const statusStepOrder = ['Application', 'Review', 'Court Order', 'Finalized'];

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        {statusFilters.map((sf) => (
          <button
            key={sf.key}
            onClick={() => setFilter(sf.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === sf.key
                ? 'bg-pink-500 text-white'
                : 'bg-[#131F2E] text-gray-400 border border-[#1E3A5F] hover:text-white'
            }`}
          >
            {sf.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-gray-500 text-sm">
            No adoption cases found.
          </div>
        ) : (
          filtered.map((ad) => {
            const currentStep = statusStepOrder.indexOf(ad.status);
            return (
              <Card key={ad.id} className="bg-[#131F2E] border-[#1E3A5F] hover:border-pink-500/30 transition-colors">
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                        <Baby className="w-5 h-5 text-pink-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white">Case {ad.id}</h4>
                          <StatusBadge status={ad.status} />
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Filed {new Date(ad.dateFiled).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>

                  {/* Child details */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-[#0C1B2A] rounded-lg p-3">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Child (Privacy)</div>
                      <div className="text-sm font-semibold text-pink-400">{ad.childInitials}</div>
                      <div className="text-[11px] text-gray-400">{ad.childAge} old</div>
                    </div>
                    <div className="bg-[#0C1B2A] rounded-lg p-3">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Adoptive Parents</div>
                      <div className="text-xs text-white font-medium leading-snug">{adoptiveParentsDisplay(ad.adoptiveParents)}</div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1.5 uppercase tracking-wider">
                      <span>Case Progress</span>
                      <span>{currentStep + 1} / {statusStepOrder.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {statusStepOrder.map((step, i) => (
                        <div
                          key={step}
                          className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                            i <= currentStep ? 'bg-pink-500' : 'bg-[#0C1B2A]'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      {statusStepOrder.map((step, i) => (
                        <span key={step} className={`text-[9px] ${i <= currentStep ? 'text-pink-400' : 'text-gray-600'}`}>
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Social Worker */}
                  <div className="flex items-center gap-2 pt-3 border-t border-[#1E3A5F]/50">
                    <UserCheck className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-xs text-gray-400">
                      Social Worker: <span className="text-gray-300">{ad.socialWorker}</span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

function StatisticalReportsTab() {
  return (
    <div className="space-y-6">
      {/* Annual Comparison */}
      <Card className="bg-[#131F2E] border-[#1E3A5F]">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-pink-400" />
            Annual Comparison — 2023 vs 2024
          </h3>
          <p className="text-xs text-gray-500 mb-4">Year-over-year change in vital event registrations</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Births', y2023: 2040, y2024: 2130, color: 'bg-pink-500', icon: Baby },
              { label: 'Deaths', y2023: 862, y2024: 847, color: 'bg-gray-500', icon: CloudOff },
              { label: 'Marriages', y2023: 386, y2024: 412, color: 'bg-pink-300', icon: Heart },
            ].map((item) => {
              const change = item.y2024 - item.y2023;
              const pctChange = ((change / item.y2023) * 100).toFixed(1);
              const isPositive = change > 0;
              return (
                <div key={item.label} className="bg-[#0C1B2A] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4 text-pink-400" />
                      <span className="text-xs font-medium text-gray-400">{item.label}</span>
                    </div>
                    <div className={`flex items-center gap-0.5 text-[11px] font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {isPositive ? '+' : ''}{pctChange}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">2023</span>
                      <span className="text-white font-medium">{item.y2023.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">2024</span>
                      <span className="text-pink-300 font-semibold">{item.y2024.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Baby Names & Marriage Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Baby className="w-4 h-4 text-pink-400" />
              Top 5 Baby Names — 2024
            </h3>
            <p className="text-xs text-gray-500 mb-4">Most popular names registered this year</p>
            <div className="space-y-3">
              {TOP_BABY_NAMES.map((n, i) => (
                <div key={n.name} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    i === 0 ? 'bg-pink-500/20 text-pink-400' :
                    i === 1 ? 'bg-pink-500/10 text-pink-300' :
                    i === 2 ? 'bg-pink-500/10 text-pink-300' :
                    'bg-[#0C1B2A] text-gray-500'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{n.name}</span>
                      <span className="text-xs text-gray-400">{n.count} registrations</span>
                    </div>
                    <ProgressBar value={n.count} max={36} color={n.gender === 'F' ? 'bg-pink-500' : 'bg-sky-500'} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-400" />
              Marriage Statistics
            </h3>
            <p className="text-xs text-gray-500 mb-4">Key demographics from marriage registrations</p>
            <div className="space-y-4">
              <div className="bg-[#0C1B2A] rounded-lg p-4">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Average Age at Marriage</div>
                <div className="flex items-end gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-sky-400">31.2</div>
                    <div className="text-[10px] text-gray-500">Grooms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-400">28.7</div>
                    <div className="text-[10px] text-gray-500">Brides</div>
                  </div>
                </div>
              </div>
              <div className="bg-[#0C1B2A] rounded-lg p-4">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Marriage by Type</div>
                <div className="space-y-2">
                  {[
                    { type: 'Civil Ceremony', count: 245, pct: 59.5 },
                    { type: 'Religious Ceremony', count: 142, pct: 34.5 },
                    { type: 'Other', count: 25, pct: 6.1 },
                  ].map((m) => (
                    <div key={m.type} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">{m.type}</span>
                        <span className="text-white font-medium">{m.count} ({m.pct}%)</span>
                      </div>
                      <div className="h-2 bg-[#131F2E] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-pink-500/70" style={{ width: `${m.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Birth Rate by Island */}
      <Card className="bg-[#131F2E] border-[#1E3A5F]">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-pink-400" />
            Birth Rate by Island
          </h3>
          <p className="text-xs text-gray-500 mb-4">Vital event distribution across the BVI islands</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ISLAND_BIRTH_RATES.map((island) => (
              <div key={island.island} className="bg-[#0C1B2A] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-pink-400" />
                  <span className="text-sm font-semibold text-white">{island.island}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <div className="text-lg font-bold text-pink-400">{island.rate}</div>
                    <div className="text-[10px] text-gray-500">Rate / 1k</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{island.count.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-500">Births</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-400">{island.total.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-500">Population</div>
                  </div>
                </div>
                <ProgressBar value={island.count} max={1500} color="bg-pink-500" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Utility ──────────────────────────────────────────────────────────────────

function adoptiveParentsDisplay(name: string): string {
  if (name === 'Pending Assignment') return name;
  return name;
}

// ── Main Component ───────────────────────────────────────────────────────────

export function AdminMinistryCivilRegistry() {
  const { goBack } = useAppStore();

  const stats = [
    { label: 'Births Registered', value: '2,130', icon: Baby, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: 'Deaths Recorded', value: '847', icon: CloudOff, color: 'text-gray-400', bg: 'bg-gray-500/10' },
    { label: 'Marriages', value: '412', icon: Heart, color: 'text-pink-300', bg: 'bg-pink-500/10' },
    { label: 'Amendments Pending', value: '23', icon: FileEdit, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Adoption Cases', value: '15', icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="h-9 w-9 p-0 text-gray-400 hover:text-white hover:bg-[#131F2E]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
            <Baby className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Registry of Civil Status</h1>
            <p className="text-sm text-gray-400">Civil Registry · Vital Records Management</p>
          </div>
        </div>
        <Badge variant="outline" className="border-pink-500/30 text-pink-400 text-xs bg-pink-500/5">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse mr-1.5" />
          Live
        </Badge>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-[#131F2E] border-[#1E3A5F] hover:border-pink-500/20 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-[#131F2E] border border-[#1E3A5F] p-1 w-full sm:w-auto overflow-x-auto">
          <TabsTrigger value="overview" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white text-gray-400 text-xs gap-1.5 px-3">
            <BarChart3 className="w-3.5 h-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="certificates" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white text-gray-400 text-xs gap-1.5 px-3">
            <FileText className="w-3.5 h-3.5" />
            Certificates
          </TabsTrigger>
          <TabsTrigger value="vital-stats" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white text-gray-400 text-xs gap-1.5 px-3">
            <Activity className="w-3.5 h-3.5" />
            Vital Statistics
          </TabsTrigger>
          <TabsTrigger value="amendments" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white text-gray-400 text-xs gap-1.5 px-3">
            <FileEdit className="w-3.5 h-3.5" />
            Amendments
          </TabsTrigger>
          <TabsTrigger value="adoptions" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white text-gray-400 text-xs gap-1.5 px-3">
            <Users className="w-3.5 h-3.5" />
            Adoptions
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white text-gray-400 text-xs gap-1.5 px-3">
            <ClipboardList className="w-3.5 h-3.5" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="certificates" className="mt-4">
          <CertificatesTab />
        </TabsContent>
        <TabsContent value="vital-stats" className="mt-4">
          <VitalStatisticsTab />
        </TabsContent>
        <TabsContent value="amendments" className="mt-4">
          <RecordAmendmentsTab />
        </TabsContent>
        <TabsContent value="adoptions" className="mt-4">
          <AdoptionRegistryTab />
        </TabsContent>
        <TabsContent value="reports" className="mt-4">
          <StatisticalReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
