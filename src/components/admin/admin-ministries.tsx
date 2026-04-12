'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Calculator,
  Briefcase,
  Baby,
  Car,
  Building2,
  ArrowRight,
  FileCheck,
  Users,
  Activity,
  Layers,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import type { CurrentView } from '@/lib/store';

interface MinistryModule {
  name: string;
  icon: string;
}

interface MinistryData {
  id: CurrentView;
  name: string;
  department: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  colorHex: string;
  gradientFrom: string;
  gradientTo: string;
  borderAccent: string;
  bgAccent: string;
  textAccent: string;
  badgeBg: string;
  badgeText: string;
  glowColor: string;
  modules: MinistryModule[];
  stats: {
    applicationsProcessed: number;
    revenueCollected: string;
    activeCases: number;
  };
}

const MINISTRIES: MinistryData[] = [
  {
    id: 'admin-ministry-rvipf',
    name: 'Royal Virgin Islands Police Force',
    department: 'RVIPF',
    description: 'Law enforcement operations, public safety management, and community policing programs across the territory.',
    icon: Shield,
    color: 'blue',
    colorHex: '#3B82F6',
    gradientFrom: 'from-blue-500/15',
    gradientTo: 'to-blue-900/10',
    borderAccent: 'border-blue-500/30',
    bgAccent: 'bg-blue-500/10',
    textAccent: 'text-blue-400',
    badgeBg: 'bg-blue-400/10',
    badgeText: 'text-blue-300',
    glowColor: 'hover:shadow-blue-500/10',
    modules: [
      { name: 'Certificate Generator', icon: 'FileCheck' },
      { name: 'Case Management', icon: 'Briefcase' },
      { name: 'Officer Roster', icon: 'Users' },
      { name: 'Equipment Inventory', icon: 'Layers' },
      { name: 'Incident Reports', icon: 'Activity' },
      { name: 'Community Programs', icon: 'Users' },
    ],
    stats: {
      applicationsProcessed: 1847,
      revenueCollected: '$124,500',
      activeCases: 342,
    },
  },
  {
    id: 'admin-ministry-revenue',
    name: 'Inland Revenue Department',
    department: 'Inland Revenue',
    description: 'Tax collection, business licensing, financial auditing, and government revenue management services.',
    icon: Calculator,
    color: 'amber',
    colorHex: '#F59E0B',
    gradientFrom: 'from-amber-500/15',
    gradientTo: 'to-amber-900/10',
    borderAccent: 'border-amber-500/30',
    bgAccent: 'bg-amber-500/10',
    textAccent: 'text-amber-400',
    badgeBg: 'bg-amber-400/10',
    badgeText: 'text-amber-300',
    glowColor: 'hover:shadow-amber-500/10',
    modules: [
      { name: 'Trade Licenses', icon: 'FileCheck' },
      { name: 'Tax Collection', icon: 'TrendingUp' },
      { name: 'Business Registry', icon: 'Building2' },
      { name: 'Audit Management', icon: 'Activity' },
      { name: 'Payment Plans', icon: 'Calculator' },
      { name: 'Financial Reports', icon: 'TrendingUp' },
    ],
    stats: {
      applicationsProcessed: 3201,
      revenueCollected: '$2.8M',
      activeCases: 589,
    },
  },
  {
    id: 'admin-ministry-immigration',
    name: 'Immigration Department',
    department: 'Immigration',
    description: 'Border control, visa processing, work permits, residency tracking, and arrival/departure monitoring.',
    icon: Briefcase,
    color: 'purple',
    colorHex: '#8B5CF6',
    gradientFrom: 'from-purple-500/15',
    gradientTo: 'to-purple-900/10',
    borderAccent: 'border-purple-500/30',
    bgAccent: 'bg-purple-500/10',
    textAccent: 'text-purple-400',
    badgeBg: 'bg-purple-400/10',
    badgeText: 'text-purple-300',
    glowColor: 'hover:shadow-purple-500/10',
    modules: [
      { name: 'Work Permits', icon: 'Briefcase' },
      { name: 'Visa Processing', icon: 'FileCheck' },
      { name: 'Border Control', icon: 'Shield' },
      { name: 'Residency Tracker', icon: 'Users' },
      { name: 'Deportation Cases', icon: 'Activity' },
      { name: 'Arrival/Departure Log', icon: 'TrendingUp' },
    ],
    stats: {
      applicationsProcessed: 4512,
      revenueCollected: '$1.9M',
      activeCases: 1203,
    },
  },
  {
    id: 'admin-ministry-civil-registry',
    name: 'Registry of Civil Status',
    department: 'Civil Registry',
    description: 'Vital records management including births, deaths, marriages, adoptions, and legal name changes.',
    icon: Baby,
    color: 'pink',
    colorHex: '#EC4899',
    gradientFrom: 'from-pink-500/15',
    gradientTo: 'to-pink-900/10',
    borderAccent: 'border-pink-500/30',
    bgAccent: 'bg-pink-500/10',
    textAccent: 'text-pink-400',
    badgeBg: 'bg-pink-400/10',
    badgeText: 'text-pink-300',
    glowColor: 'hover:shadow-pink-500/10',
    modules: [
      { name: 'Birth/Death/Marriage Certificates', icon: 'FileCheck' },
      { name: 'Vital Statistics', icon: 'Activity' },
      { name: 'Record Amendments', icon: 'Layers' },
      { name: 'Adoption Registry', icon: 'Users' },
      { name: 'Name Changes', icon: 'Briefcase' },
      { name: 'Statistical Reports', icon: 'TrendingUp' },
    ],
    stats: {
      applicationsProcessed: 2130,
      revenueCollected: '$89,200',
      activeCases: 156,
    },
  },
  {
    id: 'admin-ministry-dmv',
    name: 'Department of Motor Vehicles',
    department: 'DMV',
    description: 'Vehicle registration, driver licensing, traffic enforcement, inspections, and road safety programs.',
    icon: Car,
    color: 'sky',
    colorHex: '#38BDF8',
    gradientFrom: 'from-sky-500/15',
    gradientTo: 'to-sky-900/10',
    borderAccent: 'border-sky-500/30',
    bgAccent: 'bg-sky-500/10',
    textAccent: 'text-sky-400',
    badgeBg: 'bg-sky-400/10',
    badgeText: 'text-sky-300',
    glowColor: 'hover:shadow-sky-500/10',
    modules: [
      { name: 'License Services', icon: 'FileCheck' },
      { name: 'Vehicle Registry', icon: 'Car' },
      { name: 'Traffic Violations', icon: 'Shield' },
      { name: 'Inspection Scheduler', icon: 'Activity' },
      { name: 'Road Tax', icon: 'Calculator' },
      { name: 'Driving Tests', icon: 'Briefcase' },
    ],
    stats: {
      applicationsProcessed: 5670,
      revenueCollected: '$940,300',
      activeCases: 428,
    },
  },
  {
    id: 'admin-ministry-fsc',
    name: 'Financial Services Commission',
    department: 'FSC',
    description: 'Financial sector regulation, company registration, compliance monitoring, and regulatory oversight.',
    icon: Building2,
    color: 'emerald',
    colorHex: '#10B981',
    gradientFrom: 'from-emerald-500/15',
    gradientTo: 'to-emerald-900/10',
    borderAccent: 'border-emerald-500/30',
    bgAccent: 'bg-emerald-500/10',
    textAccent: 'text-emerald-400',
    badgeBg: 'bg-emerald-400/10',
    badgeText: 'text-emerald-300',
    glowColor: 'hover:shadow-emerald-500/10',
    modules: [
      { name: 'Company Registration', icon: 'Building2' },
      { name: 'Compliance Tracker', icon: 'Shield' },
      { name: 'License Monitoring', icon: 'FileCheck' },
      { name: 'Filing Deadlines', icon: 'Activity' },
      { name: 'Regulatory Alerts', icon: 'TrendingUp' },
      { name: 'Annual Returns', icon: 'Layers' },
    ],
    stats: {
      applicationsProcessed: 2890,
      revenueCollected: '$3.4M',
      activeCases: 764,
    },
  },
];

