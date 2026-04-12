'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  Car,
  ArrowLeft,
  CreditCard,
  UserCheck,
  ClipboardList,
  AlertTriangle,
  DollarSign,
  CarFront,
  Bike,
  Truck,
  Gauge,
  TrendingUp,
  Calendar,
  Shield,
  Eye,
  Wrench,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
} from 'lucide-react';

// ──────────────────────────────────────────────
// Mock Data
// ──────────────────────────────────────────────

const LICENSE_DATA = [
  { id: 'L-2024-01847', applicant: 'Marcus A. Malone', licenseNumber: 'DMV-8847', class: 'Class 3', type: 'Renewal', status: 'Active', expiry: '2027-03-15' },
  { id: 'L-2024-01923', applicant: 'Tanya L. Smith', licenseNumber: 'DMV-7621', class: 'Class 1', type: 'New', status: 'Pending', expiry: '—' },
  { id: 'L-2024-01501', applicant: 'David R. Wheatley', licenseNumber: 'DMV-5430', class: 'Class 2', type: 'Replacement', status: 'Active', expiry: '2026-08-22' },
  { id: 'L-2024-02010', applicant: 'Keisha B. Forbes', licenseNumber: 'DMV-3318', class: 'Class 4', type: 'Renewal', status: 'Expired', expiry: '2024-11-30' },
  { id: 'L-2024-02155', applicant: 'Orlando P. Georges', licenseNumber: 'DMV-9905', class: 'Class 1', type: 'New', status: 'Active', expiry: '2028-01-10' },
  { id: 'L-2024-01789', applicant: 'Janine C. Lettsome', licenseNumber: 'DMV-6672', class: 'Class 3', type: 'Renewal', status: 'Suspended', expiry: '2025-06-01' },
  { id: 'L-2024-02234', applicant: 'Andre M. Fahie', licenseNumber: 'DMV-1104', class: 'Class 2', type: 'New', status: 'Active', expiry: '2027-09-18' },
  { id: 'L-2024-01988', applicant: 'Sharon D. Vanterpool', licenseNumber: 'DMV-4477', class: 'Class 1', type: 'Replacement', status: 'Active', expiry: '2026-12-05' },
];

const VEHICLE_DATA = [
  { plateNumber: 'BV-4521', owner: 'Marcus A. Malone', makeModel: 'Toyota RAV4', year: 2022, color: 'White', type: 'Private', status: 'Registered', inspectionDue: '2025-07-20' },
  { plateNumber: 'BV-7833', owner: 'Tortola Taxi Co.', makeModel: 'Honda CR-V', year: 2021, color: 'Yellow', type: 'Commercial', status: 'Registered', inspectionDue: '2025-06-15' },
  { plateNumber: 'BV-1290', owner: 'David R. Wheatley', makeModel: 'Ford F-150', year: 2020, color: 'Black', type: 'Private', status: 'Registered', inspectionDue: '2025-08-01' },
  { plateNumber: 'MC-567', owner: 'Keisha B. Forbes', makeModel: 'Honda CBR500R', year: 2023, color: 'Red', type: 'Motorcycle', status: 'Registered', inspectionDue: '2025-05-30' },
  { plateNumber: 'BV-9102', owner: 'Orlando P. Georges', makeModel: 'Nissan Frontier', year: 2019, color: 'Silver', type: 'Private', status: 'Suspended', inspectionDue: '—' },
  { plateNumber: 'BV-3345', owner: 'BVI Cargo Ltd.', makeModel: 'Mitsubishi Canter', year: 2021, color: 'White', type: 'Commercial', status: 'Registered', inspectionDue: '2025-09-12' },
  { plateNumber: 'BV-6678', owner: 'Janine C. Lettsome', makeModel: 'Hyundai Tucson', year: 2023, color: 'Blue', type: 'Private', status: 'Deregistered', inspectionDue: '—' },
  { plateNumber: 'MC-234', owner: 'Andre M. Fahie', makeModel: 'Kawasaki Ninja 400', year: 2022, color: 'Green', type: 'Motorcycle', status: 'Registered', inspectionDue: '2025-07-05' },
];

