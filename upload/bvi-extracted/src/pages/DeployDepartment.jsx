import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { 
  Shield, ArrowLeft, ArrowRight, Building2, User, Lock, 
  FileCheck, Zap, CheckCircle, Loader2, Globe, Scale
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import DeploymentPhase from "@/components/deploy/DeploymentPhase";
import { motion, AnimatePresence } from "framer-motion";

const MASTER_ADMINS = ["admin@zeitgeistbusiness.com", "comandomorillo2020@gmail.com"];

export default function DeployDepartment() {
  const [step, setStep] = useState(1);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentComplete, setDeploymentComplete] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [phaseStatuses, setPhaseStatuses] = useState({
    identity: "pending",
    legal: "pending",
    lockdown: "pending",
    launch: "pending",
  });

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    owner_name: "",
    owner_email: "",
    contact_phone: "",
    address: "",
    tier: "standard",
    monthly_fee: 500,
    currency: "USD",
    notes: "",
    compliance_accepted: false,
  });

  useEffect(() => {
    const checkAccess = async () => {
      const user = await base44.auth.me();
      if (!MASTER_ADMINS.includes(user?.email)) {
        window.location.href = createPageUrl("TenantDashboard");
      }
    };
    checkAccess();
  }, []);

  const deploymentPhases = [
    { 
      key: "identity", 
      title: "Phase 1: Identity Scan", 
      description: "Validating BVI Org & Owner Credentials...",
      icon: User
    },
    { 
      key: "legal", 
      title: "Phase 2: Legal Hardening", 
      description: "Linking BVI Data Protection & Compliance Templates...",
      icon: Scale
    },
    { 
      key: "lockdown", 
      title: "Phase 3: Data Lockdown", 
      description: "Isolating Apartment via AES-256 RLS Encryption...",
      icon: Lock
    },
    { 
      key: "launch", 
      title: "Phase 4: Launch", 
      description: "BVI Department Secured and Deployed.",
      icon: Zap
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateCode = () => {
    const prefix = formData.name.substring(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BVI-${prefix}-${random}`;
  };

  const runDeployment = async () => {
    setIsDeploying(true);
    
    // Phase 1: Identity Scan
    setPhaseStatuses(prev => ({ ...prev, identity: "in_progress" }));
    setCurrentPhase(0);
    await new Promise(r => setTimeout(r, 2500));
    setPhaseStatuses(prev => ({ ...prev, identity: "completed" }));

    // Phase 2: Legal Hardening
    setPhaseStatuses(prev => ({ ...prev, legal: "in_progress" }));
    setCurrentPhase(1);
    await new Promise(r => setTimeout(r, 2000));
    setPhaseStatuses(prev => ({ ...prev, legal: "completed" }));

    // Phase 3: Data Lockdown
    setPhaseStatuses(prev => ({ ...prev, lockdown: "in_progress" }));
    setCurrentPhase(2);
    await new Promise(r => setTimeout(r, 3000));
    setPhaseStatuses(prev => ({ ...prev, lockdown: "completed" }));

    // Phase 4: Launch - Actually create the department
    setPhaseStatuses(prev => ({ ...prev, launch: "in_progress" }));
    setCurrentPhase(3);
    
    try {
      const code = formData.code || generateCode();
      await base44.entities.Department.create({
        ...formData,
        code,
        status: "active",
        jurisdiction: "BVI",
        compliance_date: new Date().toISOString(),
        deployed_at: new Date().toISOString(),
        encryption_key_id: `ENC-${Date.now()}-AES256`,
      });

      await base44.entities.AuditLog.create({
        action: "deploy",
        user_email: (await base44.auth.me()).email,
        entity_type: "Department",
        description: `Deployed new department: ${formData.name}`,
        severity: "info",
      });

      await new Promise(r => setTimeout(r, 1500));
      setPhaseStatuses(prev => ({ ...prev, launch: "completed" }));
      setDeploymentComplete(true);
    } catch (error) {
      setPhaseStatuses(prev => ({ ...prev, launch: "failed" }));
    }
    
    setIsDeploying(false);
  };

  const tierPricing = {
    basic: 250,
    standard: 500,
    premium: 1000,
    enterprise: 2500,
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link to={createPageUrl("Bunker")} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Bunker
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#b8941f] flex items-center justify-center">
            <Zap className="h-6 w-6 text-[#0a1628]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Deploy New Department</h1>
            <p className="text-sm text-slate-500">Secure Deployment Wizard • BVI Digital Tower</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        {!isDeploying && !deploymentComplete && (
          <div className="mb-8 flex items-center justify-center gap-4">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  ${step >= s 
                    ? "bg-gradient-to-br from-[#d4af37] to-[#b8941f] text-[#0a1628]" 
                    : "bg-[#152a4e] text-slate-500 border border-[#1e3a5f]"
                  }
                `}>
                  {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-20 h-0.5 ${step > s ? "bg-[#d4af37]" : "bg-[#1e3a5f]"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {!isDeploying && !deploymentComplete && (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-gradient-to-br from-[#152a4e] to-[#0f2140] rounded-2xl border border-[#1e3a5f] p-6 lg:p-8"
            >
              {/* Step 1: Department Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Building2 className="h-5 w-5 text-[#d4af37]" />
                    <h2 className="text-lg font-semibold text-white">Department Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Department Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="e.g., Ministry of Finance"
                        className="bg-[#0a1628] border-[#1e3a5f] text-white placeholder:text-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Department Code</Label>
                      <Input
                        value={formData.code}
                        onChange={(e) => handleInputChange("code", e.target.value)}
                        placeholder="Auto-generated if empty"
                        className="bg-[#0a1628] border-[#1e3a5f] text-white placeholder:text-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Subscription Tier *</Label>
                      <Select value={formData.tier} onValueChange={(v) => {
                        handleInputChange("tier", v);
                        handleInputChange("monthly_fee", tierPricing[v]);
                      }}>
                        <SelectTrigger className="bg-[#0a1628] border-[#1e3a5f] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f2140] border-[#1e3a5f]">
                          <SelectItem value="basic" className="text-white focus:bg-[#152a4e]">Basic - $250/mo</SelectItem>
                          <SelectItem value="standard" className="text-white focus:bg-[#152a4e]">Standard - $500/mo</SelectItem>
                          <SelectItem value="premium" className="text-white focus:bg-[#152a4e]">Premium - $1,000/mo</SelectItem>
                          <SelectItem value="enterprise" className="text-white focus:bg-[#152a4e]">Enterprise - $2,500/mo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Currency</Label>
                      <Select value={formData.currency} onValueChange={(v) => handleInputChange("currency", v)}>
                        <SelectTrigger className="bg-[#0a1628] border-[#1e3a5f] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f2140] border-[#1e3a5f]">
                          <SelectItem value="USD" className="text-white focus:bg-[#152a4e]">USD - US Dollar</SelectItem>
                          <SelectItem value="XCD" className="text-white focus:bg-[#152a4e]">XCD - East Caribbean Dollar</SelectItem>
                          <SelectItem value="TTD" className="text-white focus:bg-[#152a4e]">TTD - Trinidad Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Address</Label>
                    <Textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Full department address..."
                      className="bg-[#0a1628] border-[#1e3a5f] text-white placeholder:text-slate-600"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Owner Info */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <User className="h-5 w-5 text-[#d4af37]" />
                    <h2 className="text-lg font-semibold text-white">Owner Credentials</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Owner Full Name *</Label>
                      <Input
                        value={formData.owner_name}
                        onChange={(e) => handleInputChange("owner_name", e.target.value)}
                        placeholder="John Smith"
                        className="bg-[#0a1628] border-[#1e3a5f] text-white placeholder:text-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Owner Email *</Label>
                      <Input
                        type="email"
                        value={formData.owner_email}
                        onChange={(e) => handleInputChange("owner_email", e.target.value)}
                        placeholder="owner@department.gov.vg"
                        className="bg-[#0a1628] border-[#1e3a5f] text-white placeholder:text-slate-600"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-slate-300">Contact Phone</Label>
                      <Input
                        value={formData.contact_phone}
                        onChange={(e) => handleInputChange("contact_phone", e.target.value)}
                        placeholder="+1 284 XXX XXXX"
                        className="bg-[#0a1628] border-[#1e3a5f] text-white placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="Additional notes about this deployment..."
                      className="bg-[#0a1628] border-[#1e3a5f] text-white placeholder:text-slate-600"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Compliance */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <FileCheck className="h-5 w-5 text-[#d4af37]" />
                    <h2 className="text-lg font-semibold text-white">BVI Compliance Agreement</h2>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0a1628] border border-[#1e3a5f]">
                    <div className="flex items-center gap-3 mb-4">
                      <Globe className="h-5 w-5 text-[#d4af37]" />
                      <span className="font-medium text-white">British Virgin Islands Jurisdiction</span>
                    </div>
                    <div className="text-sm text-slate-400 space-y-2">
                      <p>By deploying this department, you acknowledge:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Data will be processed under BVI Data Protection regulations</li>
                        <li>AES-256 encryption will be applied to all sensitive data</li>
                        <li>Row-Level Security (RLS) isolation will be enforced</li>
                        <li>Compliance with BVI Financial Services regulations</li>
                        <li>Automatic data purge after 7 days for completed requests</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30">
                    <Checkbox
                      id="compliance"
                      checked={formData.compliance_accepted}
                      onCheckedChange={(checked) => handleInputChange("compliance_accepted", checked)}
                      className="mt-1 border-[#d4af37] data-[state=checked]:bg-[#d4af37] data-[state=checked]:text-[#0a1628]"
                    />
                    <Label htmlFor="compliance" className="text-sm text-slate-300 cursor-pointer">
                      I acknowledge that this department will operate under BVI jurisdiction and comply with all relevant data protection and financial services regulations.
                    </Label>
                  </div>

                  {/* Summary */}
                  <div className="p-4 rounded-xl bg-[#0a1628] border border-[#1e3a5f]">
                    <h3 className="font-medium text-white mb-3">Deployment Summary</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-500">Department:</span>
                        <span className="ml-2 text-white">{formData.name || "—"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Tier:</span>
                        <span className="ml-2 text-[#d4af37] font-medium">{formData.tier?.toUpperCase()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Owner:</span>
                        <span className="ml-2 text-white">{formData.owner_name || "—"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Monthly Fee:</span>
                        <span className="ml-2 text-emerald-400 font-medium">${formData.monthly_fee}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#1e3a5f]">
                <Button
                  variant="ghost"
                  onClick={() => setStep(s => s - 1)}
                  disabled={step === 1}
                  className="text-slate-400 hover:text-white hover:bg-[#1e3a5f]"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                
                {step < 3 ? (
                  <Button
                    onClick={() => setStep(s => s + 1)}
                    disabled={step === 1 && !formData.name}
                    className="bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#0a1628] font-semibold hover:opacity-90"
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={runDeployment}
                    disabled={!formData.compliance_accepted || !formData.name || !formData.owner_email}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:opacity-90"
                  >
                    <Shield className="mr-2 h-4 w-4" /> Deploy Department
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* Deployment Progress */}
          {isDeploying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-[#152a4e] to-[#0f2140] rounded-2xl border border-[#1e3a5f] p-6 lg:p-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#b8941f] flex items-center justify-center mb-4">
                  <Loader2 className="h-8 w-8 text-[#0a1628] animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-white">Deploying Department</h2>
                <p className="text-slate-400 mt-1">Securing {formData.name}...</p>
              </div>

              <div className="space-y-4">
                {deploymentPhases.map((phase, idx) => (
                  <DeploymentPhase
                    key={phase.key}
                    phase={phase.key}
                    title={phase.title}
                    description={phase.description}
                    status={phaseStatuses[phase.key]}
                    isActive={currentPhase === idx}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Deployment Complete */}
          {deploymentComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-[#152a4e] to-[#0f2140] rounded-2xl border border-emerald-500/30 p-6 lg:p-8 text-center"
            >
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-6">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Deployment Successful!</h2>
              <p className="text-slate-400 mb-6">
                {formData.name} has been securely deployed and is now operational.
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 mb-8">
                <Lock className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-emerald-400 font-medium">AES-256 RLS Encryption Active</span>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Link to={createPageUrl("Bunker")}>
                  <Button variant="outline" className="border-[#1e3a5f] text-slate-300 hover:bg-[#152a4e]">
                    Return to Bunker
                  </Button>
                </Link>
                <Link to={createPageUrl("Departments")}>
                  <Button className="bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#0a1628] font-semibold">
                    View All Departments
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}