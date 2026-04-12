import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Shield, FileText, Search, CheckCircle, Clock, AlertCircle,
  ChevronRight, ExternalLink, Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function CitizenPortal() {
  const [step, setStep] = useState("select"); // select, form, track
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [trackingToken, setTrackingToken] = useState("");
  const [formData, setFormData] = useState({});
  const queryClient = useQueryClient();

  const { data: departments = [] } = useQuery({
    queryKey: ["public-departments"],
    queryFn: () => base44.entities.Department.filter({ status: "active" }),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["templates", selectedDept?.id],
    queryFn: () => selectedDept ? base44.entities.DocumentTemplate.filter({ 
      department_id: selectedDept.id,
      is_active: true 
    }) : [],
    enabled: !!selectedDept,
  });

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      const token = Math.random().toString(36).substring(2, 15).toUpperCase();
      const purgeDate = new Date();
      purgeDate.setDate(purgeDate.getDate() + 7);
      
      return base44.entities.CitizenRequest.create({
        ...data,
        tracking_token: token,
        status: "pending",
        purge_after: purgeDate.toISOString(),
      });
    },
    onSuccess: (newRequest) => {
      setTrackingToken(newRequest.tracking_token);
      setStep("track");
    },
  });

  const { data: trackedRequest } = useQuery({
    queryKey: ["track", trackingToken],
    queryFn: async () => {
      const requests = await base44.entities.CitizenRequest.filter({ tracking_token: trackingToken });
      return requests[0];
    },
    enabled: !!trackingToken && step === "track",
    refetchInterval: 5000,
  });

  const handleSubmit = () => {
    if (!selectedDept || !selectedTemplate) return;
    
    submitMutation.mutate({
      department_id: selectedDept.id,
      template_id: selectedTemplate.id,
      ...formData,
      payment_amount: selectedTemplate.fee_amount,
    });
  };

  const statusColors = {
    pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    payment_pending: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Header */}
      <div className="bg-gradient-to-b from-[#0a1628] to-slate-950 border-b border-[#1e3a5f] py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#b8941f] flex items-center justify-center">
              <Shield className="h-8 w-8 text-[#0a1628]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">BVI Citizen Services</h1>
              <p className="text-slate-400">Fast-track government document processing</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* Step 1: Select Department & Service */}
          {step === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-2xl font-bold text-white mb-2">Select Your Service</h2>
              <p className="text-slate-400 mb-8">Choose your department and the document you need</p>

              {!selectedDept ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {departments.map((dept) => (
                    <Card
                      key={dept.id}
                      className="cursor-pointer hover:border-[#d4af37] transition-all bg-[#152a4e] border-[#1e3a5f]"
                      onClick={() => setSelectedDept(dept)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-white text-lg">{dept.name}</h3>
                            <p className="text-sm text-slate-500 mt-1">{dept.code}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-[#d4af37]" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="mb-6 flex items-center gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedDept(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      ← Back
                    </Button>
                    <h3 className="text-xl font-semibold text-white">{selectedDept.name}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                      <Card
                        key={template.id}
                        className="cursor-pointer hover:border-[#d4af37] transition-all bg-[#152a4e] border-[#1e3a5f]"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setStep("form");
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-white">{template.name}</h4>
                              <p className="text-sm text-slate-400 mt-1">
                                {template.document_type?.replace(/_/g, " ").toUpperCase()}
                              </p>
                              <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                                <span>Processing: {template.processing_days} days</span>
                                {template.fee_amount > 0 && (
                                  <span className="text-[#d4af37]">Fee: ${template.fee_amount}</span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-[#d4af37]" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Fill Form */}
          {step === "form" && selectedTemplate && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <Button
                variant="ghost"
                onClick={() => setStep("select")}
                className="text-slate-400 hover:text-white mb-6"
              >
                ← Back to Services
              </Button>
              
              <div className="p-8 rounded-2xl bg-gradient-to-br from-[#152a4e] to-[#0f2140] border border-[#1e3a5f]">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedTemplate.name}</h2>
                <p className="text-slate-400 mb-8">Complete the form below to submit your application</p>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Full Name *</Label>
                    <Input
                      value={formData.applicant_name || ""}
                      onChange={(e) => setFormData(d => ({ ...d, applicant_name: e.target.value }))}
                      className="bg-[#0a1628] border-[#1e3a5f] text-white"
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Email Address *</Label>
                    <Input
                      type="email"
                      value={formData.applicant_email || ""}
                      onChange={(e) => setFormData(d => ({ ...d, applicant_email: e.target.value }))}
                      className="bg-[#0a1628] border-[#1e3a5f] text-white"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Phone Number</Label>
                    <Input
                      value={formData.applicant_phone || ""}
                      onChange={(e) => setFormData(d => ({ ...d, applicant_phone: e.target.value }))}
                      className="bg-[#0a1628] border-[#1e3a5f] text-white"
                      placeholder="+1 284 XXX XXXX"
                    />
                  </div>

                  {selectedTemplate.required_fields?.map((field, idx) => (
                    <div key={idx} className="space-y-2">
                      <Label className="text-slate-300">
                        {field.field_label} {field.required && "*"}
                      </Label>
                      <Input
                        type={field.field_type || "text"}
                        value={formData.form_data?.[field.field_name] || ""}
                        onChange={(e) => setFormData(d => ({
                          ...d,
                          form_data: { ...d.form_data, [field.field_name]: e.target.value }
                        }))}
                        className="bg-[#0a1628] border-[#1e3a5f] text-white"
                      />
                    </div>
                  ))}

                  {selectedTemplate.fee_amount > 0 && (
                    <div className="p-4 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30">
                      <p className="text-sm text-slate-300">
                        Application Fee: <span className="text-[#d4af37] font-semibold">${selectedTemplate.fee_amount}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Payment instructions will be sent to your email</p>
                    </div>
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={!formData.applicant_name || !formData.applicant_email || submitMutation.isPending}
                    className="w-full bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#0a1628] font-semibold py-6 text-lg"
                  >
                    {submitMutation.isPending ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Track Application */}
          {step === "track" && (
            <motion.div
              key="track"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
                <p className="text-slate-400">Your tracking code has been sent to your email</p>
              </div>

              <div className="p-8 rounded-2xl bg-gradient-to-br from-[#152a4e] to-[#0f2140] border border-[#1e3a5f] mb-8">
                <div className="text-center mb-6">
                  <p className="text-sm text-slate-500 mb-2">Your Tracking Code</p>
                  <p className="text-3xl font-mono font-bold text-[#d4af37] tracking-wider">{trackingToken}</p>
                </div>

                {trackedRequest && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-[#0a1628] border border-[#1e3a5f]">
                      <span className="text-slate-400">Status</span>
                      <Badge variant="outline" className={cn("border", statusColors[trackedRequest.status])}>
                        {trackedRequest.status?.replace(/_/g, " ").toUpperCase()}
                      </Badge>
                    </div>
                    
                    {trackedRequest.payment_amount > 0 && !trackedRequest.payment_verified && (
                      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <div className="flex items-center gap-2 text-amber-400 mb-2">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-medium">Payment Required</span>
                        </div>
                        <p className="text-sm text-slate-300">Amount: ${trackedRequest.payment_amount}</p>
                        <p className="text-xs text-slate-500 mt-1">Payment instructions sent to {trackedRequest.applicant_email}</p>
                      </div>
                    )}

                    {trackedRequest.status === "completed" && trackedRequest.generated_document_url && (
                      <Button
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold"
                        onClick={() => window.open(trackedRequest.generated_document_url, "_blank")}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" /> Download Your Document
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStep("select");
                    setSelectedDept(null);
                    setSelectedTemplate(null);
                    setTrackingToken("");
                    setFormData({});
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  Submit Another Application
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}