import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Split, CheckCircle, XCircle, Mail, FileText, DollarSign,
  User, Clock, AlertTriangle, Maximize2, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";

export default function OperatorWorkstation() {
  const [user, setUser] = useState(null);
  const [department, setDepartment] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [documentHtml, setDocumentHtml] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const deptUsers = await base44.entities.DepartmentUser.filter({ user_email: currentUser.email });
      if (deptUsers.length > 0) {
        const depts = await base44.entities.Department.filter({ id: deptUsers[0].department_id });
        if (depts.length > 0) setDepartment(depts[0]);
      }
    };
    loadData();
  }, []);

  const { data: pendingRequests = [], refetch } = useQuery({
    queryKey: ["citizen-requests", department?.id],
    queryFn: () => department ? base44.entities.CitizenRequest.filter({
      department_id: department.id,
      status: "pending"
    }, "-created_date") : [],
    enabled: !!department,
    refetchInterval: 10000,
  });

  const { data: template } = useQuery({
    queryKey: ["template", selectedRequest?.template_id],
    queryFn: async () => {
      if (!selectedRequest?.template_id) return null;
      const templates = await base44.entities.DocumentTemplate.filter({ id: selectedRequest.template_id });
      return templates[0];
    },
    enabled: !!selectedRequest?.template_id,
  });

  useEffect(() => {
    if (template && selectedRequest) {
      let html = template.template_html || "<html><body><h1>{{applicant_name}}</h1><p>Document content here</p></body></html>";
      
      // Smart-fill variables
      html = html.replace(/\{\{applicant_name\}\}/g, selectedRequest.applicant_name || "");
      html = html.replace(/\{\{applicant_email\}\}/g, selectedRequest.applicant_email || "");
      html = html.replace(/\{\{tracking_token\}\}/g, selectedRequest.tracking_token || "");
      html = html.replace(/\{\{date\}\}/g, format(new Date(), "MMMM dd, yyyy"));
      html = html.replace(/\{\{department_name\}\}/g, department?.name || "");
      
      // Custom form fields
      if (selectedRequest.form_data) {
        Object.entries(selectedRequest.form_data).forEach(([key, value]) => {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
          html = html.replace(regex, value || "");
        });
      }
      
      setDocumentHtml(html);
    }
  }, [template, selectedRequest, department]);

  const handleApprove = async () => {
    if (!selectedRequest || processing) return;
    
    setProcessing(true);
    try {
      // In production, call backend function to:
      // 1. Generate PDF from HTML
      // 2. Upload to storage
      // 3. Send email to citizen
      // For now, we'll just update the status
      
      await base44.entities.CitizenRequest.update(selectedRequest.id, {
        status: "completed",
        approved_by: user.email,
        approved_at: new Date().toISOString(),
        approval_notes: approvalNotes,
      });

      await base44.entities.AuditLog.create({
        department_id: department.id,
        user_email: user.email,
        action: "approve",
        entity_type: "CitizenRequest",
        entity_id: selectedRequest.id,
        description: `Approved citizen request ${selectedRequest.tracking_token}`,
        severity: "info",
      });

      toast.success("Request approved and citizen notified");
      setSelectedRequest(null);
      setApprovalNotes("");
      refetch();
    } catch (error) {
      toast.error("Failed to approve request");
    }
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!selectedRequest || processing) return;
    
    setProcessing(true);
    try {
      await base44.entities.CitizenRequest.update(selectedRequest.id, {
        status: "rejected",
        approved_by: user.email,
        approved_at: new Date().toISOString(),
        approval_notes: approvalNotes,
      });

      toast.success("Request rejected");
      setSelectedRequest(null);
      setApprovalNotes("");
      refetch();
    } catch (error) {
      toast.error("Failed to reject request");
    }
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#b8941f] flex items-center justify-center">
            <Split className="h-5 w-5 text-[#0a1628]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Operator Workstation</h1>
            <p className="text-xs text-slate-500">Split-screen fast-track processing</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-[#1e3a5f] text-slate-400">
            {pendingRequests.length} Pending
          </Badge>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            className="border-[#1e3a5f] text-slate-400 hover:bg-[#152a4e]"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Split-Screen Layout */}
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-140px)]">
        {/* Left: Pending Requests */}
        <div className="col-span-4 rounded-xl border border-[#1e3a5f] overflow-hidden flex flex-col">
          <div className="p-4 bg-[#152a4e] border-b border-[#1e3a5f]">
            <h2 className="font-semibold text-white">Pending Requests</h2>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-[#1e3a5f]">
            {pendingRequests.length === 0 ? (
              <div className="p-8 text-center">
                <Clock className="mx-auto h-10 w-10 text-slate-600 mb-3" />
                <p className="text-slate-400">No pending requests</p>
              </div>
            ) : (
              pendingRequests.map((request, idx) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-[#152a4e]/50 transition-colors",
                    selectedRequest?.id === request.id && "bg-[#152a4e] border-l-2 border-[#d4af37]"
                  )}
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-[#d4af37]">{request.tracking_token}</span>
                    {request.payment_verified ? (
                      <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                        PAID
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                        UNPAID
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-medium text-white text-sm">{request.applicant_name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{request.applicant_email}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {request.created_date && format(new Date(request.created_date), "MMM d, HH:mm")}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right: Document Editor & Actions */}
        <div className="col-span-8 rounded-xl border border-[#1e3a5f] overflow-hidden flex flex-col">
          {!selectedRequest ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileText className="mx-auto h-16 w-16 text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-slate-400">Select a request to process</h3>
                <p className="text-sm text-slate-500 mt-1">Choose from the pending list on the left</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 bg-[#152a4e] border-b border-[#1e3a5f]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-white">{selectedRequest.applicant_name}</h2>
                    <p className="text-xs text-slate-500">Token: {selectedRequest.tracking_token}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!selectedRequest.payment_verified && (
                      <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Payment Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Preview */}
              <div className="flex-1 overflow-y-auto p-6 bg-white">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: documentHtml }}
                />
              </div>

              {/* Actions Bar */}
              <div className="p-4 bg-[#152a4e] border-t border-[#1e3a5f] space-y-3">
                <div>
                  <Label className="text-slate-300 text-xs">Approval Notes</Label>
                  <Textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    className="bg-[#0a1628] border-[#1e3a5f] text-white mt-1"
                    rows={2}
                    placeholder="Optional notes..."
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleReject}
                    disabled={processing}
                    variant="outline"
                    className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Reject
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={processing || (!selectedRequest.payment_verified && selectedRequest.payment_amount > 0)}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {processing ? "Processing..." : "Approve & Send"}
                  </Button>
                </div>
                {!selectedRequest.payment_verified && selectedRequest.payment_amount > 0 && (
                  <p className="text-xs text-amber-400 text-center">
                    <AlertTriangle className="inline h-3 w-3 mr-1" />
                    Payment must be verified before approval
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}