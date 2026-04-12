'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Briefcase, ArrowLeft, Globe, Plane, Ship, AlertTriangle,
  Clock, CheckCircle2, XCircle, Search, Filter, Users, FileCheck,
  Shield, MapPin, Calendar, Eye, Download, UserCheck, UserX, TrendingUp,
} from 'lucide-react';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'work-permits', label: 'Work Permits' },
  { key: 'visa-processing', label: 'Visa Processing' },
  { key: 'border-control', label: 'Border Control' },
  { key: 'residency', label: 'Residency Tracker' },
  { key: 'deportation', label: 'Deportation Cases' },
];

const mockWorkPermits = [
  { id: 'WP-2025-0891', applicant: 'Carlos Mendez', employer: 'Scratch Island Resort', position: 'Executive Chef', nationality: 'Dominican Republic', type: 'Skilled', status: 'Active', expiry: '2027-03-15', salary: '$5,500' },
  { id: 'WP-2025-0892', applicant: 'Priya Sharma', employer: 'BVI Financial Services Ltd', position: 'Senior Accountant', nationality: 'India', type: 'Skilled', status: 'Active', expiry: '2027-06-30', salary: '$6,200' },
  { id: 'WP-2025-0893', applicant: 'Jean-Pierre Dubois', employer: 'Leeward Construction', position: 'Site Engineer', nationality: 'Haiti', type: 'Semi-skilled', status: 'Pending', expiry: '-', salary: '$3,800' },
  { id: 'WP-2025-0894', applicant: 'Maria Santos', employer: 'Island Spa & Wellness', position: 'Massage Therapist', nationality: 'Philippines', type: 'Temporary', status: 'Active', expiry: '2026-01-15', salary: '$2,900' },
  { id: 'WP-2025-0895', applicant: 'Michael Okonkwo', employer: 'Tortola Bakery', position: 'Head Baker', nationality: 'Nigeria', type: 'Semi-skilled', status: 'Expired', expiry: '2025-03-01', salary: '$3,200' },
  { id: 'WP-2025-0896', applicant: 'Ana Rodriguez', employer: 'BVI Telecom', position: 'Customer Service Rep', nationality: 'Venezuela', type: 'Temporary', status: 'Pending', expiry: '-', salary: '$2,400' },
  { id: 'WP-2025-0897', applicant: 'David Kim', employer: 'BVI Tech Solutions', position: 'Software Developer', nationality: 'South Korea', type: 'Skilled', status: 'Active', expiry: '2027-09-30', salary: '$7,500' },
  { id: 'WP-2025-0898', applicant: 'Fatima Al-Hassan', employer: 'Cane Garden Bay Hotel', position: 'Front Desk Manager', nationality: 'Jordan', type: 'Skilled', status: 'Active', expiry: '2026-12-15', salary: '$4,100' },
];

const mockVisas = [
  { id: 'V-2025-4521', applicant: 'Robert Chen', nationality: 'Taiwan', type: 'Business', duration: '90 days', purpose: 'Investment meeting', status: 'Approved', issueDate: '2025-03-01' },
  { id: 'V-2025-4522', applicant: 'Sophie Williams', nationality: 'United Kingdom', type: 'Tourist', duration: '30 days', purpose: 'Vacation', status: 'Approved', issueDate: '2025-03-05' },
  { id: 'V-2025-4523', applicant: 'Ahmed Hassan', nationality: 'Egypt', type: 'Student', duration: '1 year', purpose: 'University study', status: 'Pending', issueDate: '-' },
  { id: 'V-2025-4524', applicant: 'Yuki Tanaka', nationality: 'Japan', type: 'Transit', duration: '48 hours', purpose: 'Cruise stopover', status: 'Approved', issueDate: '2025-03-08' },
  { id: 'V-2025-4525', applicant: 'Ivan Petrov', nationality: 'Russia', type: 'Business', duration: '60 days', purpose: 'Property viewing', status: 'Rejected', issueDate: '-' },
  { id: 'V-2025-4526', applicant: 'Maria Garcia', nationality: 'Colombia', type: 'Tourist', duration: '14 days', purpose: 'Tourism', status: 'Pending', issueDate: '-' },
  { id: 'V-2025-4527', applicant: 'James Thompson', nationality: 'Canada', type: 'Business', duration: '30 days', purpose: 'Banking conference', status: 'Approved', issueDate: '2025-03-10' },
];

