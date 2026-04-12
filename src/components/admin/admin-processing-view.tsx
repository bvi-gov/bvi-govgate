'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  CreditCard,
  FileCheck,
  Clock,
  Loader2,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

interface Application {
  id: string;
  trackingNumber: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  formData: string;
  status: string;
  paymentStatus: string;
  paymentAmount: number;
  paymentMethod: string | null;
  paidAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewerNotes: string | null;
  issuedAt: string | null;
  certificateNumber: string | null;
  certificateUrl: string | null;
  rejectionReason: string | null;
  createdAt: string;
  service: {
    id: string;
    name: string;
    slug: string;
    department: string;
    feeAmount: number;
    processingDays: number;
    requirements: string;
    formFields: string;
  };
  timeline: {
    id: string;
    status: string;
    note: string;
    actor: string;
    createdAt: string;
  }[];
  payment: {
    id: string;
    amount: number;
    method: string;
    status: string;
    receiptNumber: string | null;
    paidAt: string | null;
  } | null;
}

export function AdminProcessingView() {
  const {
    currentApplicationId, adminName, setCurrentView,
  } = useAppStore();

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [currentApplicationId]);

  const fetchApplication = async () => {
    if (!currentApplicationId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/applications/${currentApplicationId}`);
      if (res.ok) setApplication(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => fetchApplication();

  const handleVerifyPayment = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/applications/${currentApplicationId}/pay`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'credit_card', reviewedBy: adminName }),
      });
      if (res.ok) {
        toast.success('Payment verified and application is now being processed');
        refreshData();
      } else {
        toast.error('Failed to verify payment');
      }
    } catch { toast.error('Error'); }
    finally { setActionLoading(false); }
  };

  const handleBeginProcessing = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/applications/${currentApplicationId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'processing', reviewedBy: adminName, reviewerNotes: notes || 'Processing started' }),
      });
      if (res.ok) {
        toast.success('Application is now being processed');
        refreshData();
      } else toast.error('Failed to update status');
    } catch { toast.error('Error'); }
    finally { setActionLoading(false); }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/applications/${currentApplicationId}/issue`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewedBy: adminName, reviewerNotes: notes || 'Approved and document issued' }),
      });
      if (res.ok) {
        toast.success('Document approved and issued');
        refreshData();
      } else toast.error('Failed to issue document');
    } catch { toast.error('Error'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/applications/${currentApplicationId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          reviewedBy: adminName,
          reviewerNotes: rejectionReason,
          rejectionReason: rejectionReason,
        }),
      });
      if (res.ok) {
        toast.success('Application rejected');
        setShowRejectDialog(false);
        refreshData();
      } else toast.error('Failed to reject application');
    } catch { toast.error('Error'); }
    finally { setActionLoading(false); }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-8 bg-gray-700 rounded w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-800 rounded-xl animate-pulse" />
          <div className="h-96 bg-gray-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!application) return null;

  const formData = JSON.parse(application.formData || '{}');
  const formFields: { key: string; label: string }[] = JSON.parse(application.service.formFields || '[]');
  const requirements: string[] = JSON.parse(application.service.requirements || '[]');

  return (
    <div className="space-y-6 section-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentView('admin-queue')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-3">
              {application.service.name}
              <Badge className={`${
                application.status === 'issued' ? 'bg-emerald-400/10 text-emerald-400' :
                application.status === 'approved' ? 'bg-emerald-400/10 text-emerald-400' :
                application.status === 'rejected' ? 'bg-red-400/10 text-red-400' :
                application.status === 'processing' ? 'bg-sky-400/10 text-sky-400' :
                application.status === 'payment_pending' ? 'bg-amber-400/10 text-amber-400' :
                'bg-blue-400/10 text-blue-400'
              }`}>
                {application.status.replace(/_/g, ' ')}
              </Badge>
            </h1>
            <p className="text-gray-400 text-sm font-mono">{application.trackingNumber}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Application Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applicant Info */}
          <div className="bg-[#131F2E] border border-[#1E3A5F] rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">Applicant Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500 text-xs">Full Name</span>
                <p className="text-white font-medium">{application.applicantName}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Email</span>
                <p className="text-white font-medium">{application.applicantEmail}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Phone</span>
                <p className="text-white font-medium">{application.applicantPhone}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Applied On</span>
                <p className="text-white font-medium">{new Date(application.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Department</span>
                <p className="text-white font-medium">{application.service.department}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Processing Time</span>
                <p className="text-white font-medium">{application.service.processingDays} business days</p>
              </div>
            </div>
          </div>

          {/* Form Data */}
          <div className="bg-[#131F2E] border border-[#1E3A5F] rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">Application Data</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {formFields.map((field) => (
                <div key={field.key} className="text-sm">
                  <span className="text-gray-500 text-xs">{field.label}</span>
                  <p className="text-white font-medium whitespace-pre-wrap">{formData[field.key] || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements Checklist */}
          <div className="bg-[#131F2E] border border-[#1E3A5F] rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">Required Documents</h2>
            <ul className="space-y-2">
              {requirements.map((req, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <div className="w-4 h-4 rounded border border-gray-600 bg-[#0C1B2A] flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-[#009B3A]" />
                  </div>
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Issued Certificate */}
          {application.certificateNumber && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
              <h2 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                Certificate Issued
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 text-xs">Certificate Number</span>
                  <p className="text-white font-mono font-medium">{application.certificateNumber}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Issued On</span>
                  <p className="text-white font-medium">
                    {application.issuedAt ? new Date(application.issuedAt).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="mt-3 bg-[#009B3A] text-white hover:bg-[#007A2E]"
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/certificates/${application.id}/pdf`);
                    if (res.ok) {
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${application.service.slug}-${application.certificateNumber || application.trackingNumber}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      toast.success('Certificate downloaded!');
                    } else {
                      toast.error('Failed to generate PDF');
                    }
                  } catch {
                    toast.error('Error downloading certificate');
                  }
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Certificate PDF
              </Button>
            </div>
          )}

          {/* Rejection Reason */}
          {application.rejectionReason && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
              <h2 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Rejection Reason
              </h2>
              <p className="text-sm text-red-300">{application.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Right: Actions & Timeline */}
        <div className="space-y-6">
          {/* Payment Info */}
          <div className="bg-[#131F2E] border border-[#1E3A5F] rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">Payment Info</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="text-white font-bold">${application.paymentAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={application.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}>
                  {application.paymentStatus}
                </span>
              </div>
              {application.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="text-gray-300 capitalize">{application.paymentMethod.replace('_', ' ')}</span>
                </div>
              )}
              {application.payment?.receiptNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Receipt</span>
                  <span className="text-gray-300 font-mono text-xs">{application.payment.receiptNumber}</span>
                </div>
              )}
              {application.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Paid On</span>
                  <span className="text-gray-300">{new Date(application.paidAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Panel */}
          <div className="bg-[#131F2E] border border-[#1E3A5F] rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">Actions</h2>
            <div className="space-y-4">
              <Textarea
                placeholder="Add notes for this action..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-[#0C1B2A] border-[#1E3A5F] text-white placeholder:text-gray-500 text-sm min-h-[80px]"
              />

              {application.status === 'submitted' && (
                <Button
                  onClick={handleBeginProcessing}
                  disabled={actionLoading}
                  className="w-full bg-[#009B3A] text-white hover:bg-[#007A2E]"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Begin Processing
                </Button>
              )}

              {application.status === 'payment_pending' && (
                <Button
                  onClick={handleVerifyPayment}
                  disabled={actionLoading}
                  className="w-full bg-amber-500 text-white hover:bg-amber-600"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
                  Verify Payment
                </Button>
              )}

              {application.status === 'processing' && (
                <Button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="w-full bg-[#009B3A] text-white hover:bg-[#007A2E]"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Approve & Issue Document
                </Button>
              )}

              {(application.status === 'processing' || application.status === 'payment_pending' || application.status === 'submitted') && (
                <Button
                  variant="outline"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={actionLoading}
                  className="w-full border-red-400/20 text-red-400 hover:bg-red-400/10"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Application
                </Button>
              )}

              {application.status === 'approved' && (
                <Button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="w-full bg-[#009B3A] text-white hover:bg-[#007A2E]"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileCheck className="w-4 h-4 mr-2" />}
                  Issue Document
                </Button>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-[#131F2E] border border-[#1E3A5F] rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">Timeline</h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {[...application.timeline].reverse().map((entry) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#009B3A] mt-2 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-300">{entry.note}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {new Date(entry.createdAt).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                        })}
                      </span>
                      {entry.actor && (
                        <span className="text-xs text-gray-600">· {entry.actor}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#131F2E] border border-[#1E3A5F] rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-white font-semibold text-lg mb-2">Reject Application</h2>
            <p className="text-gray-400 text-sm mb-4">
              Please provide a reason for rejecting this application. The applicant will be notified.
            </p>
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="bg-[#0C1B2A] border-[#1E3A5F] text-white placeholder:text-gray-500 min-h-[100px] mb-4"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(false)}
                className="flex-1 border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="flex-1 bg-red-500 text-white hover:bg-red-600"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
