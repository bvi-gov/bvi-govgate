import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { 
  FileText, Clock, CheckCircle, AlertTriangle, Plus,
  TrendingUp, Calendar, ArrowRight, Users, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/bunker/StatsCard";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function TenantDashboard() {
  const [user, setUser] = useState(null);
  const [department, setDepartment] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Find user's department
      const deptUsers = await base44.entities.DepartmentUser.filter({ user_email: currentUser.email });
      if (deptUsers.length > 0) {
        const depts = await base44.entities.Department.filter({ id: deptUsers[0].department_id });
        if (depts.length > 0) setDepartment(depts[0]);
      }
    };
    loadData();
  }, []);

  const { data: requests = [] } = useQuery({
    queryKey: ["my-requests", department?.id],
    queryFn: () => department ? base44.entities.ServiceRequest.filter({ department_id: department.id }) : [],
    enabled: !!department,
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    processing: requests.filter(r => r.status === "processing").length,
    completed: requests.filter(r => r.status === "completed").length,
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.full_name?.split(" ")[0] || "Operator"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {department?.name || "Loading department..."} • Dashboard Overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <StatsCard 
            title="Total Requests" 
            value={stats.total} 
            subtitle="All time"
            icon={FileText}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatsCard 
            title="Pending" 
            value={stats.pending} 
            subtitle="Awaiting review"
            icon={Clock}
            variant="warning"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatsCard 
            title="Processing" 
            value={stats.processing} 
            subtitle="In progress"
            icon={Activity}
            variant="gold"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <StatsCard 
            title="Completed" 
            value={stats.completed} 
            subtitle="This month"
            icon={CheckCircle}
            variant="success"
          />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to={createPageUrl("ServiceRequests") + "?new=true"}>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-5 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 border border-[#d4af37]/30 cursor-pointer"
            >
              <Plus className="h-8 w-8 text-[#d4af37] mb-3" />
              <h3 className="font-semibold text-white">New Request</h3>
              <p className="text-sm text-slate-400 mt-1">Create a new service request</p>
            </motion.div>
          </Link>
          <Link to={createPageUrl("ServiceRequests")}>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-5 rounded-xl bg-gradient-to-br from-[#152a4e] to-[#0f2140] border border-[#1e3a5f] cursor-pointer"
            >
              <FileText className="h-8 w-8 text-slate-400 mb-3" />
              <h3 className="font-semibold text-white">View All Requests</h3>
              <p className="text-sm text-slate-400 mt-1">Manage existing requests</p>
            </motion.div>
          </Link>
          <Link to={createPageUrl("Documents")}>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-5 rounded-xl bg-gradient-to-br from-[#152a4e] to-[#0f2140] border border-[#1e3a5f] cursor-pointer"
            >
              <Calendar className="h-8 w-8 text-slate-400 mb-3" />
              <h3 className="font-semibold text-white">Documents</h3>
              <p className="text-sm text-slate-400 mt-1">Upload and manage documents</p>
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Recent Requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Requests</h2>
          <Link to={createPageUrl("ServiceRequests")} className="text-sm text-[#d4af37] hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-xl border border-[#1e3a5f] overflow-hidden">
          {requests.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto h-10 w-10 text-slate-600 mb-3" />
              <p className="text-slate-400">No requests yet</p>
              <p className="text-sm text-slate-500 mt-1">Create your first service request to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1e3a5f]">
              {requests.slice(0, 5).map((request, idx) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 hover:bg-[#152a4e]/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#152a4e] flex items-center justify-center">
                        <FileText className="h-5 w-5 text-slate-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{request.reference_number || "REQ-" + request.id?.slice(0, 8)}</span>
                          <span className={cn("text-xs", priorityColors[request.priority])}>
                            {request.priority?.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">{request.request_type} • {request.applicant_name}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("border", statusColors[request.status])}>
                      {request.status?.toUpperCase()}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}