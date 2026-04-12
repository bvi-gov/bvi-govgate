'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Plus, Eye, Pencil, Trash2, FileText, Filter, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface ServiceRequest {
  id: string;
  departmentId: string;
  referenceNumber: string;
  requestType: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string | null;
  priority: string;
  status: string;
  notes?: string | null;
  createdAt: string;
  department?: { name: string; code: string } | null;
}

export function RequestsView() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [viewRequest, setViewRequest] = useState<ServiceRequest | null>(null);
  const [editRequest, setEditRequest] = useState<ServiceRequest | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState('');

  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [formData, setFormData] = useState({
    departmentId: '', requestType: '', applicantName: '', applicantEmail: '',
    applicantPhone: '', priority: 'normal', notes: '',
  });

  const fetchDepartments = useCallback(async () => {
    const res = await fetch('/api/departments');
    if (res.ok) {
      const data = await res.json();
      setDepartments(data.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name })));
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (priorityFilter) params.set('priority', priorityFilter);
      params.set('limit', '50');
      const res = await fetch(`/api/service-requests?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
        setTotal(data.total || 0);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchDepartments();
    fetchRequests();
  }, [fetchDepartments, fetchRequests]);

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success('Service request created');
        setCreateOpen(false);
        setFormData({ departmentId: '', requestType: '', applicantName: '', applicantEmail: '', applicantPhone: '', priority: 'normal', notes: '' });
        fetchRequests();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed');
      }
    } catch { toast.error('Failed to create request'); }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/service-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) { toast.success('Status updated'); fetchRequests(); }
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/service-requests/${deleteId}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Request deleted'); setDeleteOpen(false); fetchRequests(); }
    } catch { toast.error('Failed to delete'); }
  };

  const requestTypes = ['Business License', 'Work Permit', 'Residency Application', 'Trade License', 'Import Permit', 'Building Permit', 'Environmental Clearance', 'Financial Services License'];

  return (
    <div className="space-y-6 section-enter">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#e8edf5]">Solicitudes</h2>
          <p className="text-sm text-[#8899b4]">{total} service requests total</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchRequests} variant="outline" size="sm" className="border-[#1e3a5f] text-[#8899b4] hover:text-[#e8edf5] hover:bg-[#152a4e]">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="bg-[#d4af37] text-[#0a1628] hover:bg-[#e6c453]">
            <Plus className="w-4 h-4 mr-2" /> New Request
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8899b4]" />
          <Input placeholder="Search by name, email, or reference..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-[#0f2140] border-[#1e3a5f] text-[#e8edf5] placeholder:text-[#8899b4]" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-40 bg-[#0f2140] border-[#1e3a5f] text-[#8899b4]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="bg-[#152a4e] border-[#1e3a5f]">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-36 bg-[#0f2140] border-[#1e3a5f] text-[#8899b4]"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent className="bg-[#152a4e] border-[#1e3a5f]">
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-[#1e3a5f] bg-[#0f2140]">
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 bg-[#152a4e]" />)}</div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FileText className="w-12 h-12 text-[#1e3a5f] mb-4" />
              <h3 className="text-lg font-semibold text-[#e8edf5]">No requests found</h3>
              <p className="text-sm text-[#8899b4] mt-1">Create a new service request to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#1e3a5f] hover:bg-transparent">
                    <TableHead className="text-[#8899b4] text-xs font-medium">Reference</TableHead>
                    <TableHead className="text-[#8899b4] text-xs font-medium">Type</TableHead>
                    <TableHead className="text-[#8899b4] text-xs font-medium">Applicant</TableHead>
                    <TableHead className="text-[#8899b4] text-xs font-medium">Department</TableHead>
                    <TableHead className="text-[#8899b4] text-xs font-medium">Priority</TableHead>
                    <TableHead className="text-[#8899b4] text-xs font-medium">Status</TableHead>
                    <TableHead className="text-[#8899b4] text-xs font-medium">Date</TableHead>
                    <TableHead className="text-[#8899b4] text-xs font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req.id} className="border-[#1e3a5f]/50 table-row-hover">
                      <TableCell className="font-mono text-xs text-[#d4af37]">{req.referenceNumber}</TableCell>
                      <TableCell className="text-xs text-[#e8edf5]">{req.requestType}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-xs text-[#e8edf5]">{req.applicantName}</p>
                          <p className="text-[10px] text-[#8899b4]">{req.applicantEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-[#8899b4]">{req.department?.name || '—'}</TableCell>
                      <TableCell>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium priority-${req.priority}`}>
                          {req.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium status-${req.status}`}>
                          {req.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-[#8899b4]">{format(new Date(req.createdAt), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-[#8899b4] hover:text-[#38bdf8]" onClick={() => setViewRequest(req)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {req.status === 'pending' && (
                            <>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-[#8899b4] hover:text-[#4ade80]" onClick={() => handleUpdateStatus(req.id, 'processing')}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-[#8899b4] hover:text-[#f87171]" onClick={() => { setDeleteId(req.id); setDeleteOpen(true); }}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                          {req.status === 'processing' && (
                            <>
                              <Button variant="ghost" size="sm" className="h-7 text-[10px] text-[#4ade80] hover:text-[#4ade80] px-2" onClick={() => handleUpdateStatus(req.id, 'approved')}>Approve</Button>
                              <Button variant="ghost" size="sm" className="h-7 text-[10px] text-[#f87171] hover:text-[#f87171] px-2" onClick={() => handleUpdateStatus(req.id, 'rejected')}>Reject</Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Request Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[#0f2140] border-[#1e3a5f] max-w-lg">
          <DialogHeader><DialogTitle className="text-[#e8edf5]">New Service Request</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#8899b4]">Department *</Label>
              <Select value={formData.departmentId} onValueChange={(v) => setFormData({ ...formData, departmentId: v })}>
                <SelectTrigger className="bg-[#0a1628] border-[#1e3a5f] text-[#8899b4]"><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent className="bg-[#152a4e] border-[#1e3a5f]">
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#8899b4]">Request Type *</Label>
                <Select value={formData.requestType} onValueChange={(v) => setFormData({ ...formData, requestType: v })}>
                  <SelectTrigger className="bg-[#0a1628] border-[#1e3a5f] text-[#8899b4]"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent className="bg-[#152a4e] border-[#1e3a5f]">
                    {requestTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[#8899b4]">Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                  <SelectTrigger className="bg-[#0a1628] border-[#1e3a5f] text-[#8899b4]"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#152a4e] border-[#1e3a5f]">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#8899b4]">Applicant Name *</Label>
                <Input value={formData.applicantName} onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })} className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#8899b4]">Applicant Email *</Label>
                <Input type="email" value={formData.applicantEmail} onChange={(e) => setFormData({ ...formData, applicantEmail: e.target.value })} className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#8899b4]">Phone (optional)</Label>
              <Input value={formData.applicantPhone} onChange={(e) => setFormData({ ...formData, applicantPhone: e.target.value })} className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#8899b4]">Notes</Label>
              <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="border-[#1e3a5f] text-[#8899b4]">Cancel</Button>
            <Button onClick={handleCreate} disabled={!formData.departmentId || !formData.requestType || !formData.applicantName || !formData.applicantEmail} className="bg-[#d4af37] text-[#0a1628] hover:bg-[#e6c453]">Create Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Request Dialog */}
      <Dialog open={!!viewRequest} onOpenChange={() => setViewRequest(null)}>
        <DialogContent className="bg-[#0f2140] border-[#1e3a5f] max-w-lg">
          {viewRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[#e8edf5] flex items-center gap-2">
                  {viewRequest.referenceNumber}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full status-${viewRequest.status}`}>{viewRequest.status}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-[#8899b4]">Type:</span> <span className="text-[#e8edf5]">{viewRequest.requestType}</span></div>
                  <div><span className="text-[#8899b4]">Priority:</span> <span className={`priority-${viewRequest.priority} text-[10px] px-2 py-0.5 rounded-full`}>{viewRequest.priority}</span></div>
                  <div><span className="text-[#8899b4]">Applicant:</span> <span className="text-[#e8edf5]">{viewRequest.applicantName}</span></div>
                  <div><span className="text-[#8899b4]">Email:</span> <span className="text-[#e8edf5]">{viewRequest.applicantEmail}</span></div>
                  <div><span className="text-[#8899b4]">Phone:</span> <span className="text-[#e8edf5]">{viewRequest.applicantPhone || '—'}</span></div>
                  <div><span className="text-[#8899b4]">Department:</span> <span className="text-[#e8edf5]">{viewRequest.department?.name}</span></div>
                  <div><span className="text-[#8899b4]">Created:</span> <span className="text-[#e8edf5]">{format(new Date(viewRequest.createdAt), 'MMM d, yyyy HH:mm')}</span></div>
                </div>
                {viewRequest.notes && (
                  <p className="text-xs text-[#8899b4] p-3 bg-[#0a1628] rounded-lg mt-2">{viewRequest.notes}</p>
                )}
                {viewRequest.status === 'pending' && (
                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => { handleUpdateStatus(viewRequest.id, 'processing'); setViewRequest(null); }} className="bg-[#d4af37] text-[#0a1628] hover:bg-[#e6c453] flex-1">Start Processing</Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-[#0f2140] border-[#1e3a5f]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#e8edf5]">Delete Request</AlertDialogTitle>
            <AlertDialogDescription className="text-[#8899b4]">This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#152a4e] text-[#e8edf5] border-[#1e3a5f]">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-[#f87171] text-white hover:bg-[#ef4444]">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
