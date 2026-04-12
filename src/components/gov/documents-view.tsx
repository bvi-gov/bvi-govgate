'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Upload, File, FileText, FileImage, FileSpreadsheet, Trash2, Eye, Check, X, LayoutGrid, List, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface Document {
  id: string;
  departmentId: string;
  name: string;
  fileType?: string | null;
  fileSize?: number | null;
  uploadedBy?: string | null;
  status: string;
  createdAt: string;
  department?: { name: string; code: string } | null;
}

function getFileIcon(fileType?: string | null) {
  if (!fileType) return <File className="w-5 h-5 text-[#8899b4]" />;
  if (fileType.includes('pdf')) return <FileText className="w-5 h-5 text-[#f87171]" />;
  if (fileType.includes('word') || fileType.includes('document')) return <FileText className="w-5 h-5 text-[#38bdf8]" />;
  if (fileType.includes('sheet') || fileType.includes('excel') || fileType.includes('csv')) return <FileSpreadsheet className="w-5 h-5 text-[#4ade80]" />;
  if (fileType.includes('image')) return <FileImage className="w-5 h-5 text-[#a855f7]" />;
  return <File className="w-5 h-5 text-[#8899b4]" />;
}

function formatFileSize(bytes?: number | null) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function DocumentsView() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [formData, setFormData] = useState({ name: '', departmentId: '', fileType: 'application/pdf', fileSize: '' });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [deptRes, docRes] = await Promise.all([
          fetch('/api/departments'),
          (async () => {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (statusFilter) params.set('status', statusFilter);
            return fetch(`/api/documents?${params}`);
          })(),
        ]);
        if (!cancelled) {
          if (deptRes.ok) {
            const deptData = await deptRes.json();
            setDepartments(deptData.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name })));
          }
          if (docRes.ok) setDocuments(await docRes.json());
          setLoading(false);
        }
      } catch (err) { console.error(err); if (!cancelled) setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [search, statusFilter]);

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          fileSize: parseInt(formData.fileSize) || 0,
          uploadedBy: 'Admin User',
        }),
      });
      if (res.ok) {
        toast.success('Document uploaded');
        setCreateOpen(false);
        setFormData({ name: '', departmentId: '', fileType: 'application/pdf', fileSize: '' });
        window.location.reload();
      } else { toast.error('Failed to upload document'); }
    } catch { toast.error('Error'); }
  };

  const handleDelete = async () => {
    try {
      await fetch(`/api/documents/${deleteId}`, { method: 'DELETE' });
      toast.success('Document deleted');
      setDeleteOpen(false);
      window.location.reload();
    } catch { toast.error('Failed to delete'); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/documents/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      toast.success(`Document ${status}`);
      window.location.reload();
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="space-y-6 section-enter">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#e8edf5]">Documentos</h2>
          <p className="text-sm text-[#8899b4]">{documents.length} documents</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchDocuments} variant="outline" size="sm" className="border-[#1e3a5f] text-[#8899b4]"><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
          <Button onClick={() => setCreateOpen(true)} className="bg-[#d4af37] text-[#0a1628] hover:bg-[#e6c453]"><Upload className="w-4 h-4 mr-2" />Upload</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8899b4]" />
          <Input placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-[#0f2140] border-[#1e3a5f] text-[#e8edf5] placeholder:text-[#8899b4]" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-36 bg-[#0f2140] border-[#1e3a5f] text-[#8899b4]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="bg-[#152a4e] border-[#1e3a5f]">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border border-[#1e3a5f] rounded-lg overflow-hidden">
          <Button variant="ghost" size="icon" onClick={() => setViewMode('list')} className={`h-9 w-9 ${viewMode === 'list' ? 'bg-[#152a4e] text-[#d4af37]' : 'text-[#8899b4]'}`}><List className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setViewMode('grid')} className={`h-9 w-9 ${viewMode === 'grid' ? 'bg-[#152a4e] text-[#d4af37]' : 'text-[#8899b4]'}`}><LayoutGrid className="w-4 h-4" /></Button>
        </div>
      </div>

      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-2'}>
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className={viewMode === 'grid' ? 'h-40 bg-[#152a4e] rounded-xl' : 'h-16 bg-[#152a4e]'} />)}
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16"><FileText className="w-12 h-12 text-[#1e3a5f] mb-4" /><h3 className="text-lg font-semibold text-[#e8edf5]">No documents found</h3></div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="border-[#1e3a5f] bg-[#0f2140] hover:border-[#d4af37]/30 transition-all group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  {getFileIcon(doc.fileType)}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded status-${doc.status}`}>{doc.status}</span>
                </div>
                <p className="text-xs font-medium text-[#e8edf5] line-clamp-2 mb-1">{doc.name}</p>
                <p className="text-[10px] text-[#8899b4]">{doc.department?.name}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1e3a5f]/50">
                  <span className="text-[10px] text-[#8899b4]">{formatFileSize(doc.fileSize)}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {doc.status === 'pending' && (
                      <>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-[#4ade80]" onClick={() => handleStatusChange(doc.id, 'verified')}><Check className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-[#f87171]" onClick={() => handleStatusChange(doc.id, 'rejected')}><X className="w-3 h-3" /></Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-[#f87171]" onClick={() => { setDeleteId(doc.id); setDeleteOpen(true); }}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-[#1e3a5f] bg-[#0f2140]"><CardContent className="p-0"><div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#1e3a5f] hover:bg-transparent">
                <TableHead className="text-[#8899b4] text-xs">Name</TableHead>
                <TableHead className="text-[#8899b4] text-xs">Department</TableHead>
                <TableHead className="text-[#8899b4] text-xs">Type</TableHead>
                <TableHead className="text-[#8899b4] text-xs">Size</TableHead>
                <TableHead className="text-[#8899b4] text-xs">Status</TableHead>
                <TableHead className="text-[#8899b4] text-xs">Uploaded</TableHead>
                <TableHead className="text-[#8899b4] text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id} className="border-[#1e3a5f]/50 table-row-hover">
                  <TableCell><div className="flex items-center gap-2">{getFileIcon(doc.fileType)}<span className="text-xs text-[#e8edf5]">{doc.name}</span></div></TableCell>
                  <TableCell className="text-xs text-[#8899b4]">{doc.department?.name}</TableCell>
                  <TableCell className="text-xs text-[#8899b4]">{doc.fileType?.split('/').pop() || '—'}</TableCell>
                  <TableCell className="text-xs text-[#8899b4]">{formatFileSize(doc.fileSize)}</TableCell>
                  <TableCell><span className={`text-[10px] px-2 py-0.5 rounded status-${doc.status}`}>{doc.status}</span></TableCell>
                  <TableCell className="text-xs text-[#8899b4]">{format(new Date(doc.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {doc.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-[#4ade80]" onClick={() => handleStatusChange(doc.id, 'verified')}><Check className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-[#f87171]" onClick={() => handleStatusChange(doc.id, 'rejected')}><X className="w-3.5 h-3.5" /></Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-[#f87171]" onClick={() => { setDeleteId(doc.id); setDeleteOpen(true); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div></CardContent></Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[#0f2140] border-[#1e3a5f] max-w-md">
          <DialogHeader><DialogTitle className="text-[#e8edf5]">Upload Document</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label className="text-[#8899b4]">Document Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" /></div>
            <div className="space-y-2">
              <Label className="text-[#8899b4]">Department *</Label>
              <Select value={formData.departmentId} onValueChange={(v) => setFormData({ ...formData, departmentId: v })}>
                <SelectTrigger className="bg-[#0a1628] border-[#1e3a5f] text-[#8899b4]"><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent className="bg-[#152a4e] border-[#1e3a5f]">{departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-[#8899b4]">File Type</Label>
                <Select value={formData.fileType} onValueChange={(v) => setFormData({ ...formData, fileType: v })}>
                  <SelectTrigger className="bg-[#0a1628] border-[#1e3a5f] text-[#8899b4]"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#152a4e] border-[#1e3a5f]">
                    <SelectItem value="application/pdf">PDF</SelectItem>
                    <SelectItem value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word</SelectItem>
                    <SelectItem value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Excel</SelectItem>
                    <SelectItem value="image/png">Image (PNG)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label className="text-[#8899b4]">Size (bytes)</Label><Input type="number" value={formData.fileSize} onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })} className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="border-[#1e3a5f] text-[#8899b4]">Cancel</Button>
            <Button onClick={handleCreate} disabled={!formData.name || !formData.departmentId} className="bg-[#d4af37] text-[#0a1628] hover:bg-[#e6c453]">Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-[#0f2140] border-[#1e3a5f]">
          <AlertDialogHeader><AlertDialogTitle className="text-[#e8edf5]">Delete Document</AlertDialogTitle><AlertDialogDescription className="text-[#8899b4]">This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#152a4e] text-[#e8edf5] border-[#1e3a5f]">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-[#f87171] text-white hover:bg-[#ef4444]">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
