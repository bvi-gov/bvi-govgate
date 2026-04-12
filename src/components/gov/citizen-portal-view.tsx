'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Globe, Search, ArrowRight, ArrowLeft, Check, Copy, RefreshCw,
  FileText, CreditCard, User, Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface Department {
  id: string;
  name: string;
  code: string;
}

interface CitizenRequest {
  id: string;
  trackingToken: string;
  applicantName: string;
  applicantEmail: string;
  templateName?: string | null;
  status: string;
  paymentStatus: string;
  feeAmount: number;
  processedBy?: string | null;
  processedAt?: string | null;
  createdAt: string;
  department?: { name: string; code: string } | null;
}

const serviceTemplates = [
  { name: 'Business License Application', fee: 200 },
  { name: 'Work Permit Renewal', fee: 100 },
  { name: 'Residency Application', fee: 250 },
  { name: 'Trade License', fee: 150 },
  { name: 'Import/Export Permit', fee: 75 },
  { name: 'Building Permit', fee: 500 },
  { name: 'Birth Certificate Request', fee: 25 },
  { name: 'Marriage Certificate', fee: 50 },
];

export function CitizenPortalView() {
  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [requests, setRequests] = useState<CitizenRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [trackingSearch, setTrackingSearch] = useState('');
  const [trackedRequest, setTrackedRequest] = useState<CitizenRequest | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Form state
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', address: '', additionalInfo: '',
  });
  const [submittedToken, setSubmittedToken] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const fetchCitizenRequests = async () => {
    setLoading(true);
    const res = await fetch('/api/citizen-requests?limit=50');
    if (res.ok) {
      const data = await res.json();
      setRequests(data.requests || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [deptRes, reqRes] = await Promise.all([
          fetch('/api/departments?status=active'),
          fetch('/api/citizen-requests?limit=50'),
        ]);
        if (!cancelled) {
          if (deptRes.ok) setDepartments(await deptRes.json());
          if (reqRes.ok) {
            const data = await reqRes.json();
            setRequests(data.requests || []);
          }
          setLoading(false);
        }
      } catch (err) { console.error(err); if (!cancelled) setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async () => {
    try {
      const fee = serviceTemplates.find(t => t.name === selectedTemplate)?.fee || 0;
      const res = await fetch('/api/citizen-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: selectedDept,
          applicantName: formData.fullName,
          applicantEmail: formData.email,
          templateName: selectedTemplate,
          formData: JSON.stringify(formData),
          feeAmount: fee,
          paymentStatus: 'paid',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSubmittedToken(data.trackingToken);
        setShowConfirmation(true);
        toast.success('Application submitted successfully!');
        fetchCitizenRequests();
      } else {
        toast.error('Failed to submit application');
      }
    } catch { toast.error('Error submitting application'); }
  };

  const handleTrack = async () => {
    if (!trackingSearch.trim()) return;
    setTrackingLoading(true);
    try {
      const res = await fetch(`/api/citizen-requests?trackingToken=${trackingSearch.trim()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.requests?.length > 0) {
          setTrackedRequest(data.requests[0]);
        } else {
          setTrackedRequest(null);
          toast.error('No application found with this tracking token');
        }
      }
    } catch { toast.error('Failed to track application'); }
    setTrackingLoading(false);
  };

  const resetForm = () => {
    setStep(1);
    setSelectedDept('');
    setSelectedTemplate('');
    setFormData({ fullName: '', email: '', phone: '', address: '', additionalInfo: '' });
    setSubmittedToken('');
    setShowConfirmation(false);
  };

  const steps = [
    { num: 1, label: 'Department', icon: Building2 },
    { num: 2, label: 'Service', icon: FileText },
    { num: 3, label: 'Application', icon: User },
  ];

  return (
    <div className="space-y-6 section-enter">
      <div>
        <h2 className="text-2xl font-bold text-[#e8edf5]">Portal Ciudadano</h2>
        <p className="text-sm text-[#8899b4]">Submit and track government service applications</p>
      </div>

      {/* Tracking Section */}
      <Card className="border-[#1e3a5f] bg-[#0f2140]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-[#8899b4] flex items-center gap-2">
            <Search className="w-4 h-4" /> Track Your Application
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter tracking token (e.g., BVI-...)"
              value={trackingSearch}
              onChange={(e) => setTrackingSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5] placeholder:text-[#8899b4] font-mono"
            />
            <Button onClick={handleTrack} variant="outline" className="border-[#d4af37]/50 text-[#d4af37] hover:bg-[#d4af37]/10">
              {trackingLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
              Track
            </Button>
          </div>
          {trackedRequest && (
            <div className="mt-4 p-4 bg-[#0a1628] rounded-lg border border-[#1e3a5f]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div><span className="text-[#8899b4]">Token:</span><p className="font-mono text-[#d4af37] mt-0.5">{trackedRequest.trackingToken}</p></div>
                <div><span className="text-[#8899b4]">Status:</span><p className="mt-0.5"><span className={`status-${trackedRequest.status} text-[10px] px-2 py-0.5 rounded-full`}>{trackedRequest.status}</span></p></div>
                <div><span className="text-[#8899b4]">Type:</span><p className="text-[#e8edf5] mt-0.5">{trackedRequest.templateName}</p></div>
                <div><span className="text-[#8899b4]">Submitted:</span><p className="text-[#e8edf5] mt-0.5">{format(new Date(trackedRequest.createdAt), 'MMM d, yyyy')}</p></div>
              </div>
              {/* Status timeline */}
              <div className="flex items-center gap-2 mt-4">
                {['pending', 'processing', 'completed'].map((s, idx) => {
                  const statusOrder = ['pending', 'processing', 'completed'];
                  const currentIndex = statusOrder.indexOf(trackedRequest.status);
                  const isComplete = idx <= currentIndex;
                  const isActive = statusOrder[idx] === trackedRequest.status;
                  return (
                    <React.Fragment key={s}>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium border ${
                        isActive ? 'bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]/30' :
                        isComplete ? 'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/30' :
                        'bg-[#152a4e] text-[#8899b4] border-transparent'
                      }`}>
                        {isComplete ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-[#8899b4]" />}
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </div>
                      {idx < 2 && <div className={`h-0.5 flex-1 ${isComplete ? 'bg-[#4ade80]' : 'bg-[#1e3a5f]'}`} />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Flow */}
      <Card className="border-[#1e3a5f] bg-[#0f2140]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-[#8899b4] flex items-center gap-2">
            <Globe className="w-4 h-4" /> New Application
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-6">
            {steps.map((s) => (
              <React.Fragment key={s.num}>
                <button onClick={() => s.num < step && setStep(s.num)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  step === s.num ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30' :
                  step > s.num ? 'bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/30 cursor-pointer' :
                  'bg-[#152a4e] text-[#8899b4] border border-transparent'
                }`}>
                  {step > s.num ? <Check className="w-3.5 h-3.5" /> : <s.icon className="w-3.5 h-3.5" />}
                  {s.label}
                </button>
                {s.num < 3 && <div className={`h-0.5 flex-1 max-w-12 ${step > s.num ? 'bg-[#4ade80]' : 'bg-[#1e3a5f]'}`} />}
              </React.Fragment>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-[#8899b4]">Select the government department for your application:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => { setSelectedDept(dept.id); }}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      selectedDept === dept.id
                        ? 'border-[#d4af37] bg-[#d4af37]/10'
                        : 'border-[#1e3a5f] bg-[#0a1628] hover:border-[#2a4d7a]'
                    }`}
                  >
                    <Building2 className={`w-5 h-5 mb-2 ${selectedDept === dept.id ? 'text-[#d4af37]' : 'text-[#8899b4]'}`} />
                    <p className="text-sm font-medium text-[#e8edf5]">{dept.name}</p>
                    <p className="text-xs text-[#8899b4] font-mono mt-1">{dept.code}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-[#8899b4]">Select the service you need:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {serviceTemplates.map((tmpl) => (
                  <button
                    key={tmpl.name}
                    onClick={() => setSelectedTemplate(tmpl.name)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      selectedTemplate === tmpl.name
                        ? 'border-[#d4af37] bg-[#d4af37]/10'
                        : 'border-[#1e3a5f] bg-[#0a1628] hover:border-[#2a4d7a]'
                    }`}
                  >
                    <FileText className={`w-5 h-5 mb-2 ${selectedTemplate === tmpl.name ? 'text-[#d4af37]' : 'text-[#8899b4]'}`} />
                    <p className="text-sm font-medium text-[#e8edf5]">{tmpl.name}</p>
                    <p className="text-xs text-[#d4af37] mt-1">Fee: ${tmpl.fee}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 max-w-lg">
              <p className="text-sm text-[#8899b4]">Complete your application details:</p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-[#8899b4]">Full Name *</Label>
                  <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#8899b4]">Email *</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#8899b4]">Phone</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#8899b4]">Address</Label>
                  <Textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={2} className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#8899b4]">Additional Information</Label>
                  <Textarea value={formData.additionalInfo} onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })} rows={3} className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" />
                </div>
                {selectedTemplate && (
                  <div className="p-3 bg-[#0a1628] rounded-lg border border-[#1e3a5f]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8899b4]">Service Fee:</span>
                      <span className="text-[#d4af37] font-bold">${serviceTemplates.find(t => t.name === selectedTemplate)?.fee || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[#4ade80]">
                      <CreditCard className="w-3 h-3" /> Payment will be collected upon submission
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6 pt-4 border-t border-[#1e3a5f]">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="border-[#1e3a5f] text-[#8899b4] hover:text-[#e8edf5]">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            ) : <div />}
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)} disabled={step === 1 && !selectedDept || step === 2 && !selectedTemplate} className="bg-[#d4af37] text-[#0a1628] hover:bg-[#e6c453]">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!formData.fullName || !formData.email} className="bg-[#d4af37] text-[#0a1628] hover:bg-[#e6c453]">
                Submit Application
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="bg-[#0f2140] border-[#1e3a5f] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#e8edf5] flex items-center gap-2">
              <Check className="w-5 h-5 text-[#4ade80]" /> Application Submitted
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-[#8899b4]">Your application has been submitted successfully. Save your tracking token:</p>
            <div className="p-4 bg-[#0a1628] rounded-lg border border-[#d4af37]/30">
              <p className="text-[10px] text-[#8899b4] uppercase tracking-wider mb-1">Tracking Token</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-lg text-[#d4af37] font-bold">{submittedToken}</p>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-[#8899b4] hover:text-[#d4af37]" onClick={() => { navigator.clipboard.writeText(submittedToken); toast.success('Copied!'); }}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={resetForm} className="bg-[#d4af37] text-[#0a1628] hover:bg-[#e6c453]">Submit Another</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recent Applications */}
      <Card className="border-[#1e3a5f] bg-[#0f2140]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-[#8899b4]">Recent Citizen Applications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 bg-[#152a4e]" />)}</div>
          ) : requests.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-[#8899b4]">No applications yet</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#1e3a5f] hover:bg-transparent">
                    <TableHead className="text-[#8899b4] text-xs font-medium">Token</TableHead>
                    <TableHead className="text-[#8899b4] text-xs font-medium">Applicant</TableHead>
                    <TableHead className="text-[#8899b4] text-xs font-medium">Service</TableHead>
                    <TableHead className="text-[#8899b4] text-xs font-medium">Status</TableHead>
                    <TableHead className="text-[#8899b4] text-xs font-medium">Payment</TableHead>
                    <TableHead className="text-[#8899b4] text-xs font-medium">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.slice(0, 10).map((req) => (
                    <TableRow key={req.id} className="border-[#1e3a5f]/50 table-row-hover">
                      <TableCell className="font-mono text-xs text-[#d4af37]">{req.trackingToken}</TableCell>
                      <TableCell className="text-xs text-[#e8edf5]">{req.applicantName}</TableCell>
                      <TableCell className="text-xs text-[#e8edf5]">{req.templateName}</TableCell>
                      <TableCell><span className={`text-[10px] px-2 py-0.5 rounded-full status-${req.status}`}>{req.status}</span></TableCell>
                      <TableCell><span className={`text-[10px] px-2 py-0.5 rounded-full ${req.paymentStatus === 'paid' ? 'bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/30' : 'bg-[#fbbf24]/15 text-[#fbbf24] border border-[#fbbf24]/30'}`}>{req.paymentStatus}</span></TableCell>
                      <TableCell className="text-xs text-[#8899b4]">{format(new Date(req.createdAt), 'MMM d, yyyy')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
