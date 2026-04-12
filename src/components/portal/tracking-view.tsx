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
  AlertCircle,
  FileCheck,
  CreditCard,
  ArrowRight,
  Download,
  Copy,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface TimelineEntry {
  id: string;
  status: string;
  note: string;
  actor: string;
  createdAt: string;
}

interface TrackedApp {
  trackingNumber: string;
  applicantName: string;
  status: string;
  paymentStatus: string;
  service: { name: string; icon: string };
  timeline: TimelineEntry[];
  certificateNumber?: string;
  certificateUrl?: string;
  rejectionReason?: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any; done: boolean }> = {
  payment_pending: { label: 'Payment Pending', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: CreditCard, done: false },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: AlertCircle, done: false },
  payment_verified: { label: 'Payment Verified', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2, done: false },
  processing: { label: 'Under Review', color: 'bg-sky-100 text-sky-700 border-sky-200', icon: Clock, done: false },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2, done: true },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, done: true },
  issued: { label: 'Document Issued', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: FileCheck, done: true },
};

export function TrackingView() {
  const { trackingInput, setTrackingInput, submittedTrackingNumber, setCurrentView } = useAppStore();
  const [result, setResult] = useState<TrackedApp | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);

  const handleTrack = async () => {
    if (!trackingInput.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/applications/track/${trackingInput.trim()}`);
      if (res.ok) {
        setResult(await res.json());
      } else {
        setError('Application not found. Please check your tracking number and try again.');
      }
    } catch {
      setError('An error occurred while tracking your application.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (submittedTrackingNumber && !result) {
      setTrackingInput(submittedTrackingNumber);
      handleTrack();
    }
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleDownloadCertificate = async () => {
    if (!result?.trackingNumber) return;
    setDownloadingCertificate(true);
    try {
      const res = await fetch(`/api/applications/track/${result.trackingNumber}/certificate`);
      if (!res.ok) {
        toast.error('Failed to download certificate');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${result.certificateNumber || result.trackingNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Certificate downloaded successfully');
    } catch {
      toast.error('Failed to download certificate');
    } finally {
      setDownloadingCertificate(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 section-enter">
      <h1 className="text-2xl md:text-3xl font-bold text-[#0C1B2A] mb-2">Track Your Application</h1>
      <p className="text-gray-500 mb-8">Enter your tracking number to see the current status</p>

      {/* Search */}
      <div className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Enter tracking number (e.g., BVI-20250406-XXXX)"
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            className="pl-10 h-12 bg-white border-gray-200 rounded-xl text-base font-mono"
          />
        </div>
        <Button
          onClick={handleTrack}
          disabled={loading || !trackingInput.trim()}
          className="bg-[#009B3A] text-white hover:bg-[#007A2E] px-8 rounded-xl h-12"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Track'}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-6">
          <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-700 font-medium">{error}</p>
          <p className="text-red-500 text-sm mt-1">Please verify your tracking number and try again.</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="section-enter">
          {/* Application Summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="font-semibold text-[#0C1B2A] text-lg">{result.service.name}</h2>
                <p className="text-sm text-gray-500">Applicant: {result.applicantName}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-gray-500">{result.trackingNumber}</span>
                <button onClick={() => handleCopy(result.trackingNumber)} className="text-gray-400 hover:text-[#009B3A]">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className={statusConfig[result.status]?.color || 'bg-gray-100 text-gray-500'}>
                {statusConfig[result.status]?.label || result.status}
              </Badge>
              <Badge variant="outline" className="text-gray-500">
                Applied: {new Date(result.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Badge>
            </div>

            {/* Rejection Reason */}
            {result.rejectionReason && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
                <p className="font-medium text-red-700 mb-1">Rejection Reason:</p>
                <p className="text-red-600">{result.rejectionReason}</p>
              </div>
            )}

            {/* Document Download */}
            {result.status === 'issued' && (
              <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-emerald-700">Document Ready</p>
                    <p className="text-sm text-emerald-600">Certificate: {result.certificateNumber}</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#009B3A] text-white hover:bg-[#007A2E]"
                    onClick={handleDownloadCertificate}
                    disabled={downloadingCertificate}
                  >
                    {downloadingCertificate ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    {downloadingCertificate ? 'Downloading...' : 'Download'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-[#0C1B2A] mb-6">Application Timeline</h2>
            <div className="relative">
              {result.timeline.map((entry, i) => {
                const config = statusConfig[entry.status] || statusConfig.submitted;
                const isLast = i === result.timeline.length - 1;
                const IconComp = config.icon;

                return (
                  <div key={entry.id} className="flex gap-4 pb-6 last:pb-0">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isLast
                          ? 'bg-[#009B3A] text-white shadow-md shadow-[#009B3A]/20'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      {!isLast && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <span className={`font-medium ${isLast ? 'text-[#0C1B2A]' : 'text-gray-500'}`}>
                          {config.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(entry.createdAt).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                            hour: 'numeric', minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{entry.note}</p>
                      {entry.actor && (
                        <p className="text-xs text-gray-400 mt-1">by {entry.actor}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrentView('services')}
              className="flex-1 border-gray-200"
            >
              Start New Application
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentView('my-applications')}
              className="flex-1 border-gray-200"
            >
              View My Applications
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
