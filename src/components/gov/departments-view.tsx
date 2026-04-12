'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DepartmentCard } from './department-card';
import { Card, CardContent } from '@/components/ui/card';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Building2, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building,
  User,
  ShieldCheck,
} from 'lucide-react';

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  status: string;
  tier: string;
  ownerName?: string | null;
  ownerEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  monthlyFee: number;
  currency: string;
  paymentStatus: string;
  _count?: {
    members?: number;
    serviceRequests?: number;
    documents?: number;
    citizenRequests?: number;
  };
}

export function DepartmentsView() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [createStep, setCreateStep] = useState(1);
  const [viewDept, setViewDept] = useState<Department | null>(null);
  const [editDept, setEditDept] = useState<Department | null>(null);

  // Create form state
  const [formData, setFormData] = useState({
    name: '', code: '', description: '', tier: 'standard',
    ownerName: '', ownerEmail: '', contactPhone: '', address: '',
    monthlyFee: '500',
  });

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (tierFilter) params.set('tier', tierFilter);
      const res = await fetch(`/api/departments?${params}`);
      if (res.ok) setDepartments(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, tierFilter]);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success('Department created successfully');
        setCreateOpen(false);
        setCreateStep(1);
        setFormData({ name: '', code: '', description: '', tier: 'standard', ownerName: '', ownerEmail: '', contactPhone: '', address: '', monthlyFee: '500' });
        fetchDepartments();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to create department');
      }
    } catch {
      toast.error('Failed to create department');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/departments/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Department deleted');
        setDeleteOpen(false);
        fetchDepartments();
      }
    } catch {
      toast.error('Failed to delete department');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/departments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Department ${status === 'active' ? 'activated' : 'suspended'}`);
        fetchDepartments();
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleUpdate = async () => {
    if (!editDept) return;
    try {
      const res = await fetch(`/api/departments/${editDept.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editDept),
      });
      if (res.ok) {
        toast.success('Department updated');
        setEditDept(null);
        fetchDepartments();
      }
    } catch {
      toast.error('Failed to update department');
    }
  };

  const filteredDepts = departments;

  return (
    <div className="space-y-6 section-enter">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#e8edf5]">Departamentos</h2>
          <p className="text-sm text-[#8899b4]">{departments.length} government departments</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-[#d4af37] text-[#0a1628] hover:bg-[#e6c453]">
          <Plus className="w-4 h-4 mr-2" /> New Department
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8899b4]" />
          <Input
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#0f2140] border-[#1e3a5f] text-[#e8edf5] placeholder:text-[#8899b4]"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-40 bg-[#0f2140] border-[#1e3a5f] text-[#8899b4]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#152a4e] border-[#1e3a5f]">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tierFilter} onValueChange={(v) => setTierFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-40 bg-[#0f2140] border-[#1e3a5f] text-[#8899b4]">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent className="bg-[#152a4e] border-[#1e3a5f]">
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Department Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 bg-[#152a4e] rounded-xl" />
          ))}
        </div>
      ) : filteredDepts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="w-12 h-12 text-[#1e3a5f] mb-4" />
          <h3 className="text-lg font-semibold text-[#e8edf5]">No departments found</h3>
          <p className="text-sm text-[#8899b4] mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDepts.map((dept) => (
            <DepartmentCard
              key={dept.id}
              department={dept}
              onView={(d) => setViewDept(d)}
              onEdit={(d) => setEditDept({ ...d })}
              onDelete={(id) => { setDeleteId(id); setDeleteOpen(true); }}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {!loading && departments.length > 0 && (
        <div className="flex items-center gap-6 text-xs text-[#8899b4]">
          <span>Total: <strong className="text-[#e8edf5]">{departments.length}</strong></span>
          <span>Active: <strong className="text-[#4ade80]">{departments.filter(d => d.status === 'active').length}</strong></span>
          <span>Suspended: <strong className="text-[#f87171]">{departments.filter(d => d.status === 'suspended').length}</strong></span>
          <span>Enterprise: <strong className="text-[#d4af37]">{departments.filter(d => d.tier === 'enterprise').length}</strong></span>
        </div>
      )}

      {/* Create Department Dialog (3-step wizard) */}
      <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) setCreateStep(1); }}>
        <DialogContent className="bg-[#0f2140] border-[#1e3a5f] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#e8edf5] flex items-center gap-2">
              New Department
              <span className="text-xs text-[#8899b4]">Step {createStep}/3</span>
            </DialogTitle>
          </DialogHeader>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-4">
            {[
              { num: 1, label: 'Info', icon: Building },
              { num: 2, label: 'Owner', icon: User },
              { num: 3, label: 'Compliance', icon: ShieldCheck },
            ].map((step) => (
              <button
                key={step.num}
                onClick={() => setCreateStep(step.num)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  createStep === step.num
                    ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30'
                    : createStep > step.num
                    ? 'bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/30'
                    : 'bg-[#152a4e] text-[#8899b4] border border-transparent'
                }`}
              >
                <step.icon className="w-3.5 h-3.5" />
                {step.label}
              </button>
            ))}
          </div>

          {createStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[#8899b4]">Department Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Ministry of Finance" className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#8899b4]">Department Code *</Label>
                <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="e.g. MOF-BVI" className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#8899b4]">Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Department description..." rows={3} className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#8899b4]">Tier</Label>
                <Select value={formData.tier} onValueChange={(v) => setFormData({ ...formData, tier: v })}>
                  <SelectTrigger className="bg-[#0a1628] border-[#1e3a5f] text-[#8899b4]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#152a4e] border-[#1e3a5f]">
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {createStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[#8899b4]">Owner Name</Label>
                <Input value={formData.ownerName} onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })} placeholder="Department head name" className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#8899b4]">Owner Email</Label>
                <Input type="email" value={formData.ownerEmail} onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })} placeholder="owner@bvi.gov.vg" className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#8899b4]">Contact Phone</Label>
                <Input value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} placeholder="+1-284-XXX-XXXX" className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#8899b4]">Address</Label>
                <Textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Physical address" rows={2} className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" />
              </div>
            </div>
          )}

          {createStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[#8899b4]">Monthly Fee (USD)</Label>
                <Input type="number" value={formData.monthlyFee} onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })} className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" />
              </div>
              <Card className="border-[#1e3a5f] bg-[#0a1628]">
                <CardContent className="p-4 space-y-2">
                  <h4 className="text-sm font-medium text-[#e8edf5]">Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-[#8899b4]">Name:</span><span className="text-[#e8edf5]">{formData.name || '—'}</span>
                    <span className="text-[#8899b4]">Code:</span><span className="text-[#e8edf5] font-mono">{formData.code || '—'}</span>
                    <span className="text-[#8899b4]">Tier:</span><span className="text-[#e8edf5]">{formData.tier}</span>
                    <span className="text-[#8899b4]">Owner:</span><span className="text-[#e8edf5]">{formData.ownerName || '—'}</span>
                    <span className="text-[#8899b4]">Fee:</span><span className="text-[#d4af37]">${formData.monthlyFee}/mo</span>
                  </div>
                </CardContent>
              </Card>
              <p className="text-xs text-[#8899b4]">By creating this department, you agree to BVI Digital Tower terms and compliance requirements.</p>
            </div>
          )}

          <DialogFooter>
            {createStep > 1 && (
              <Button variant="outline" onClick={() => setCreateStep(createStep - 1)} className="border-[#1e3a5f] text-[#8899b4]">Back</Button>
            )}
            {createStep < 3 ? (
              <Button onClick={() => setCreateStep(createStep + 1)} className="bg-[#d4af37] text-[#0a1628] hover:bg-[#e6c453]">Next</Button>
            ) : (
              <Button onClick={handleCreate} disabled={!formData.name || !formData.code} className="bg-[#d4af37] text-[#0a1628] hover:bg-[#e6c453]">Create Department</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-[#0f2140] border-[#1e3a5f]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#e8edf5]">Delete Department</AlertDialogTitle>
            <AlertDialogDescription className="text-[#8899b4]">
              This action cannot be undone. All associated members, requests, and documents will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#152a4e] text-[#e8edf5] border-[#1e3a5f]">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-[#f87171] text-white hover:bg-[#ef4444]">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Department */}
      <Dialog open={!!viewDept} onOpenChange={() => setViewDept(null)}>
        <DialogContent className="bg-[#0f2140] border-[#1e3a5f] max-w-lg">
          {viewDept && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[#e8edf5]">{viewDept.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-[#8899b4]">Code:</span> <span className="text-[#e8edf5] font-mono">{viewDept.code}</span></div>
                  <div><span className="text-[#8899b4]">Tier:</span> <span className="text-[#d4af37]">{viewDept.tier}</span></div>
                  <div><span className="text-[#8899b4]">Status:</span> <span className={viewDept.status}>{viewDept.status}</span></div>
                  <div><span className="text-[#8899b4]">Fee:</span> <span className="text-[#e8edf5]">${viewDept.monthlyFee}/mo</span></div>
                  <div><span className="text-[#8899b4]">Owner:</span> <span className="text-[#e8edf5]">{viewDept.ownerName || '—'}</span></div>
                  <div><span className="text-[#8899b4]">Email:</span> <span className="text-[#e8edf5]">{viewDept.ownerEmail || '—'}</span></div>
                  <div className="col-span-2"><span className="text-[#8899b4]">Address:</span> <span className="text-[#e8edf5]">{viewDept.address || '—'}</span></div>
                </div>
                {viewDept.description && (
                  <p className="text-xs text-[#8899b4] mt-2 p-3 bg-[#0a1628] rounded-lg">{viewDept.description}</p>
                )}
                {viewDept._count && (
                  <div className="flex gap-4 pt-2">
                    <Badge variant="outline" className="border-[#1e3a5f] text-[#8899b4]">{viewDept._count.members} members</Badge>
                    <Badge variant="outline" className="border-[#1e3a5f] text-[#8899b4]">{viewDept._count.serviceRequests} requests</Badge>
                    <Badge variant="outline" className="border-[#1e3a5f] text-[#8899b4]">{viewDept._count.documents} docs</Badge>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Department */}
      <Dialog open={!!editDept} onOpenChange={() => setEditDept(null)}>
        <DialogContent className="bg-[#0f2140] border-[#1e3a5f] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#e8edf5]">Edit Department</DialogTitle>
          </DialogHeader>
          {editDept && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[#8899b4]">Name</Label>
                <Input value={editDept.name} onChange={(e) => setEditDept({ ...editDept, name: e.target.value })} className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#8899b4]">Description</Label>
                <Textarea value={editDept.description || ''} onChange={(e) => setEditDept({ ...editDept, description: e.target.value })} rows={3} className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#8899b4]">Status</Label>
                  <Select value={editDept.status} onValueChange={(v) => setEditDept({ ...editDept, status: v })}>
                    <SelectTrigger className="bg-[#0a1628] border-[#1e3a5f] text-[#8899b4]"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#152a4e] border-[#1e3a5f]">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#8899b4]">Tier</Label>
                  <Select value={editDept.tier} onValueChange={(v) => setEditDept({ ...editDept, tier: v })}>
                    <SelectTrigger className="bg-[#0a1628] border-[#1e3a5f] text-[#8899b4]"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#152a4e] border-[#1e3a5f]">
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#8899b4]">Owner Name</Label>
                  <Input value={editDept.ownerName || ''} onChange={(e) => setEditDept({ ...editDept, ownerName: e.target.value })} className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#8899b4]">Monthly Fee</Label>
                  <Input type="number" value={editDept.monthlyFee} onChange={(e) => setEditDept({ ...editDept, monthlyFee: parseFloat(e.target.value) || 0 })} className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDept(null)} className="border-[#1e3a5f] text-[#8899b4]">Cancel</Button>
            <Button onClick={handleUpdate} className="bg-[#d4af37] text-[#0a1628] hover:bg-[#e6c453]">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