const SUMMARY_STATS = [
  {
    label: 'Total Ministries',
    value: '6',
    icon: Building2,
    color: 'text-[#FFD100]',
    bg: 'bg-[#FFD100]/10',
  },
  {
    label: 'Active Modules',
    value: '36',
    icon: Layers,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    label: 'Staff Members',
    value: '1,247',
    icon: Users,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  {
    label: 'Monthly Transactions',
    value: '20,250',
    icon: Activity,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
];

export function AdminMinistries() {
  const { setCurrentView } = useAppStore();

  const handleMinistryClick = (viewId: CurrentView) => {
    setCurrentView(viewId);
  };

  return (
    <div className="space-y-6 section-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD100]/20 to-[#009B3A]/20 border border-[#FFD100]/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#FFD100]" />
            </div>
            <h1 className="text-2xl font-bold text-white">Ministry Management Center</h1>
          </div>
          <p className="text-gray-400 text-sm ml-[52px]">
            All-in-one government administration hub — manage departments, modules, and operations across all 6 ministries.
          </p>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SUMMARY_STATS.map((stat) => (
          <Card key={stat.label} className="bg-[#131F2E] border-[#1E3A5F]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center shrink-0`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ministries Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-gray-400" />
            Government Departments
          </h2>
          <Badge variant="outline" className="border-[#1E3A5F] text-gray-400 text-xs">
            6 ministries · 36 modules
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {MINISTRIES.map((ministry, index) => {
            const IconComp = ministry.icon;

            return (
              <div
                key={ministry.id}
                className="group relative"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Gradient border wrapper */}
                <div
                  className={`absolute -inset-[1px] rounded-xl bg-gradient-to-br ${ministry.gradientFrom} ${ministry.gradientTo} opacity-50 group-hover:opacity-100 transition-opacity duration-300`}
                  style={{
                    background: `linear-gradient(135deg, ${ministry.colorHex}15 0%, ${ministry.colorHex}08 50%, transparent 100%)`,
                  }}
                />
                <div
                  className={`absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  style={{
                    background: `linear-gradient(135deg, ${ministry.colorHex}40 0%, transparent 60%)`,
                  }}
                />

                <Card
                  className={`relative bg-[#131F2E] ${ministry.borderAccent} border cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${ministry.glowColor} overflow-hidden`}
                  onClick={() => handleMinistryClick(ministry.id)}
                >
                  {/* Top color accent bar */}
                  <div
                    className="h-1 w-full opacity-60 group-hover:opacity-100 transition-opacity"
                    style={{ background: `linear-gradient(90deg, ${ministry.colorHex}, ${ministry.colorHex}40)` }}
                  />

                  <CardContent className="p-5">
                    {/* Ministry Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-12 h-12 rounded-xl ${ministry.bgAccent} border ${ministry.borderAccent} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}
                        >
                          <IconComp className={`w-6 h-6 ${ministry.textAccent}`} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-white leading-tight truncate">
                            {ministry.name}
                          </h3>
                          <p className={`text-xs ${ministry.textAccent} font-medium mt-0.5`}>
                            {ministry.department}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-8 h-8 rounded-lg ${ministry.bgAccent} flex items-center justify-center shrink-0 opacity-50 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5`}
                      >
                        <ChevronRight className={`w-4 h-4 ${ministry.textAccent}`} />
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">
                      {ministry.description}
                    </p>

                    {/* Modules */}
                    <div className="mb-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Layers className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                          Internal Modules
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {ministry.modules.map((module) => (
                          <span
                            key={module.name}
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium ${ministry.badgeBg} ${ministry.badgeText} border border-transparent group-hover:border-current/10 transition-colors`}
                          >
                            {module.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div
                      className="grid grid-cols-3 gap-3 pt-3 border-t border-[#1E3A5F]/50"
                    >
                      <div className="text-center">
                        <div className="text-base font-bold text-white">
                          {ministry.stats.applicationsProcessed.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">Processed</div>
                      </div>
                      <div className="text-center border-x border-[#1E3A5F]/50">
                        <div className={`text-base font-bold ${ministry.textAccent}`}>
                          {ministry.stats.revenueCollected}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="text-base font-bold text-white">
                          {ministry.stats.activeCases.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">Active Cases</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Info */}
      <Card className="bg-[#131F2E] border-[#1E3A5F]">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#009B3A]/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-[#009B3A]" />
              </div>
              <div>
                <p className="text-sm text-white font-medium">System Status: All Departments Operational</p>
                <p className="text-xs text-gray-500">Last synchronized 2 minutes ago · All 36 modules active</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#009B3A]/10 text-[#009B3A] text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#009B3A] animate-pulse" />
                Live
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