const mockBorderControl = [
  { id: 'BC-001', traveler: 'John Smith', nationality: 'USA', document: 'Passport', travelType: 'Arrival', date: '2025-03-15', port: 'Terrance B. Lettsome Intl', purpose: 'Tourism', vessel: 'AA Flight 1234' },
  { id: 'BC-002', traveler: 'Anna Larsson', nationality: 'Sweden', document: 'Passport', travelType: 'Arrival', date: '2025-03-15', port: 'Road Town Ferry Terminal', purpose: 'Charter', vessel: 'M/V Sea Dream' },
  { id: 'BC-003', traveler: 'Carlos Rivera', nationality: 'BVI', document: 'BVI Passport', travelType: 'Departure', date: '2025-03-15', port: 'Terrance B. Lettsome Intl', purpose: 'Business', vessel: 'LI Flight 567' },
  { id: 'BC-004', traveler: 'Li Wei', nationality: 'China', document: 'Passport', travelType: 'Arrival', date: '2025-03-14', port: 'Virgin Gorda Yacht Harbor', purpose: 'Yacht Tourism', vessel: 'S/Y Pacific Dream' },
  { id: 'BC-005', traveler: 'Patricia Harrigan', nationality: 'BVI', document: 'BVI Passport', travelType: 'Departure', date: '2025-03-14', port: 'Road Town Ferry Terminal', purpose: 'Personal', vessel: 'Smiths Ferry' },
  { id: 'BC-006', traveler: 'Mark Johnson', nationality: 'USA', document: 'Passport', travelType: 'Arrival', date: '2025-03-14', port: 'Terrance B. Lettsome Intl', purpose: 'Business', vessel: 'UA Flight 890' },
  { id: 'BC-007', traveler: 'Sophie Martin', nationality: 'France', document: 'Passport', travelType: 'Arrival', date: '2025-03-13', port: 'Anegada Ferry Dock', purpose: 'Tourism', vessel: 'Speedy\'s Ferry' },
  { id: 'BC-008', traveler: 'David Cameron', nationality: 'UK', document: 'Passport', travelType: 'Departure', date: '2025-03-13', port: 'Terrance B. Lettsome Intl', purpose: 'Transit', vessel: 'BA Flight 210' },
];

const mockResidency = [
  { id: 'R-001', applicant: 'James Fahie', type: 'Belonger', yearsInBVI: 'Born', employer: 'BVI Communications', status: 'Approved', submitted: '2024-06-15' },
  { id: 'R-002', applicant: 'Priya Sharma', type: 'Permanent Residency', yearsInBVI: '8', employer: 'BVI Financial Services Ltd', status: 'Under Review', submitted: '2025-01-10' },
  { id: 'R-003', applicant: 'Carlos Mendez', type: 'Temporary Residency', yearsInBVI: '5', employer: 'Scratch Island Resort', status: 'Active', submitted: '2024-03-20' },
  { id: 'R-004', applicant: 'Anna Larsson', type: 'Permanent Residency', yearsInBVI: '12', employer: 'Self-employed (Interior Design)', status: 'Approved', submitted: '2024-08-05' },
  { id: 'R-005', applicant: 'Michael Okonkwo', type: 'Temporary Residency', yearsInBVI: '3', employer: 'Tortola Bakery', status: 'Expired', submitted: '2023-11-15' },
  { id: 'R-006', applicant: 'David Kim', type: 'Permanent Residency', yearsInBVI: '6', employer: 'BVI Tech Solutions', status: 'Pending', submitted: '2025-02-28' },
  { id: 'R-007', applicant: 'Fatima Al-Hassan', type: 'Temporary Residency', yearsInBVI: '2', employer: 'Cane Garden Bay Hotel', status: 'Active', submitted: '2024-09-12' },
];

const mockDeportations = [
  { id: 'DP-001', person: 'John Doe', nationality: 'Jamaica', reason: 'Overstayed work permit by 14 months', facility: 'BVI Detention Center', status: 'Active', nextHearing: '2025-03-20' },
  { id: 'DP-002', person: 'Ivan Petrov', nationality: 'Russia', reason: 'Working without valid permit', facility: 'BVI Detention Center', status: 'Under Review', nextHearing: '2025-03-25' },
  { id: 'DP-003', person: 'Luis Garcia', nationality: 'Dominican Republic', reason: 'Criminal conviction (theft)', facility: 'Her Majesty\'s Prison', status: 'Active', nextHearing: '2025-04-02' },
  { id: 'DP-004', person: 'Kwame Asante', nationality: 'Ghana', reason: 'Fraudulent document submission', facility: 'Released on Bond', status: 'Appealed', nextHearing: '2025-04-15' },
  { id: 'DP-005', person: 'Nguyen Tran', nationality: 'Vietnam', reason: 'Entry with false passport', facility: 'BVI Detention Center', status: 'Completed', nextHearing: '-' },
  { id: 'DP-006', person: 'Roberto Silva', nationality: 'Brazil', reason: 'Overstayed tourist visa', facility: 'BVI Detention Center', status: 'Active', nextHearing: '2025-03-28' },
];