const VIOLATION_DATA = [
  { violationNumber: 'TV-2024-4521', driver: 'Marcus A. Malone', violationType: 'Speeding', date: '2025-01-15', location: 'Wickhams Cay Rd', fineAmount: '$150', status: 'Paid', points: 3 },
  { violationNumber: 'TV-2024-4530', driver: 'Orlando P. Georges', violationType: 'DUI', date: '2025-01-18', location: 'Sir Francis Drake Hwy', fineAmount: '$500', status: 'Court', points: 8 },
  { violationNumber: 'TV-2024-4542', driver: 'Keisha B. Forbes', violationType: 'No Insurance', date: '2025-01-20', location: 'Road Town Main St', fineAmount: '$300', status: 'Pending', points: 4 },
  { violationNumber: 'TV-2024-4555', driver: 'Tanya L. Smith', violationType: 'No License', date: '2025-01-22', location: 'Savannah Bay Rd', fineAmount: '$200', status: 'Dismissed', points: 0 },
  { violationNumber: 'TV-2024-4561', driver: 'Andre M. Fahie', violationType: 'Reckless', date: '2025-01-25', location: 'Cane Garden Bay Rd', fineAmount: '$400', status: 'Pending', points: 6 },
  { violationNumber: 'TV-2024-4573', driver: 'Janine C. Lettsome', violationType: 'Speeding', date: '2025-01-28', location: 'Wickhams Cay Rd', fineAmount: '$150', status: 'Paid', points: 3 },
  { violationNumber: 'TV-2024-4580', driver: 'Sharon D. Vanterpool', violationType: 'No License', date: '2025-02-01', location: 'West End Rd', fineAmount: '$200', status: 'Paid', points: 2 },
];

const INSPECTION_DATA = [
  { id: 'INS-2025-001', vehicle: 'BV-4521 (Toyota RAV4)', owner: 'Marcus A. Malone', scheduledDate: '2025-07-20', inspector: 'James B. Hodge', type: 'Annual', status: 'Scheduled' },
  { id: 'INS-2025-002', vehicle: 'BV-7833 (Honda CR-V)', owner: 'Tortola Taxi Co.', scheduledDate: '2025-06-15', inspector: 'Carlton D. Scatliffe', type: 'Taxi', status: 'Scheduled' },
  { id: 'INS-2025-003', vehicle: 'MC-567 (Honda CBR500R)', owner: 'Keisha B. Forbes', scheduledDate: '2025-05-30', inspector: 'Dwayne A. Thomas', type: 'Annual', status: 'Completed' },
  { id: 'INS-2025-004', vehicle: 'BV-3345 (Mitsubishi Canter)', owner: 'BVI Cargo Ltd.', scheduledDate: '2025-09-12', inspector: 'James B. Hodge', type: 'Commercial', status: 'Scheduled' },
  { id: 'INS-2025-005', vehicle: 'BV-1290 (Ford F-150)', owner: 'David R. Wheatley', scheduledDate: '2025-08-01', inspector: 'Carlton D. Scatliffe', type: 'Annual', status: 'Scheduled' },
  { id: 'INS-2025-006', vehicle: 'MC-234 (Kawasaki Ninja 400)', owner: 'Andre M. Fahie', scheduledDate: '2025-07-05', inspector: 'Dwayne A. Thomas', type: 'Annual', status: 'Completed' },
  { id: 'INS-2025-007', vehicle: 'BV-4567 (Isuzu D-Max)', owner: 'Lyndon G. Romney', scheduledDate: '2025-06-28', inspector: 'James B. Hodge', type: 'Commercial', status: 'Failed' },
  { id: 'INS-2025-008', vehicle: 'BV-8890 (Suzuki Swift)', owner: 'Petra K. Hodge', scheduledDate: '2025-07-15', inspector: 'Carlton D. Scatliffe', type: 'Annual', status: 'Scheduled' },
];

