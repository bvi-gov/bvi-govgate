'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  MonitorDot, Check, X, Eye, FileText, CreditCard, User,
  Clock, AlertTriangle, RefreshCw, Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface CitizenRequest {
  id: string;
  departmentId: string;
  trackingToken: string;
  applicantName: string;
  applicantEmail: string;
  templateName?: string | null;
  formData?: string | null;
  status: string;
  paymentStatus: string;
  feeAmount: number;
  processedBy?: string | null;
  approverNotes?: string | null;
  createdAt: string;
  department?: { name: string; code: string } | null;
}

export function OperatorWorkstationView() {
  const [pendingRequests, setPendingRequests] = useState<CitizenRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<CitizenRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPending = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '50');
      const res = await fetch(`/api/citizen-requests?${params}`);
      if (res.ok) {
        const data = await res.json();
        const all = data.requests || [];
        setPendingRequests(all);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('limit', '50');
        const res = await fetch(`/api/citizen-requests?${params}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setPendingRequests(data.requests || []);
        }
      } catch (err) { console.error(err); }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleApprove = async () => {
    if (!selectedRequest) return;
    try {
      const res = await fetch(`/api/citizen-requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          processedBy: 'Admin User',
          processedAt: new Date().toISOString(),
          approverNotes: notes || 'Approved by operator.',
        }),
      });
      if (res.ok) {
        toast.success('Request approved successfully');
        setSelectedRequest(null);
        setNotes('');
        fetchPending();
      }
    } catch { toast.error('Failed to approve request'); }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    try {
      const res = await fetch(`/api/citizen-requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          processedBy: 'Admin User',
          processedAt: new Date().toISOString(),
          approverNotes: notes || 'Rejected by operator.',
        }),
      });
      if (res.ok) {
        toast.success('Request rejected');
        setSelectedRequest(null);
        setNotes('');
        fetchPending();
      }
    } catch { toast.error('Failed to reject request'); }
  };

  const filtered = pendingRequests.filter(r => {
    if (searchTerm && !r.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) && !r.trackingToken.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const actionableCount = pendingRequests.filter(r => r.status === 'pending' || r.status === 'processing').length;

  return (
    <div className="space-y-6 section-enter">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#e8edf5]">Estación de Operador</h2>
          <p className="text-sm text-[#8899b4]">{actionableCount} requests awaiting processing</p>
        </div>
        <Button onClick={fetchPending} variant="outline" size="sm" className="border-[#1e3a5f] text-[#8899b4] hover:text-[#e8edf5] hover:bg-[#152a4e]">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh Queue
        </Button>
      </div>

      {/* Status banner */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#fbbf24]/10 border border-[#fbbf24]/30">
          <Clock className="w-4 h-4 text-[#fbbf24]" />
          <span className="text-xs font-medium text-[#fbbf24]">{pendingRequests.filter(r => r.status === 'pending').length} Pending</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#38bdf8]/10 border border-[#38bdf8]/30">
          <FileText className="w-4 h-4 text-[#38bdf8]" />
          <span className="text-xs font-medium text-[#38bdf8]">{pendingRequests.filter(r => r.status === 'processing').length} Processing</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4ade80]/10 border border-[#4ade80]/30">
          <Check className="w-4 h-4 text-[#4ade80]" />
          <span className="text-xs font-medium text-[#4ade80]">{pendingRequests.filter(r => r.status === 'completed').length} Completed</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f87171]/10 border border-[#f87171]/30">
          <X className="w-4 h-4 text-[#f87171]" />
          <span className="text-xs font-medium text-[#f87171]">{pendingRequests.filter(r => r.status === 'rejected').length} Rejected</span>
        </div>
      </div>

      {/* Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" style={{ minHeight: '500px' }}>
        {/* Left: Queue list */}
        <div className="lg:col-span-2">
          <Card className="border-[#1e3a5f] bg-[#0f2140] h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#8899b4]">Request Queue</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8899b4]" />
                <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 h-8 bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5] text-xs" />
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto max-h-96">
              {loading ? (
                <div className="space-y-2 p-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 bg-[#152a4e] rounded-lg" />)}</div>
              ) : filtered.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-sm text-[#8899b4]">No requests</div>
              ) : (
                <div className="divide-y divide-[#1e3a5f]/30">
                  {filtered.map((req) => (
                    <button
                      key={req.id}
                      onClick={() => { setSelectedRequest(req); setNotes(''); }}
                      className={`w-full text-left p-3 transition-colors hover:bg-[#152a4e] ${
                        selectedRequest?.id === req.id ? 'bg-[#152a4e] border-l-2 border-l-[#d4af37]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs text-[#d4af37]">{req.trackingToken}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded status-${req.status}`}>{req.status}</span>
                      </div>
                      <p className="text-xs text-[#e8edf5] font-medium">{req.applicantName}</p>
                      <p className="text-[10px] text-[#8899b4]">{req.templateName}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${req.paymentStatus === 'paid' ? 'bg-[#4ade80]/10 text-[#4ade80]' : 'bg-[#fbbf24]/10 text-[#fbbf24]'}`}>
                          {req.paymentStatus === 'paid' ? <><CreditCard className="w-2.5 h-2.5 inline mr-0.5" />Paid</> : 'Unpaid'}
                        </span>
                        <span className="text-[10px] text-[#d4af37]">${req.feeAmount}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Document preview / Actions */}
        <div className="lg:col-span-3">
          <Card className="border-[#1e3a5f] bg-[#0f2140] h-full">
            {selectedRequest ? (
              <>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-[#e8edf5] flex items-center gap-2">
                      <Eye className="w-4 h-4 text-[#d4af37]" /> {selectedRequest.trackingToken}
                    </CardTitle>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full status-${selectedRequest.status}`}>{selectedRequest.status}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Application details */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#8899b4]" />
                      <div>
                        <p className="text-[#8899b4]">Applicant</p>
                        <p className="text-[#e8edf5]">{selectedRequest.applicantName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-[#8899b4]" />
                      <div>
                        <p className="text-[#8899b4]">Service</p>
                        <p className="text-[#e8edf5]">{selectedRequest.templateName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-[#8899b4]" />
                      <div>
                        <p className="text-[#8899b4]">Fee & Payment</p>
                        <p className={selectedRequest.paymentStatus === 'paid' ? 'text-[#4ade80]' : 'text-[#fbbf24]'}>
                          ${selectedRequest.feeAmount} — {selectedRequest.paymentStatus}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#8899b4]" />
                      <div>
                        <p className="text-[#8899b4]">Department</p>
                        <p className="text-[#e8edf5]">{selectedRequest.department?.name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Form data preview */}
                  {selectedRequest.formData && (
                    <div className="p-3 bg-[#0a1628] rounded-lg border border-[#1e3a5f]">
                      <p className="text-[10px] text-[#8899b4] uppercase tracking-wider mb-2">Application Data</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(JSON.parse(selectedRequest.formData)).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-[#8899b4] capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                            <p className="text-[#e8edf5]">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label className="text-[#8899b4] text-xs">Operator Notes</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about your decision..."
                      rows={3}
                      className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5] text-xs"
                    />
                  </div>

                  {/* Actions */}
                  {(selectedRequest.status === 'pending' || selectedRequest.status === 'processing') && (
                    <div className="flex gap-3 pt-2">
                      <Button onClick={handleApprove} className="flex-1 bg-[#4ade80] text-[#0a1628] hover:bg-[#22c55e]">
                        <Check className="w-4 h-4 mr-2" /> Approve
                      </Button>
                      <Button onClick={handleReject} className="flex-1 bg-[#f87171] text-white hover:bg-[#ef4444]">
                        <X className="w-4 h-4 mr-2" /> Reject
                      </Button>
                    </div>
                  )}

                  <p className="text-[10px] text-[#8899b4] text-center">
                    Submitted {format(new Date(selectedRequest.createdAt), 'MMM d, yyyy HH:mm')}
                    {selectedRequest.processedAt && ` • Processed ${format(new Date(selectedRequest.processedAt), 'MMM d, yyyy HH:mm')}`}
                  </p>
                </CardContent>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <MonitorDot className="w-12 h-12 text-[#1e3a5f] mb-4" />
                <h3 className="text-sm font-semibold text-[#e8edf5]">Select a Request</h3>
                <p className="text-xs text-[#8899b4] mt-1">Choose a request from the queue to review and process</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
