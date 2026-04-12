import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FileText, Search, Filter, Plus, Eye, Edit, Trash2,
  Clock, CheckCircle, XCircle, AlertTriangle, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function ServiceRequests() {
  const [user, setUser] = useState(null);
  const [department, setDepartment] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    request_type: "",
    applicant_name: "",
    applicant_email: "",
    applicant_phone: "",
    priority: "normal",
    notes: "",
  });

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const deptUsers = await base44.entities.DepartmentUser.filter({ user_email: currentUser.email });
      if (deptUsers.length > 0) {
        const depts = await base44.entities.Department.filter({ id: deptUsers[0].department_id });
        if (depts.length > 0) setDepartment(depts[0]);
      }

      // Check URL for new param
      const params = new URLSearchParams(window.location.search);
      if (params.get("new") === "true") {
        setShowForm(true);
      }
    };
    loadData();
  }, []);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["requests", department?.id],
    queryFn: () => department ? base44.entities.ServiceRequest.filter({ department_id: department.id }, "-created_date") : [],
    enabled: !!department,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ServiceRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["requests"]);
      setShowForm(false);
      setFormData({
        request_type: "",
        applicant_name: "",
        applicant_email: "",
        applicant_phone: "",
        priority: "normal",
        notes: "",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ServiceRequest.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(["requests"]),
  });

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.applicant_name?.toLowerCase().includes(search.toLowerCase()) ||
      req.reference_number?.toLowerCase().includes(search.toLowerCase()) ||
      req.request_type?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = () => {
    const refNumber = `REQ-${Date.now().toString(36).toUpperCase()}`;
    const purgeDate = new Date();
    purgeDate.setDate(purgeDate.getDate() + 7);

    createMutation.mutate({
      ...formData,
      department_id: department.id,
      reference_number: refNumber,
      status: "pending",
      purge_after: purgeDate.toISOString(),
    });
  };

  const statusColors = {
    pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };

  const priorityColors = {
    low: "text-slate-400",
    normal: "text-blue-400",
    high: "text-amber-400",
    urgent: "text-red-400",
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Service Requests</h1>
          <p className="text-sm text-slate-500">{department?.name || "Loading..."}</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#0a1628] font-semibold"
        >
          <Plus className="mr-2 h-4 w-4" /> New Request
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#0f2140] border-[#1e3a5f] text-white placeholder:text-slate-600"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-[#0f2140] border-[#1e3a5f] text-white">
            <Filter className="mr-2 h-4 w-4 text-slate-500" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0f2140] border-[#1e3a5f]">
            <SelectItem value="all" className="text-white focus:bg-[#152a4e]">All Status</SelectItem>
            <SelectItem value="pending" className="text-white focus:bg-[#152a4e]">Pending</SelectItem>
            <SelectItem value="processing" className="text-white focus:bg-[#152a4e]">Processing</SelectItem>
            <SelectItem value="approved" className="text-white focus:bg-[#152a4e]">Approved</SelectItem>
            <SelectItem value="completed" className="text-white focus:bg-[#152a4e]">Completed</SelectItem>
            <SelectItem value="rejected" className="text-white focus:bg-[#152a4e]">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#1e3a5f] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[#1e3a5f] hover:bg-transparent">
              <TableHead className="text-slate-400">Reference</TableHead>
              <TableHead className="text-slate-400">Type</TableHead>
              <TableHead className="text-slate-400">Applicant</TableHead>
              <TableHead className="text-slate-400">Priority</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-slate-400">Date</TableHead>
              <TableHead className="text-slate-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="border-[#1e3a5f]">
                  <TableCell colSpan={7}>
                    <div className="h-12 bg-[#152a4e] rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredRequests.length === 0 ? (
              <TableRow className="border-[#1e3a5f]">
                <TableCell colSpan={7} className="text-center py-12">
                  <FileText className="mx-auto h-10 w-10 text-slate-600 mb-3" />
                  <p className="text-slate-400">No requests found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((req, idx) => (
                <motion.tr
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="border-[#1e3a5f] hover:bg-[#152a4e]/50"
                >
                  <TableCell className="font-mono text-sm text-white">{req.reference_number}</TableCell>
                  <TableCell className="text-slate-300">{req.request_type}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-white text-sm">{req.applicant_name}</p>
                      <p className="text-slate-500 text-xs">{req.applicant_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn("text-sm font-medium", priorityColors[req.priority])}>
                      {req.priority?.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("border", statusColors[req.status])}>
                      {req.status?.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-400 text-sm">
                    {req.created_date && format(new Date(req.created_date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedRequest(req)}
                        className="text-slate-500 hover:text-white hover:bg-[#1e3a5f]"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* New Request Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-[#0f2140] border-[#1e3a5f] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">New Service Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Request Type *</Label>
              <Input
                value={formData.request_type}
                onChange={(e) => setFormData(prev => ({ ...prev, request_type: e.target.value }))}
                placeholder="e.g., License Application"
                className="bg-[#0a1628] border-[#1e3a5f] text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Applicant Name *</Label>
                <Input
                  value={formData.applicant_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, applicant_name: e.target.value }))}
                  className="bg-[#0a1628] border-[#1e3a5f] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, priority: v }))}
                >
                  <SelectTrigger className="bg-[#0a1628] border-[#1e3a5f] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f2140] border-[#1e3a5f]">
                    <SelectItem value="low" className="text-white focus:bg-[#152a4e]">Low</SelectItem>
                    <SelectItem value="normal" className="text-white focus:bg-[#152a4e]">Normal</SelectItem>
                    <SelectItem value="high" className="text-white focus:bg-[#152a4e]">High</SelectItem>
                    <SelectItem value="urgent" className="text-white focus:bg-[#152a4e]">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Email</Label>
                <Input
                  type="email"
                  value={formData.applicant_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, applicant_email: e.target.value }))}
                  className="bg-[#0a1628] border-[#1e3a5f] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Phone</Label>
                <Input
                  value={formData.applicant_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, applicant_phone: e.target.value }))}
                  className="bg-[#0a1628] border-[#1e3a5f] text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="bg-[#0a1628] border-[#1e3a5f] text-white"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="border-[#1e3a5f] text-slate-300 hover:bg-[#152a4e]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.request_type || !formData.applicant_name || createMutation.isPending}
                className="bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#0a1628] font-semibold"
              >
                Create Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Request Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="bg-[#0f2140] border-[#1e3a5f] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 mt-4">
              <div className="p-4 rounded-lg bg-[#0a1628] border border-[#1e3a5f]">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-sm text-[#d4af37]">{selectedRequest.reference_number}</span>
                  <Badge variant="outline" className={cn("border", statusColors[selectedRequest.status])}>
                    {selectedRequest.status?.toUpperCase()}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg">{selectedRequest.request_type}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Applicant</p>
                  <p className="text-white font-medium">{selectedRequest.applicant_name}</p>
                </div>
                <div>
                  <p className="text-slate-500">Priority</p>
                  <p className={cn("font-medium", priorityColors[selectedRequest.priority])}>
                    {selectedRequest.priority?.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Email</p>
                  <p className="text-white">{selectedRequest.applicant_email || "—"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Phone</p>
                  <p className="text-white">{selectedRequest.applicant_phone || "—"}</p>
                </div>
              </div>
              {selectedRequest.notes && (
                <div>
                  <p className="text-slate-500 text-sm mb-1">Notes</p>
                  <p className="text-slate-300 text-sm">{selectedRequest.notes}</p>
                </div>
              )}
              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setSelectedRequest(null)}
                  className="bg-[#152a4e] text-white hover:bg-[#1e3a5f]"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}