const topNationalities = [
  { country: 'Jamaica', count: 312, pct: 25 },
  { country: 'Dominican Republic', count: 198, pct: 16 },
  { country: 'Philippines', count: 156, pct: 12 },
  { country: 'India', count: 134, pct: 11 },
  { country: 'USA', count: 112, pct: 9 },
];

export function AdminMinistryImmigration() {
  const { goBack, adminName } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');

  const statusColor = (status: string) => {
    switch (status) {
      case 'Active': case 'Approved': case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Pending': case 'Under Review': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Expired': case 'Rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Appealed': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={goBack} className="text-gray-400 hover:text-white border border-[#1E3A5F]">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500/15 rounded-xl flex items-center justify-center border border-purple-500/20">
              <Briefcase className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-3">
                Immigration Department
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">ACTIVE</Badge>
              </h1>
              <p className="text-sm text-gray-400">Border control, work permits, visas, and residency management</p>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
            <span className="text-purple-400 text-xs font-bold">{adminName?.charAt(0) || 'A'}</span>
          </div>
          <span className="text-xs text-gray-500">{adminName}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Active Work Permits', value: '1,247', icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10', trend: '+8.2%' },
          { label: 'Visas Processed', value: '4,512', icon: Globe, color: 'text-blue-400', bg: 'bg-blue-400/10', trend: '+12.4%' },
          { label: 'Arrivals This Month', value: '8,923', icon: Plane, color: 'text-sky-400', bg: 'bg-sky-400/10', trend: '+3.1%' },
          { label: 'Deportation Cases', value: '23', icon: UserX, color: 'text-red-400', bg: 'bg-red-400/10', trend: '-2' },
          { label: 'Residency Applications', value: '189', icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: '+15' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-[#131F2E] border-[#1E3A5F]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
                </div>
                <span className={`text-[10px] font-medium ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stat.trend}
                </span>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                : 'bg-[#131F2E] text-gray-400 hover:text-white hover:bg-[#182A3D] border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in">
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#131F2E] border-[#1E3A5F]">
                <CardContent className="p-5">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    Top Nationalities (Work Permits)
                  </h3>
                  <div className="space-y-3">
                    {topNationalities.map((n) => (
                      <div key={n.country} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">{n.country}</span>
                          <span className="text-purple-400 font-medium">{n.count} ({n.pct}%)</span>
                        </div>
                        <div className="w-full bg-[#0C1B2A] rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${n.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#131F2E] border-[#1E3A5F]">
                <CardContent className="p-5">
                  <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {[
                      { action: 'Work permit approved', detail: 'Carlos Mendez - Executive Chef', time: '2 hours ago', icon: CheckCircle2, color: 'text-emerald-400' },
                      { action: 'Visa application received', detail: 'Ahmed Hassan - Student Visa', time: '4 hours ago', icon: FileCheck, color: 'text-blue-400' },
                      { action: 'Arrival processed', detail: 'John Smith - USA Passport', time: '5 hours ago', icon: Plane, color: 'text-sky-400' },
                      { action: 'Deportation order issued', detail: 'Ivan Petrov - Russia', time: '1 day ago', icon: AlertTriangle, color: 'text-red-400' },
                      { action: 'Residency approved', detail: 'Anna Larsson - Permanent', time: '1 day ago', icon: UserCheck, color: 'text-emerald-400' },
                      { action: 'Border alert triggered', detail: 'Duplicate passport detected', time: '2 days ago', icon: Shield, color: 'text-amber-400' },
                      { action: 'Work permit renewed', detail: 'Priya Sharma - Sr. Accountant', time: '2 days ago', icon: CheckCircle2, color: 'text-emerald-400' },
                      { action: 'Yacht arrival logged', detail: 'S/Y Pacific Dream - 12 crew', time: '3 days ago', icon: Ship, color: 'text-blue-400' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#182A3D]/50">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color} bg-[#0C1B2A]`}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white font-medium">{item.action}</p>
                          <p className="text-xs text-gray-500">{item.detail}</p>
                        </div>
                        <span className="text-[10px] text-gray-600 shrink-0">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#131F2E] border-[#1E3A5F]">
              <CardContent className="p-5">
                <h3 className="text-white font-semibold mb-4">Immigration Flow Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-[#0C1B2A] rounded-xl">
                    <Plane className="w-6 h-6 text-sky-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">8,923</div>
                    <div className="text-xs text-gray-500">Arrivals (Month)</div>
                  </div>
                  <div className="text-center p-4 bg-[#0C1B2A] rounded-xl">
                    <Ship className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">7,456</div>
                    <div className="text-xs text-gray-500">Departures (Month)</div>
                  </div>
                  <div className="text-center p-4 bg-[#0C1B2A] rounded-xl">
                    <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">1,247</div>
                    <div className="text-xs text-gray-500">Active Work Permits</div>
                  </div>
                  <div className="text-center p-4 bg-[#0C1B2A] rounded-xl">
                    <Globe className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">234</div>
                    <div className="text-xs text-gray-500">Visas Pending</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* WORK PERMITS */}
        {activeTab === 'work-permits' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <div className="flex gap-2">
                {['All', 'Active', 'Pending', 'Expired'].map((f) => (
                  <button key={f} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    f === 'All' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' : 'bg-[#131F2E] text-gray-400 border border-[#1E3A5F]'
                  }`}>{f}</button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input placeholder="Search permits..." className="bg-[#131F2E] border border-[#1E3A5F] text-white text-sm pl-9 pr-4 py-2 rounded-lg w-64" />
              </div>
            </div>
            <div className="bg-[#131F2E] border border-[#1E3A5F] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-xs uppercase bg-[#0C1B2A] border-b border-[#1E3A5F]">
                      <th className="text-left px-4 py-3 font-medium">Permit #</th>
                      <th className="text-left px-4 py-3 font-medium">Applicant</th>
                      <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Employer</th>
                      <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Position</th>
                      <th className="text-left px-4 py-3 font-medium">Type</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Expiry</th>
                      <th className="text-right px-4 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockWorkPermits.map((wp) => (
                      <tr key={wp.id} className="border-t border-[#1E3A5F]/50 hover:bg-[#182A3D]/50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-300">{wp.id}</td>
                        <td className="px-4 py-3 text-white font-medium">{wp.applicant}</td>
                        <td className="px-4 py-3 text-gray-300 hidden md:table-cell">{wp.employer}</td>
                        <td className="px-4 py-3 text-gray-300 hidden lg:table-cell">{wp.position}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-[10px] ${wp.type === 'Skilled' ? 'border-purple-500/30 text-purple-400' : wp.type === 'Semi-skilled' ? 'border-amber-500/30 text-amber-400' : 'border-sky-500/30 text-sky-400'}`}>
                            {wp.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-[10px] ${statusColor(wp.status)}`}>{wp.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">{wp.expiry}</td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" className="text-purple-400 text-xs h-7">
                            <Eye className="w-3.5 h-3.5 mr-1" />View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VISA PROCESSING */}
        {activeTab === 'visa-processing' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {['All', 'Approved', 'Pending', 'Rejected'].map((f) => (
                <button key={f} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  f === 'All' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' : 'bg-[#131F2E] text-gray-400 border border-[#1E3A5F]'
                }`}>{f}</button>
              ))}
            </div>
            <div className="bg-[#131F2E] border border-[#1E3A5F] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-xs uppercase bg-[#0C1B2A] border-b border-[#1E3A5F]">
                      <th className="text-left px-4 py-3 font-medium">Visa #</th>
                      <th className="text-left px-4 py-3 font-medium">Applicant</th>
                      <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Nationality</th>
                      <th className="text-left px-4 py-3 font-medium">Type</th>
                      <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Duration</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-right px-4 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockVisas.map((v) => (
                      <tr key={v.id} className="border-t border-[#1E3A5F]/50 hover:bg-[#182A3D]/50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-300">{v.id}</td>
                        <td className="px-4 py-3 text-white font-medium">{v.applicant}</td>
                        <td className="px-4 py-3 text-gray-300 hidden md:table-cell">{v.nationality}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-[10px] ${v.type === 'Business' ? 'border-purple-500/30 text-purple-400' : v.type === 'Tourist' ? 'border-emerald-500/30 text-emerald-400' : v.type === 'Student' ? 'border-blue-500/30 text-blue-400' : 'border-sky-500/30 text-sky-400'}`}>
                            {v.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">{v.duration}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-[10px] ${statusColor(v.status)}`}>{v.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" className="text-purple-400 text-xs h-7">
                            <Eye className="w-3.5 h-3.5 mr-1" />View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* BORDER CONTROL */}
        {activeTab === 'border-control' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {['All', 'Arrival', 'Departure'].map((f) => (
                <button key={f} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  f === 'All' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' : 'bg-[#131F2E] text-gray-400 border border-[#1E3A5F]'
                }`}>{f}</button>
              ))}
            </div>
            <div className="bg-[#131F2E] border border-[#1E3A5F] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-xs uppercase bg-[#0C1B2A] border-b border-[#1E3A5F]">
                      <th className="text-left px-4 py-3 font-medium">Log #</th>
                      <th className="text-left px-4 py-3 font-medium">Traveler</th>
                      <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Nationality</th>
                      <th className="text-left px-4 py-3 font-medium">Type</th>
                      <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Port</th>
                      <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Vessel/Flight</th>
                      <th className="text-left px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockBorderControl.map((bc) => (
                      <tr key={bc.id} className="border-t border-[#1E3A5F]/50 hover:bg-[#182A3D]/50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-300">{bc.id}</td>
                        <td className="px-4 py-3 text-white font-medium">{bc.traveler}</td>
                        <td className="px-4 py-3 text-gray-300 hidden md:table-cell">{bc.nationality}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-[10px] ${bc.travelType === 'Arrival' ? 'border-emerald-500/30 text-emerald-400' : 'border-sky-500/30 text-sky-400'}`}>
                            {bc.travelType === 'Arrival' ? '↓' : '↑'} {bc.travelType}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-300 text-xs hidden lg:table-cell">{bc.port}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">{bc.vessel}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{bc.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* RESIDENCY TRACKER */}
        {activeTab === 'residency' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {['All', 'Approved', 'Active', 'Pending', 'Expired'].map((f) => (
                <button key={f} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  f === 'All' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' : 'bg-[#131F2E] text-gray-400 border border-[#1E3A5F]'
                }`}>{f}</button>
              ))}
            </div>
            <div className="bg-[#131F2E] border border-[#1E3A5F] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-xs uppercase bg-[#0C1B2A] border-b border-[#1E3A5F]">
                      <th className="text-left px-4 py-3 font-medium">ID</th>
                      <th className="text-left px-4 py-3 font-medium">Applicant</th>
                      <th className="text-left px-4 py-3 font-medium">Type</th>
                      <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Years in BVI</th>
                      <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Employer</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockResidency.map((r) => (
                      <tr key={r.id} className="border-t border-[#1E3A5F]/50 hover:bg-[#182A3D]/50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-300">{r.id}</td>
                        <td className="px-4 py-3 text-white font-medium">{r.applicant}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-[10px] ${r.type === 'Belonger' ? 'border-emerald-500/30 text-emerald-400' : r.type === 'Permanent Residency' ? 'border-purple-500/30 text-purple-400' : 'border-sky-500/30 text-sky-400'}`}>
                            {r.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-300 hidden md:table-cell">{r.yearsInBVI}</td>
                        <td className="px-4 py-3 text-gray-300 hidden lg:table-cell">{r.employer}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-[10px] ${statusColor(r.status)}`}>{r.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">{r.submitted}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* DEPORTATION CASES */}
        {activeTab === 'deportation' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-red-400">4</div>
                <div className="text-xs text-gray-500">Active Cases</div>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-amber-400">1</div>
                <div className="text-xs text-gray-500">Under Review</div>
              </div>
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-purple-400">1</div>
                <div className="text-xs text-gray-500">Appealed</div>
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-emerald-400">1</div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
            </div>
            <div className="bg-[#131F2E] border border-[#1E3A5F] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-xs uppercase bg-[#0C1B2A] border-b border-[#1E3A5F]">
                      <th className="text-left px-4 py-3 font-medium">Case #</th>
                      <th className="text-left px-4 py-3 font-medium">Person</th>
                      <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Nationality</th>
                      <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Reason</th>
                      <th className="text-left px-4 py-3 font-medium">Facility</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Next Hearing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockDeportations.map((d) => (
                      <tr key={d.id} className="border-t border-[#1E3A5F]/50 hover:bg-[#182A3D]/50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-300">{d.id}</td>
                        <td className="px-4 py-3 text-white font-medium">{d.person}</td>
                        <td className="px-4 py-3 text-gray-300 hidden md:table-cell">{d.nationality}</td>
                        <td className="px-4 py-3 text-gray-300 text-xs hidden lg:table-cell max-w-[200px] truncate">{d.reason}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{d.facility}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-[10px] ${statusColor(d.status)}`}>{d.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">{d.nextHearing}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
