'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  FileBadge,
  Download,
  Search,
  Filter,
  Calendar,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  Shield,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

interface Application {
  id: string;
  trackingNumber: string;
  applicantName: string;
  applicantEmail: string;
  status: string;
  paymentStatus: string;
  certificateNumber: string | null;
  createdAt: string;
  service: { name: string; slug: string; department: string };
}

export function AdminCertificates() {
  const { setCurrentView, setCurrentApplicationId } = useAppStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingApp, setViewingApp] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || data || []);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = applications.filter((app) => {
    const matchSearch = !search ||
      app.applicantName.toLowerCase().includes(search.toLowerCase()) ||
      app.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      (app.certificateNumber || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const certificateApps = filtered.filter((app) =>
    app.service.slug === 'police-certificate' ||
    app.service.slug === 'birth-certificate' ||
    app.service.slug === 'marriage-certificate' ||
    app.service.slug === 'death-certificate'
  );

  const canGenerate = (app: Application) =>
    app.status === 'approved' || app.status === 'issued';

  const handleGeneratePDF = async (app: Application) => {
    setGeneratingId(app.id);
    try {
      const res = await fetch(`/api/certificates/${app.id}/pdf`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${app.service.slug}-certificate-${app.certificateNumber || app.trackingNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Certificate PDF generated successfully!');
        fetchApplications();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to generate certificate');
      }
    } catch {
      toast.error('Error generating certificate');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleViewApplication = (app: Application) => {
    setCurrentApplicationId(app.id);
    setCurrentView('admin-processing');
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'issued': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'processing': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'payment_pending': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#009B3A] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#009B3A]/10 rounded-xl flex items-center justify-center">
            <FileBadge className="w-5 h-5 text-[#009B3A]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Certificate Generator</h1>
            <p className="text-sm text-gray-400">Generate official certificates for approved applications</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Approved', value: certificateApps.filter(a => a.status === 'approved').length, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Issued', value: certificateApps.filter(a => a.status === 'issued').length, icon: FileText, color: 'text-blue-400' },
          { label: 'Pending', value: certificateApps.filter(a => a.status === 'processing').length, icon: Shield, color: 'text-amber-400' },
          { label: 'Total', value: certificateApps.length, icon: FileBadge, color: 'text-white' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#131F2E] border border-[#1E3A5F] rounded-xl p-4">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search by name, tracking number, or certificate number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#131F2E] border-[#1E3A5F] text-white placeholder:text-gray-500 pl-9"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'approved', 'issued', 'processing'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                statusFilter === status
                  ? 'bg-[#009B3A] text-white'
                  : 'bg-[#131F2E] text-gray-400 border border-[#1E3A5F] hover:text-white'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Application List */}
      <div className="space-y-2">
        {certificateApps.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileBadge className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No certificate applications found</p>
          </div>
        ) : (
          certificateApps.map((app) => (
            <div
              key={app.id}
              className="bg-[#131F2E] border border-[#1E3A5F] rounded-xl p-4 hover:border-[#009B3A]/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white truncate">{app.applicantName}</h3>
                    <Badge variant="outline" className={`text-[10px] ${statusColor(app.status)}`}>
                      {app.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {app.service.name}
                    </span>
                    <span>#{app.trackingNumber}</span>
                    {app.certificateNumber && (
                      <span className="text-[#FFD100]">Cert: {app.certificateNumber}</span>
                    )}
                    <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewApplication(app)}
                    className="text-gray-400 hover:text-white text-xs h-8"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    View
                  </Button>
                  {canGenerate(app) && (
                    <Button
                      size="sm"
                      onClick={() => handleGeneratePDF(app)}
                      disabled={generatingId === app.id}
                      className="bg-[#FFD100] text-[#0C1B2A] hover:bg-[#E6BC00] text-xs h-8 font-semibold"
                    >
                      {generatingId === app.id ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5 mr-1" />
                      )}
                      {app.status === 'issued' ? 'Re-download PDF' : 'Generate PDF'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
