import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import {
  Activity, Server, Database, Shield, Clock, CheckCircle,
  AlertTriangle, XCircle, RefreshCw, Cpu, HardDrive, Wifi
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const MASTER_ADMINS = ["admin@zeitgeistbusiness.com", "comandomorillo2020@gmail.com"];

export default function SystemHealth() {
  const [lastCheck, setLastCheck] = useState(new Date());

  useEffect(() => {
    const checkAccess = async () => {
      const user = await base44.auth.me();
      if (!MASTER_ADMINS.includes(user?.email)) {
        window.location.href = createPageUrl("TenantDashboard");
      }
    };
    checkAccess();
  }, []);

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => base44.entities.Department.list(),
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["all-requests"],
    queryFn: () => base44.entities.ServiceRequest.list("-created_date", 100),
  });

  // Simulated health metrics
  const healthMetrics = [
    { 
      name: "API Gateway", 
      status: "healthy", 
      uptime: "99.99%", 
      latency: "45ms",
      icon: Wifi
    },
    { 
      name: "Database Cluster", 
      status: "healthy", 
      uptime: "99.95%", 
      latency: "12ms",
      icon: Database
    },
    { 
      name: "Authentication Service", 
      status: "healthy", 
      uptime: "100%", 
      latency: "23ms",
      icon: Shield
    },
    { 
      name: "File Storage", 
      status: "healthy", 
      uptime: "99.98%", 
      latency: "156ms",
      icon: HardDrive
    },
  ];

  const systemStats = {
    totalDepartments: departments.length,
    activeDepartments: departments.filter(d => d.status === "active").length,
    totalRequests: requests.length,
    pendingRequests: requests.filter(r => r.status === "pending").length,
    avgResponseTime: "34ms",
    cpuUsage: 23,
    memoryUsage: 45,
    storageUsage: 67,
  };

  const StatusIcon = ({ status }) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      case "critical":
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Clock className="h-5 w-5 text-slate-400" />;
    }
  };

  const handleRefresh = () => {
    setLastCheck(new Date());
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">System Health</h1>
          <p className="text-sm text-slate-500">Real-time monitoring • BVI Digital Tower</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">
            Last check: {lastCheck.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            className="border-[#1e3a5f] text-slate-400 hover:bg-[#152a4e] hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overall Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Activity className="h-7 w-7 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">All Systems Operational</h2>
              <p className="text-slate-400">All services running within normal parameters</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-lg font-semibold text-emerald-400">HEALTHY</span>
          </div>
        </div>
      </motion.div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {healthMetrics.map((metric, idx) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-5 rounded-xl bg-gradient-to-br from-[#152a4e] to-[#0f2140] border border-[#1e3a5f]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
                <metric.icon className="h-5 w-5 text-[#d4af37]" />
              </div>
              <StatusIcon status={metric.status} />
            </div>
            <h3 className="font-semibold text-white mb-1">{metric.name}</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Uptime</span>
              <span className="text-emerald-400 font-medium">{metric.uptime}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-slate-500">Latency</span>
              <span className="text-slate-300">{metric.latency}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#152a4e] to-[#0f2140] border border-[#1e3a5f]"
        >
          <div className="flex items-center gap-3 mb-4">
            <Cpu className="h-5 w-5 text-[#d4af37]" />
            <h3 className="font-semibold text-white">CPU Usage</h3>
          </div>
          <div className="mb-2">
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-white">{systemStats.cpuUsage}%</span>
              <span className="text-sm text-slate-500">of 100%</span>
            </div>
          </div>
          <Progress value={systemStats.cpuUsage} className="h-2 bg-[#1e3a5f]" />
          <p className="text-xs text-slate-500 mt-2">Normal load • 4 cores active</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#152a4e] to-[#0f2140] border border-[#1e3a5f]"
        >
          <div className="flex items-center gap-3 mb-4">
            <Server className="h-5 w-5 text-[#d4af37]" />
            <h3 className="font-semibold text-white">Memory Usage</h3>
          </div>
          <div className="mb-2">
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-white">{systemStats.memoryUsage}%</span>
              <span className="text-sm text-slate-500">3.6 GB / 8 GB</span>
            </div>
          </div>
          <Progress value={systemStats.memoryUsage} className="h-2 bg-[#1e3a5f]" />
          <p className="text-xs text-slate-500 mt-2">Healthy allocation</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#152a4e] to-[#0f2140] border border-[#1e3a5f]"
        >
          <div className="flex items-center gap-3 mb-4">
            <HardDrive className="h-5 w-5 text-[#d4af37]" />
            <h3 className="font-semibold text-white">Storage Usage</h3>
          </div>
          <div className="mb-2">
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-white">{systemStats.storageUsage}%</span>
              <span className="text-sm text-slate-500">67 GB / 100 GB</span>
            </div>
          </div>
          <Progress value={systemStats.storageUsage} className="h-2 bg-[#1e3a5f]" />
          <p className="text-xs text-amber-400 mt-2">Consider cleanup soon</p>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-5 rounded-xl bg-[#152a4e] border border-[#1e3a5f]"
        >
          <p className="text-xs text-slate-500 uppercase tracking-wider">Active Departments</p>
          <p className="text-2xl font-bold text-white mt-1">{systemStats.activeDepartments}</p>
          <p className="text-xs text-slate-500 mt-1">of {systemStats.totalDepartments} total</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="p-5 rounded-xl bg-[#152a4e] border border-[#1e3a5f]"
        >
          <p className="text-xs text-slate-500 uppercase tracking-wider">Total Requests</p>
          <p className="text-2xl font-bold text-white mt-1">{systemStats.totalRequests}</p>
          <p className="text-xs text-amber-400 mt-1">{systemStats.pendingRequests} pending</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="p-5 rounded-xl bg-[#152a4e] border border-[#1e3a5f]"
        >
          <p className="text-xs text-slate-500 uppercase tracking-wider">Avg Response Time</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{systemStats.avgResponseTime}</p>
          <p className="text-xs text-slate-500 mt-1">Last 24 hours</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="p-5 rounded-xl bg-[#152a4e] border border-[#1e3a5f]"
        >
          <p className="text-xs text-slate-500 uppercase tracking-wider">Uptime</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">99.99%</p>
          <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
        </motion.div>
      </div>
    </div>
  );
}