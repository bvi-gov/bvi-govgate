'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Plus, Users, MoreHorizontal, Pencil, Trash2, Shield, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface Member {
  id: string;
  departmentId: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin?: string | null;
  createdAt: string;
  department?: { name: string; code: string } | null;
}

const roleColors: Record<string, string> = {
  admin: 'bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]/30',
  supervisor: 'bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/30',
  operator: 'bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/30',
};

export function TeamView() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [formData, setFormData] = useState({ departmentId: '', name: '', email: '', role: 'operator' });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [deptRes, memRes] = await Promise.all([
          fetch('/api/departments'),
          (async () => {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (roleFilter) params.set('role', roleFilter);
            return fetch(`/api/members?${params}`);
          })(),
        ]);
        if (!cancelled) {
          if (deptRes.ok) {
            const deptData = await deptRes.json();
            setDepartments(deptData.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name })));
          }
          if (memRes.ok) setMembers(await memRes.json());
          setLoading(false);
        }
      } catch (err) { console.error(err); if (!cancelled) setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [search, roleFilter]);

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success('Member added');
        setCreateOpen(false);
        setFormData({ departmentId: '', name: '', email: '', role: 'operator' });
        window.location.reload();
      } else { toast.error('Failed to add member'); }
    } catch { toast.error('Error'); }
  };

  const handleUpdate = async () => {
    if (!editMember) return;
    try {
      const res = await fetch(`/api/members/${editMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editMember.name, email: editMember.email, role: editMember.role, status: editMember.status }),
      });
      if (res.ok) { toast.success('Member updated'); setEditMember(null); fetchMembers(); }
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    try {
      await fetch(`/api/members/${deleteId}`, { method: 'DELETE' });
      toast.success('Member removed');
      setDeleteOpen(false);
      fetchMembers();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6 section-enter">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#e8edf5]">Equipo</h2>
          <p className="text-sm text-[#8899b4]">{members.length} team members</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchMembers} variant="outline" size="sm" className="border-[#1e3a5f] text-[#8899b4]"><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
          <Button onClick={() => setCreateOpen(true)} className="bg-[#d4af37] text-[#0a1628] hover:bg-[#e6c453]"><Plus className="w-4 h-4 mr-2" />Invite Member</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8899b4]" />
          <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-[#0f2140] border-[#1e3a5f] text-[#e8edf5] placeholder:text-[#8899b4]" />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-36 bg-[#0f2140] border-[#1e3a5f] text-[#8899b4]"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent className="bg-[#152a4e] border-[#1e3a5f]">
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="supervisor">Supervisor</SelectItem>
            <SelectItem value="operator">Operator</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="flex gap-4 flex-wrap">
        <div className="px-4 py-2 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 text-xs"><span className="text-[#8899b4]">Admins: </span><strong className="text-[#d4af37]">{members.filter(m => m.role === 'admin').length}</strong></div>
        <div className="px-4 py-2 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/30 text-xs"><span className="text-[#8899b4]">Supervisors: </span><strong className="text-[#a855f7]">{members.filter(m => m.role === 'supervisor').length}</strong></div>
        <div className="px-4 py-2 rounded-lg bg-[#38bdf8]/10 border border-[#38bdf8]/30 text-xs"><span className="text-[#8899b4]">Operators: </span><strong className="text-[#38bdf8]">{members.filter(m => m.role === 'operator').length}</strong></div>
        <div className="px-4 py-2 rounded-lg bg-[#4ade80]/10 border border-[#4ade80]/30 text-xs"><span className="text-[#8899b4]">Active: </span><strong className="text-[#4ade80]">{members.filter(m => m.status === 'active').length}</strong></div>
      </div>

      <Card className="border-[#1e3a5f] bg-[#0f2140]"><CardContent className="p-0">
        {loading ? (
          <div className="space-y-3 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 bg-[#152a4e]" />)}</div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16"><Users className="w-12 h-12 text-[#1e3a5f] mb-4" /><h3 className="text-lg font-semibold text-[#e8edf5]">No team members</h3></div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#1e3a5f] hover:bg-transparent">
                  <TableHead className="text-[#8899b4] text-xs">Member</TableHead>
                  <TableHead className="text-[#8899b4] text-xs">Department</TableHead>
                  <TableHead className="text-[#8899b4] text-xs">Role</TableHead>
                  <TableHead className="text-[#8899b4] text-xs">Status</TableHead>
                  <TableHead className="text-[#8899b4] text-xs">Last Login</TableHead>
                  <TableHead className="text-[#8899b4] text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id} className="border-[#1e3a5f]/50 table-row-hover">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 border border-[#1e3a5f]">
                          <AvatarFallback className="bg-[#152a4e] text-[#d4af37] text-xs font-bold">{m.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-medium text-[#e8edf5]">{m.name}</p>
                          <p className="text-[10px] text-[#8899b4]">{m.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-[#8899b4]">{m.department?.name}</TableCell>
                    <TableCell><span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${roleColors[m.role] || roleColors.operator}`}>{m.role}</span></TableCell>
                    <TableCell><span className={`text-[10px] px-2 py-0.5 rounded-full status-${m.status}`}>{m.status}</span></TableCell>
                    <TableCell className="text-xs text-[#8899b4]">{m.lastLogin ? format(new Date(m.lastLogin), 'MMM d, HH:mm') : 'Never'}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-[#8899b4] hover:text-[#e8edf5]"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#152a4e] border-[#1e3a5f]">
                            <DropdownMenuItem onClick={() => setEditMember({ ...m })} className="text-[#e8edf5] focus:bg-[#1e3a5f]"><Pencil className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setDeleteId(m.id); setDeleteOpen(true); }} className="text-[#f87171] focus:bg-[#1e3a5f]"><Trash2 className="w-4 h-4 mr-2" />Remove</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent></Card>

      {/* Create Member */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[#0f2140] border-[#1e3a5f] max-w-md">
          <DialogHeader><DialogTitle className="text-[#e8edf5]">Invite Team Member</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label className="text-[#8899b4]">Full Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" /></div>
            <div className="space-y-2"><Label className="text-[#8899b4]">Email *</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-[#8899b4]">Department *</Label>
                <Select value={formData.departmentId} onValueChange={(v) => setFormData({ ...formData, departmentId: v })}>
                  <SelectTrigger className="bg-[#0a1628] border-[#1e3a5f] text-[#8899b4]"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-[#152a4e] border-[#1e3a5f]">{departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label className="text-[#8899b4]">Role</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                  <SelectTrigger className="bg-[#0a1628] border-[#1e3a5f] text-[#8899b4]"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#152a4e] border-[#1e3a5f]"><SelectItem value="admin">Admin</SelectItem><SelectItem value="supervisor">Supervisor</SelectItem><SelectItem value="operator">Operator</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="border-[#1e3a5f] text-[#8899b4]">Cancel</Button>
            <Button onClick={handleCreate} disabled={!formData.name || !formData.email || !formData.departmentId} className="bg-[#d4af37] text-[#0a1628] hover:bg-[#e6c453]">Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member */}
      <Dialog open={!!editMember} onOpenChange={() => setEditMember(null)}>
        <DialogContent className="bg-[#0f2140] border-[#1e3a5f] max-w-md">
          <DialogHeader><DialogTitle className="text-[#e8edf5]">Edit Member</DialogTitle></DialogHeader>
          {editMember && (
            <div className="space-y-4">
              <div className="space-y-2"><Label className="text-[#8899b4]">Name</Label><Input value={editMember.name} onChange={(e) => setEditMember({ ...editMember, name: e.target.value })} className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" /></div>
              <div className="space-y-2"><Label className="text-[#8899b4]">Email</Label><Input value={editMember.email} onChange={(e) => setEditMember({ ...editMember, email: e.target.value })} className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-[#8899b4]">Role</Label>
                  <Select value={editMember.role} onValueChange={(v) => setEditMember({ ...editMember, role: v })}>
                    <SelectTrigger className="bg-[#0a1628] border-[#1e3a5f] text-[#8899b4]"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#152a4e] border-[#1e3a5f]"><SelectItem value="admin">Admin</SelectItem><SelectItem value="supervisor">Supervisor</SelectItem><SelectItem value="operator">Operator</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label className="text-[#8899b4]">Status</Label>
                  <Select value={editMember.status} onValueChange={(v) => setEditMember({ ...editMember, status: v })}>
                    <SelectTrigger className="bg-[#0a1628] border-[#1e3a5f] text-[#8899b4]"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#152a4e] border-[#1e3a5f]"><SelectItem value="active">Active</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="suspended">Suspended</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMember(null)} className="border-[#1e3a5f] text-[#8899b4]">Cancel</Button>
            <Button onClick={handleUpdate} className="bg-[#d4af37] text-[#0a1628] hover:bg-[#e6c453]">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-[#0f2140] border-[#1e3a5f]">
          <AlertDialogHeader><AlertDialogTitle className="text-[#e8edf5]">Remove Member</AlertDialogTitle><AlertDialogDescription className="text-[#8899b4]">This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#152a4e] text-[#e8edf5] border-[#1e3a5f]">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-[#f87171] text-white hover:bg-[#ef4444]">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
