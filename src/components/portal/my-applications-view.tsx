'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  Loader2,
  ArrowRight,
  FileCheck,
} from 'lucide-react';

interface Application {
  id: string;
  trackingNumber: string;
  applicantName: string;
  status: string;
  service: { name: string };
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  payment_pending: { label: 'Payment Pending', color: 'bg-amber-100 text-amber-700' },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'Processing', color: 'bg-sky-100 text-sky-700' },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  issued: { label: 'Issued', color: 'bg-emerald-100 text-emerald-700' },
};

export function MyApplicationsView() {
  const { setCurrentView, setTrackingInput } = useAppStore();
  const [email, setEmail] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/applications?email=${encodeURIComponent(email.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTracking = (tracking: string) => {
    setTrackingInput(tracking);
    setCurrentView('tracking');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 section-enter">
      <h1 className="text-2xl md:text-3xl font-bold text-[#0C1B2A] mb-2">My Applications</h1>
      <p className="text-gray-500 mb-8">Enter your email address to view all your applications</p>

      {/* Email Search */}
      <div className="flex gap-3 mb-8">
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="h-12 bg-white border-gray-200 rounded-xl"
        />
        <Button
          onClick={handleSearch}
          disabled={loading || !email.trim()}
          className="bg-[#009B3A] text-white hover:bg-[#007A2E] px-8 rounded-xl h-12"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
        </Button>
      </div>

      {/* Results */}
      {searched && applications.length === 0 && !loading && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">No applications found</h3>
          <p className="text-gray-400 mt-1">No applications found for this email address</p>
        </div>
      )}

      {applications.length > 0 && (
        <div className="space-y-3">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-[#0C1B2A] truncate">{app.service.name}</h3>
                  <Badge className={statusConfig[app.status]?.color || 'bg-gray-100'}>
                    {statusConfig[app.status]?.label || app.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="font-mono">{app.trackingNumber}</span>
                  <span className="hidden sm:inline">
                    {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewTracking(app.trackingNumber)}
                className="border-gray-200 shrink-0"
              >
                View Details
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
