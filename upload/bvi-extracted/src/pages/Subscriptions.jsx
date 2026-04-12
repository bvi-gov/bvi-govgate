import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import {
  CreditCard, Search, Filter, TrendingUp, DollarSign,
  Calendar, Building2, CheckCircle, AlertTriangle, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatsCard from "@/components/bunker/StatsCard";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";

const MASTER_ADMINS = ["admin@zeitgeistbusiness.com", "comandomorillo2020@gmail.com"];

export default function Subscriptions() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const checkAccess = async () => {
      const user = await base44.auth.me();
      if (!MASTER_ADMINS.includes(user?.email)) {
        window.location.href = createPageUrl("TenantDashboard");
      }
    };
    checkAccess();
  }, []);

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: () => base44.entities.Department.list("-created_date"),
  });

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || dept.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalMRR: departments.reduce((sum, d) => sum + (d.status === "active" ? d.monthly_fee || 0 : 0), 0),
    totalARR: departments.reduce((sum, d) => sum + (d.status === "active" ? (d.monthly_fee || 0) * 12 : 0), 0),
    activeSubscriptions: departments.filter(d => d.status === "active").length,
    overduePayments: departments.filter(d => d.payment_status === "overdue").length,
  };

  const tierColors = {
    basic: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    standard: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    premium: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    enterprise: "bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/30",
  };

  const paymentStatusColors = {
    current: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    overdue: "bg-red-500/20 text-red-400 border-red-500/30",
    suspended: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Subscriptions & Billing</h1>
        <p className="text-sm text-slate-500">Revenue management • BVI Digital Tower</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <StatsCard 
            title="Monthly Recurring Revenue" 
            value={`$${stats.totalMRR.toLocaleString()}`} 
            subtitle="Active subscriptions"
            icon={DollarSign}
            variant="gold"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatsCard 
            title="Annual Recurring Revenue" 
            value={`$${stats.totalARR.toLocaleString()}`} 
            subtitle="Projected yearly"
            icon={TrendingUp}
            variant="success"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatsCard 
            title="Active Subscriptions" 
            value={stats.activeSubscriptions} 
            subtitle="Currently active"
            icon={CheckCircle}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <StatsCard 
            title="Overdue Payments" 
            value={stats.overduePayments} 
            subtitle="Require attention"
            icon={AlertTriangle}
            variant={stats.overduePayments > 0 ? "danger" : "default"}
          />
        </motion.div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#0f2140] border-[#1e3a5f] text-white placeholder:text-slate-600"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-[#0f2140] border-[#1e3a5f] text-white">
            <Filter className="mr-2 h-4 w-4 text-slate-500" />
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#0f2140] border-[#1e3a5f]">
            <SelectItem value="all" className="text-white focus:bg-[#152a4e]">All Status</SelectItem>
            <SelectItem value="current" className="text-white focus:bg-[#152a4e]">Current</SelectItem>
            <SelectItem value="overdue" className="text-white focus:bg-[#152a4e]">Overdue</SelectItem>
            <SelectItem value="suspended" className="text-white focus:bg-[#152a4e]">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Subscriptions List */}
      <div className="rounded-xl border border-[#1e3a5f] overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-[#152a4e] rounded mb-3 animate-pulse" />
            ))}
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="mx-auto h-10 w-10 text-slate-600 mb-3" />
            <p className="text-slate-400">No subscriptions found</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1e3a5f]">
            {filteredDepartments.map((dept, idx) => (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-5 hover:bg-[#152a4e]/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#152a4e] flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-[#d4af37]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{dept.name}</h3>
                      <p className="text-sm text-slate-500">{dept.owner_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-white">
                        {dept.currency || "USD"} {dept.monthly_fee?.toLocaleString() || "0"}
                      </p>
                      <p className="text-xs text-slate-500">per month</p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant="outline" className={cn("border", tierColors[dept.tier])}>
                        {dept.tier?.toUpperCase() || "STANDARD"}
                      </Badge>
                      <Badge variant="outline" className={cn("border", paymentStatusColors[dept.payment_status || "current"])}>
                        {(dept.payment_status || "current").toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#1e3a5f]/50 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-6 text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Started: {dept.subscription_start ? format(new Date(dept.subscription_start), "MMM d, yyyy") : "—"}
                    </span>
                    {dept.last_payment_date && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Last Payment: {format(new Date(dept.last_payment_date), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                  {dept.payment_status === "overdue" && (
                    <Button size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30">
                      Send Reminder
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}