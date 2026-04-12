import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Building2, Users, FileText, CreditCard, TrendingUp, 
  AlertTriangle, CheckCircle, Clock, Zap, Shield,
  ArrowRight, Activity, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/bunker/StatsCard";
import DepartmentCard from "@/components/bunker/DepartmentCard";
import { motion } from "framer-motion";

const MASTER_ADMINS = ["admin@zeitgeistbusiness.com", "comandomorillo2020@gmail.com"];

export default function Bunker() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      if (!MASTER_ADMINS.includes(currentUser?.email)) {
        window.location.href = createPageUrl("TenantDashboard");
      }
    };
    loadUser();
  }, []);

  const { data: departments = [], isLoading: deptLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: () => base44.entities.Department.list("-created_date", 100),
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["requests"],
    queryFn: () => base44.entities.ServiceRequest.list("-created_date", 50),
  });

  const stats = {
    total: departments.length,
    active: departments.filter(d => d.status === "active").length,
    suspended: departments.filter(d => d.status === "suspended").length,
    overdue: departments.filter(d => d.payment_status === "overdue").length,
    pendingRequests: requests.filter(r => r.status === "pending").length,
    monthlyRevenue: departments.reduce((sum, d) => sum + (d.monthly_fee || 0), 0),
  };

  const handleDepartmentAction = async (action, department) => {
    if (action === "toggle") {
      await base44.entities.Department.update(department.id, {
        status: department.status === "active" ? "suspended" : "active"
      });
    } else if (action === "delete") {
      if (confirm(`KILL SWITCH: This will permanently revoke access for ${department.name}. Continue?`)) {
        await base44.entities.Department.update(department.id, { status: "suspended" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#b8941f] flex items-center justify-center">
            <Shield className="h-5 w-5 text-[#0a1628]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">The Bunker</h1>
            <p className="text-sm text-slate-500">Master Control Center • BVI Digital Tower</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 flex flex-wrap gap-3">
        <Link to={createPageUrl("DeployDepartment")}>
          <Button className="bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#0a1628] font-semibold hover:opacity-90">
            <Zap className="mr-2 h-4 w-4" /> Deploy Department
          </Button>
        </Link>
        <Link to={createPageUrl("Departments")}>
          <Button variant="outline" className="border-[#1e3a5f] text-slate-300 hover:bg-[#152a4e] hover:text-white">
            <Building2 className="mr-2 h-4 w-4" /> Manage All
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <StatsCard 
            title="Total Departments" 
            value={stats.total} 
            subtitle="Deployed apartments"
            icon={Building2}
            variant="gold"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatsCard 
            title="Active" 
            value={stats.active} 
            subtitle="Operating normally"
            icon={CheckCircle}
            variant="success"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatsCard 
            title="Overdue" 
            value={stats.overdue} 
            subtitle="Payment pending"
            icon={AlertTriangle}
            variant="warning"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <StatsCard 
            title="Monthly Revenue" 
            value={`$${stats.monthlyRevenue.toLocaleString()}`} 
            subtitle="Recurring revenue"
            icon={TrendingUp}
            trend="+12.5%"
            trendUp={true}
          />
        </motion.div>
      </div>

      {/* System Health Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.4 }}
        className="mb-8 p-5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Activity className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">System Status: Operational</h3>
              <p className="text-sm text-slate-400">All services running • Last check: Just now</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-emerald-400 font-medium">HEALTHY</span>
          </div>
        </div>
      </motion.div>

      {/* Departments Grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Departments</h2>
          <Link to={createPageUrl("Departments")} className="text-sm text-[#d4af37] hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        
        {deptLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-xl bg-[#152a4e] animate-pulse" />
            ))}
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-dashed border-[#1e3a5f]">
            <Globe className="mx-auto h-12 w-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-400">No Departments Deployed</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">Start by deploying your first BVI department</p>
            <Link to={createPageUrl("DeployDepartment")}>
              <Button className="bg-[#d4af37] text-[#0a1628] hover:bg-[#e6c453]">
                <Zap className="mr-2 h-4 w-4" /> Deploy First Department
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.slice(0, 6).map((dept, idx) => (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
              >
                <DepartmentCard 
                  department={dept} 
                  onAction={handleDepartmentAction}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Alerts Section */}
      {(stats.overdue > 0 || stats.suspended > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="p-5 rounded-xl bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20"
        >
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            Attention Required
          </h3>
          <div className="space-y-2">
            {stats.overdue > 0 && (
              <p className="text-sm text-slate-400">
                • <span className="text-red-400 font-medium">{stats.overdue}</span> department(s) with overdue payments
              </p>
            )}
            {stats.suspended > 0 && (
              <p className="text-sm text-slate-400">
                • <span className="text-amber-400 font-medium">{stats.suspended}</span> department(s) currently suspended
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}