const ROAD_TAX_DATA = [
  { plateNumber: 'BV-4521', owner: 'Marcus A. Malone', vehicleType: 'Private', taxAmount: '$175', period: 'Annual', status: 'Paid', paymentDate: '2025-01-10' },
  { plateNumber: 'BV-7833', owner: 'Tortola Taxi Co.', vehicleType: 'Commercial', taxAmount: '$450', period: 'Annual', status: 'Paid', paymentDate: '2025-01-15' },
  { plateNumber: 'BV-1290', owner: 'David R. Wheatley', vehicleType: 'Private', taxAmount: '$175', period: 'Half-Year', status: 'Overdue', paymentDate: '—' },
  { plateNumber: 'MC-567', owner: 'Keisha B. Forbes', vehicleType: 'Motorcycle', taxAmount: '$60', period: 'Annual', status: 'Paid', paymentDate: '2025-02-01' },
  { plateNumber: 'BV-9102', owner: 'Orlando P. Georges', vehicleType: 'Private', taxAmount: '$175', period: 'Annual', status: 'Exempt', paymentDate: '—' },
  { plateNumber: 'BV-3345', owner: 'BVI Cargo Ltd.', vehicleType: 'Commercial', taxAmount: '$450', period: 'Annual', status: 'Paid', paymentDate: '2025-01-20' },
  { plateNumber: 'BV-6678', owner: 'Janine C. Lettsome', vehicleType: 'Private', taxAmount: '$175', period: 'Annual', status: 'Overdue', paymentDate: '—' },
  { plateNumber: 'MC-234', owner: 'Andre M. Fahie', vehicleType: 'Motorcycle', taxAmount: '$60', period: 'Annual', status: 'Paid', paymentDate: '2025-01-25' },
];

const MONTHLY_REGISTRATIONS = [
  { month: 'Sep', count: 89 },
  { month: 'Oct', count: 102 },
  { month: 'Nov', count: 78 },
  { month: 'Dec', count: 95 },
  { month: 'Jan', count: 118 },
  { month: 'Feb', count: 134 },
  { month: 'Mar', count: 121 },
  { month: 'Apr', count: 108 },
  { month: 'May', count: 142 },
  { month: 'Jun', count: 156 },
  { month: 'Jul', count: 132 },
  { month: 'Aug', count: 147 },
];

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function getStatusBadge(status: string) {
  switch (status) {
    case 'Active':
    case 'Registered':
    case 'Paid':
    case 'Completed':
      return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25">{status}</Badge>;
    case 'Pending':
    case 'Scheduled':
      return <Badge className="bg-sky-500/15 text-sky-400 border-sky-500/20 hover:bg-sky-500/25">{status}</Badge>;
    case 'Expired':
    case 'Suspended':
    case 'Overdue':
    case 'Failed':
      return <Badge className="bg-red-500/15 text-red-400 border-red-500/20 hover:bg-red-500/25">{status}</Badge>;
    case 'Court':
      return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/25">{status}</Badge>;
    case 'Dismissed':
    case 'Exempt':
      return <Badge className="bg-gray-500/15 text-gray-400 border-gray-500/20 hover:bg-gray-500/25">{status}</Badge>;
    case 'Deregistered':
      return <Badge className="bg-gray-500/15 text-gray-400 border-gray-500/20 hover:bg-gray-500/25">{status}</Badge>;
    default:
      return <Badge variant="outline" className="border-[#1E3A5F] text-gray-400">{status}</Badge>;
  }
}

function getViolationTypeBadge(type: string) {
  const colors: Record<string, string> = {
    Speeding: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
    'No License': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    DUI: 'bg-red-500/15 text-red-400 border-red-500/20',
    'No Insurance': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    Reckless: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  };
  return <Badge className={colors[type] || 'bg-gray-500/15 text-gray-400 border-gray-500/20'}>{type}</Badge>;
}

function getInspectionTypeBadge(type: string) {
  switch (type) {
    case 'Annual':
      return <Badge className="bg-sky-500/15 text-sky-400 border-sky-500/20 hover:bg-sky-500/25">{type}</Badge>;
    case 'Taxi':
      return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/25">{type}</Badge>;
    case 'Commercial':
      return <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/20 hover:bg-purple-500/25">{type}</Badge>;
    default:
      return <Badge variant="outline" className="border-[#1E3A5F] text-gray-400">{type}</Badge>;
  }
}

function getVehicleTypeIcon(type: string) {
  switch (type) {
    case 'Private':
      return <CarFront className="w-4 h-4 text-sky-400" />;
    case 'Commercial':
      return <Truck className="w-4 h-4 text-amber-400" />;
    case 'Motorcycle':
      return <Bike className="w-4 h-4 text-purple-400" />;
    default:
      return <Car className="w-4 h-4 text-gray-400" />;
  }
}

// ──────────────────────────────────────────────
// Overview Tab
// ──────────────────────────────────────────────

function OverviewTab() {
  const vehicleTypes = [
    { label: 'Private', count: 8742, icon: CarFront, color: 'text-sky-400', bg: 'bg-sky-500/10', percentage: 68 },
    { label: 'Commercial', count: 2891, icon: Truck, color: 'text-amber-400', bg: 'bg-amber-500/10', percentage: 22.5 },
    { label: 'Motorcycle', count: 1214, icon: Bike, color: 'text-purple-400', bg: 'bg-purple-500/10', percentage: 9.5 },
  ];

  const maxRegCount = Math.max(...MONTHLY_REGISTRATIONS.map((m) => m.count));

  return (
    <div className="space-y-6">
      {/* Vehicle vs License Ratio */}
      <Card className="bg-[#131F2E] border-[#1E3A5F]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Gauge className="w-5 h-5 text-sky-400" />
            <h3 className="text-white font-semibold">Vehicle-to-License Ratio</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Registered Vehicles</span>
                <span className="text-lg font-bold text-white">12,847</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#1E3A5F] overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full" style={{ width: '78%' }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Active Licenses</span>
                <span className="text-lg font-bold text-white">8,234</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#1E3A5F] overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: '50%' }} />
              </div>
            </div>
            <div className="bg-[#0C1B2A] rounded-xl p-5 border border-[#1E3A5F]/50">
              <div className="text-center">
                <div className="text-4xl font-bold text-sky-400 mb-1">1.56 : 1</div>
                <p className="text-sm text-gray-400">Vehicles per licensed driver</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-[#131F2E] rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">Unlicensed Vehicles</div>
                  <div className="text-lg font-bold text-amber-400">4,613</div>
                </div>
                <div className="bg-[#131F2E] rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">New This Month</div>
                  <div className="text-lg font-bold text-emerald-400">156</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Vehicle Types */}
      <Card className="bg-[#131F2E] border-[#1E3A5F]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <CarFront className="w-5 h-5 text-sky-400" />
            <h3 className="text-white font-semibold">Popular Vehicle Types</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vehicleTypes.map((vt) => (
              <div
                key={vt.label}
                className="bg-[#0C1B2A] rounded-xl p-5 border border-[#1E3A5F]/50 hover:border-sky-500/30 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 ${vt.bg} rounded-lg flex items-center justify-center`}>
                    <vt.icon className={`w-5 h-5 ${vt.color}`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{vt.label}</div>
                    <div className={`text-xs ${vt.color}`}>{vt.percentage}% of fleet</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-3">{vt.count.toLocaleString()}</div>
                <Progress value={vt.percentage} className="h-2 bg-[#1E3A5F] [&>div]:bg-gradient-to-r [&>div]:from-sky-500 [&>div]:to-sky-400" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly New Registrations Trend */}
      <Card className="bg-[#131F2E] border-[#1E3A5F]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-400" />
              <h3 className="text-white font-semibold">Monthly New Registrations</h3>
            </div>
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20">
              +12.4% YoY
            </Badge>
          </div>
          <div className="flex items-end gap-2 h-48">
            {MONTHLY_REGISTRATIONS.map((m, i) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-500 font-medium">{m.count}</span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-sky-600 to-sky-400 transition-all hover:from-sky-500 hover:to-sky-300 cursor-pointer"
                  style={{ height: `${(m.count / maxRegCount) * 140}px` }}
                  title={`${m.month}: ${m.count} registrations`}
                />
                <span className="text-[10px] text-gray-500">{m.month}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────
// License Services Tab
// ──────────────────────────────────────────────

function LicenseServicesTab() {
  return (
    <Card className="bg-[#131F2E] border-[#1E3A5F]">
      <CardContent className="p-0">
        <div className="p-5 border-b border-[#1E3A5F]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-sky-400" />
              <h3 className="text-white font-semibold">License Services</h3>
            </div>
            <Badge variant="outline" className="border-[#1E3A5F] text-gray-400">
              {LICENSE_DATA.length} records
            </Badge>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#1E3A5F]/50 hover:bg-transparent">
                <TableHead className="text-gray-400 text-xs font-medium">ID</TableHead>
                <TableHead className="text-gray-400 text-xs font-medium">Applicant</TableHead>
                <TableHead className="text-gray-400 text-xs font-medium">License #</TableHead>
                <TableHead className="text-gray-400 text-xs font-medium">Class</TableHead>
                <TableHead className="text-gray-400 text-xs font-medium">Type</TableHead>
                <TableHead className="text-gray-400 text-xs font-medium">Status</TableHead>
                <TableHead className="text-gray-400 text-xs font-medium">Expiry</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LICENSE_DATA.map((lic) => (
                <TableRow key={lic.id} className="border-[#1E3A5F]/30 hover:bg-[#0C1B2A]/50">
                  <TableCell className="text-gray-500 text-xs font-mono">{lic.id}</TableCell>
                  <TableCell className="text-white text-sm font-medium">{lic.applicant}</TableCell>
                  <TableCell className="text-sky-400 text-sm font-mono">{lic.licenseNumber}</TableCell>
                  <TableCell>
                    <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/25 text-[11px]">
                      {lic.class}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300 text-sm">{lic.type}</TableCell>
                  <TableCell>{getStatusBadge(lic.status)}</TableCell>
                  <TableCell className="text-gray-400 text-sm">{lic.expiry}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ──────────────────────────────────────────────
// Vehicle Registry Tab
// ──────────────────────────────────────────────

function VehicleRegistryTab() {
  return (
    <Card className="bg-[#131F2E] border-[#1E3A5F]">
      <CardContent className="p-0">
        <div className="p-5 border-b border-[#1E3A5F]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CarFront className="w-5 h-5 text-sky-400" />
              <h3 className="text-white font-semibold">Vehicle Registry</h3>
            </div>
            <Badge variant="outline" className="border-[#1E3A5F] text-gray-400">
              {VEHICLE_DATA.length} vehicles
            </Badge>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#1E3A5F]/50 hover:bg-transparent">
                <TableHead className="text-gray-400 text-xs font-medium">Plate #</TableHead>
                <TableHead className="text-gray-400 text-xs font-medium">Owner</TableHead>
                <TableHead className="text-gray-400 text-xs font-medium">Make / Model</TableHead>
                <TableHead className="text-gray-400 text-xs font-medium">Year</TableHead>
                <TableHead className="text-gray-400 text-xs font-medium">Color</TableHead>
                <TableHead className="text-gray-400 text-xs font-medium">Type</TableHead>
                <TableHead className="text-gray-400 text-xs font-medium">Status</TableHead>
                <TableHead className="text-gray-400 text-xs font-medium">Inspection Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {VEHICLE_DATA.map((v) => (
                <TableRow key={v.plateNumber} className="border-[#1E3A5F]/30 hover:bg-[#0C1B2A]/50">
                  <TableCell className="text-sky-400 text-sm font-mono font-semibold">{v.plateNumber}</TableCell>
                  <TableCell className="text-white text-sm font-medium">{v.owner}</TableCell>
                  <TableCell className="text-gray-300 text-sm">{v.makeModel}</TableCell>
                  <TableCell className="text-gray-400 text-sm">{v.year}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full border border-gray-600"
                        style={{ backgroundColor: v.color.toLowerCase() === 'silver' ? '#C0C0C0' : v.color.toLowerCase() }}
                      />
                      <span className="text-gray-300 text-sm">{v.color}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {getVehicleTypeIcon(v.type)}
                      <span className="text-gray-300 text-sm">{v.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(v.status)}</TableCell>
                  <TableCell className="text-gray-400 text-sm">{v.inspectionDue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ──────────────────────────────────────────────
// Traffic Violations Tab
// ──────────────────────────────────────────────

function TrafficViolationsTab() {
  return (
    <Card className="bg-[#131F2E] border-[#1E3A5F]">
      <CardContent className="p-0">
        <div className="p-5 border-b border-[#1E3A5F]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-sky-400" />
              <h3 className="text-white font-semibold">Traffic Violations</h3>
            </div>
            <Badge variant="outline" className="border-[#1E3A5F] text-gray-400">
              {VIOLATION_DATA.length} records
            </Badge>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#1E3A5F]/50 hover:bg-transparent">
                <TableHead className="text-gray-400 text-xs font-medium">Violation #</TableHead>
                <TableHead className="text-gray-400 text-xs font-medium">Driver</TableHead>
                <TableHead className="text-gray-400 text-xs font-medium">Type</TableHead>
                <TableHead className="text-gray-400 text-xs font-medium">Date</TableHead>
                <TableHead className="text-gray-400 text-xs font-medium">Location</TableHead>
                <TableHead className="text-gray-400 text-xs font-medium">Fine</TableHead>
                <TableHead className="text-gray-400 text-xs font-medium">Status</TableHead>
                <TableHead className="text-gray-400 text-xs font-medium">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {VIOLATION_DATA.map((v) => (
                <TableRow key={v.violationNumber} className="border-[#1E3A5F]/30 hover:bg-[#0C1B2A]/50">
                  <TableCell className="text-gray-500 text-xs font-mono">{v.violationNumber}</TableCell>
                  <TableCell className="text-white text-sm font-medium">{v.driver}</TableCell>
                  <TableCell>{getViolationTypeBadge(v.violationType)}</TableCell>
                  <TableCell className="text-gray-400 text-sm">{v.date}</TableCell>
                  <TableCell className="text-gray-300 text-sm max-w-[180px] truncate">{v.location}</TableCell>
                  <TableCell className="text-white text-sm font-semibold">{v.fineAmount}</TableCell>
                  <TableCell>{getStatusBadge(v.status)}</TableCell>
                  <TableCell>
                    <span className={`text-sm font-bold ${v.points >= 6 ? 'text-red-400' : v.points > 0 ? 'text-amber-400' : 'text-gray-500'}`}>
                      {v.points}
                    </span>
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

// ──────────────────────────────────────────────
// Inspection Scheduler Tab
// ──────────────────────────────────────────────

function InspectionSchedulerTab() {
  const statusIcon = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return <Clock className="w-4 h-4 text-sky-400" />;
      case 'Completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'Failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  // Group inspections by month for a calendar-like view
  const scheduled = INSPECTION_DATA.filter((i) => i.status === 'Scheduled');
  const completed = INSPECTION_DATA.filter((i) => i.status === 'Completed');
  const failed = INSPECTION_DATA.filter((i) => i.status === 'Failed');

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{scheduled.length}</div>
                <div className="text-xs text-gray-400">Scheduled</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{completed.length}</div>
                <div className="text-xs text-gray-400">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{failed.length}</div>
                <div className="text-xs text-gray-400">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inspection List */}
      <Card className="bg-[#131F2E] border-[#1E3A5F]">
        <CardContent className="p-0">
          <div className="p-5 border-b border-[#1E3A5F]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-sky-400" />
                <h3 className="text-white font-semibold">Upcoming Inspections</h3>
              </div>
              <Badge variant="outline" className="border-[#1E3A5F] text-gray-400">
                {INSPECTION_DATA.length} scheduled
              </Badge>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#1E3A5F]/50 hover:bg-transparent">
                  <TableHead className="text-gray-400 text-xs font-medium">ID</TableHead>
                  <TableHead className="text-gray-400 text-xs font-medium">Vehicle</TableHead>
                  <TableHead className="text-gray-400 text-xs font-medium">Owner</TableHead>
                  <TableHead className="text-gray-400 text-xs font-medium">Date</TableHead>
                  <TableHead className="text-gray-400 text-xs font-medium">Inspector</TableHead>
                  <TableHead className="text-gray-400 text-xs font-medium">Type</TableHead>
                  <TableHead className="text-gray-400 text-xs font-medium">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {INSPECTION_DATA.map((insp) => (
                  <TableRow key={insp.id} className="border-[#1E3A5F]/30 hover:bg-[#0C1B2A]/50">
                    <TableCell className="text-gray-500 text-xs font-mono">{insp.id}</TableCell>
                    <TableCell className="text-white text-sm font-medium">{insp.vehicle}</TableCell>
                    <TableCell className="text-gray-300 text-sm">{insp.owner}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-gray-300 text-sm">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        {insp.scheduledDate}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300 text-sm">{insp.inspector}</TableCell>
                    <TableCell>{getInspectionTypeBadge(insp.type)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {statusIcon(insp.status)}
                        {getStatusBadge(insp.status)}
                      </div>
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

// ──────────────────────────────────────────────
// Road Tax Tab
// ──────────────────────────────────────────────

function RoadTaxTab() {
  const totalCollected = ROAD_TAX_DATA
    .filter((t) => t.status === 'Paid')
    .reduce((sum, t) => sum + parseInt(t.taxAmount.replace(/[$,]/g, '')), 0);

  const overdueCount = ROAD_TAX_DATA.filter((t) => t.status === 'Overdue').length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">${totalCollected.toLocaleString()}</div>
                <div className="text-xs text-gray-400">Collected (sample)</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{overdueCount}</div>
                <div className="text-xs text-gray-400">Overdue Payments</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#131F2E] border-[#1E3A5F]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-500/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">$456K</div>
                <div className="text-xs text-gray-400">Annual Projection</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Road Tax Table */}
      <Card className="bg-[#131F2E] border-[#1E3A5F]">
        <CardContent className="p-0">
          <div className="p-5 border-b border-[#1E3A5F]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-sky-400" />
                <h3 className="text-white font-semibold">Road Tax Payments</h3>
              </div>
              <Badge variant="outline" className="border-[#1E3A5F] text-gray-400">
                {ROAD_TAX_DATA.length} records
              </Badge>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#1E3A5F]/50 hover:bg-transparent">
                  <TableHead className="text-gray-400 text-xs font-medium">Plate #</TableHead>
                  <TableHead className="text-gray-400 text-xs font-medium">Owner</TableHead>
                  <TableHead className="text-gray-400 text-xs font-medium">Vehicle Type</TableHead>
                  <TableHead className="text-gray-400 text-xs font-medium">Tax Amount</TableHead>
                  <TableHead className="text-gray-400 text-xs font-medium">Period</TableHead>
                  <TableHead className="text-gray-400 text-xs font-medium">Status</TableHead>
                  <TableHead className="text-gray-400 text-xs font-medium">Payment Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ROAD_TAX_DATA.map((tax) => (
                  <TableRow key={tax.plateNumber} className="border-[#1E3A5F]/30 hover:bg-[#0C1B2A]/50">
                    <TableCell className="text-sky-400 text-sm font-mono font-semibold">{tax.plateNumber}</TableCell>
                    <TableCell className="text-white text-sm font-medium">{tax.owner}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {getVehicleTypeIcon(tax.vehicleType)}
                        <span className="text-gray-300 text-sm">{tax.vehicleType}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-white text-sm font-semibold">{tax.taxAmount}</TableCell>
                    <TableCell>
                      <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/25 text-[11px]">
                        {tax.period}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(tax.status)}</TableCell>
                    <TableCell className="text-gray-400 text-sm">{tax.paymentDate}</TableCell>
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

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────

export function AdminMinistryDmv() {
  const { goBack, activeMinistryTab, setActiveMinistryTab } = useAppStore();

  const STATS = [
    {
      label: 'Registered Vehicles',
      value: '12,847',
      icon: Car,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      trend: '+156 this month',
    },
    {
      label: 'Active Licenses',
      value: '8,234',
      icon: CreditCard,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      trend: '+89 this month',
    },
    {
      label: 'Pending Tests',
      value: '156',
      icon: ClipboardList,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      trend: '23 this week',
    },
    {
      label: 'Violations This Month',
      value: '342',
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      trend: '-12% vs last month',
    },
    {
      label: 'Road Tax Collected',
      value: '$456K',
      icon: DollarSign,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      trend: 'Annual YTD',
    },
  ];

  return (
    <div className="space-y-6 section-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="h-10 w-10 rounded-lg bg-[#131F2E] border border-[#1E3A5F] text-gray-400 hover:text-white hover:bg-[#1E3A5F]/50 hover:border-sky-500/30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500/20 to-sky-600/10 border border-sky-500/30 flex items-center justify-center">
              <Car className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Department of Motor Vehicles</h1>
              <p className="text-xs sm:text-sm text-gray-400">Vehicle registration, licensing, inspections &amp; road safety</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-sky-500/15 text-sky-400 border-sky-500/20 gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            Live
          </Badge>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {STATS.map((stat) => (
          <Card key={stat.label} className="bg-[#131F2E] border-[#1E3A5F] hover:border-sky-500/20 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
              <div className="text-[10px] text-sky-400/70 mt-1.5 font-medium">{stat.trend}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs
        value={activeMinistryTab}
        onValueChange={setActiveMinistryTab}
        className="space-y-4"
      >
        <div className="overflow-x-auto -mx-1 px-1">
          <TabsList className="bg-[#131F2E] border border-[#1E3A5F] h-auto p-1.5 gap-1 flex-wrap">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-sky-500/15 data-[state=active]:text-sky-400 data-[state=active]:border-sky-500/30 text-gray-400 hover:text-gray-200 text-xs sm:text-sm px-3 py-2 border border-transparent rounded-lg transition-all"
            >
              <BarChart3 className="w-4 h-4 mr-1.5 hidden sm:inline-block" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="licenses"
              className="data-[state=active]:bg-sky-500/15 data-[state=active]:text-sky-400 data-[state=active]:border-sky-500/30 text-gray-400 hover:text-gray-200 text-xs sm:text-sm px-3 py-2 border border-transparent rounded-lg transition-all"
            >
              <CreditCard className="w-4 h-4 mr-1.5 hidden sm:inline-block" />
              License Services
            </TabsTrigger>
            <TabsTrigger
              value="vehicles"
              className="data-[state=active]:bg-sky-500/15 data-[state=active]:text-sky-400 data-[state=active]:border-sky-500/30 text-gray-400 hover:text-gray-200 text-xs sm:text-sm px-3 py-2 border border-transparent rounded-lg transition-all"
            >
              <Car className="w-4 h-4 mr-1.5 hidden sm:inline-block" />
              Vehicle Registry
            </TabsTrigger>
            <TabsTrigger
              value="violations"
              className="data-[state=active]:bg-sky-500/15 data-[state=active]:text-sky-400 data-[state=active]:border-sky-500/30 text-gray-400 hover:text-gray-200 text-xs sm:text-sm px-3 py-2 border border-transparent rounded-lg transition-all"
            >
              <Shield className="w-4 h-4 mr-1.5 hidden sm:inline-block" />
              Traffic Violations
            </TabsTrigger>
            <TabsTrigger
              value="inspections"
              className="data-[state=active]:bg-sky-500/15 data-[state=active]:text-sky-400 data-[state=active]:border-sky-500/30 text-gray-400 hover:text-gray-200 text-xs sm:text-sm px-3 py-2 border border-transparent rounded-lg transition-all"
            >
              <Eye className="w-4 h-4 mr-1.5 hidden sm:inline-block" />
              Inspections
            </TabsTrigger>
            <TabsTrigger
              value="roadtax"
              className="data-[state=active]:bg-sky-500/15 data-[state=active]:text-sky-400 data-[state=active]:border-sky-500/30 text-gray-400 hover:text-gray-200 text-xs sm:text-sm px-3 py-2 border border-transparent rounded-lg transition-all"
            >
              <DollarSign className="w-4 h-4 mr-1.5 hidden sm:inline-block" />
              Road Tax
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="licenses">
          <LicenseServicesTab />
        </TabsContent>
        <TabsContent value="vehicles">
          <VehicleRegistryTab />
        </TabsContent>
        <TabsContent value="violations">
          <TrafficViolationsTab />
        </TabsContent>
        <TabsContent value="inspections">
          <InspectionSchedulerTab />
        </TabsContent>
        <TabsContent value="roadtax">
          <RoadTaxTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
