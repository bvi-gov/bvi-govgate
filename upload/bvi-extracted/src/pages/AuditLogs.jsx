import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import {
  Shield, Search, Filter, Download, RefreshCw, 
  User, Clock, AlertTriangle, Info, AlertCircle
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
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";

const MASTER_ADMINS = ["admin@zeitgeistbusiness.com", "comandomorillo2020@gmail.com"];

export default function AuditLogs() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  useEffect(() => {
    const checkAccess = async () => {
      const user = await base44.auth.me();
      if (!MASTER_ADMINS.includes(user?.email)) {
        window.location.href = createPageUrl("TenantDashboard");
      }
    };
    checkAccess();
  }, []);

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => base44.entities.AuditLog.list("-created_date", 100),
  });

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      log.description?.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_type?.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesSeverity && matchesAction;
  });

  const severityColors = {
    info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const severityIcons = {
    info: Info,
    warning: AlertTriangle,
    critical: AlertCircle,
  };

  const actionColors = {
    login: "text-blue-400",
    logout: "text-slate-400",
    create: "text-emerald-400",
    update: "text-amber-400",
    delete: "text-red-400",
    deploy: "text-[#d4af37]",
    suspend: "text-orange-400",
    activate: "text-emerald-400",
    view: "text-slate-400",
    export: "text-purple-400",
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-sm text-slate-500">Security & compliance tracking • BVI Digital Tower</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            className="border-[#1e3a5f] text-slate-400 hover:bg-[#152a4e] hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="border-[#1e3a5f] text-slate-300 hover:bg-[#152a4e]"
          >
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#0f2140] border-[#1e3a5f] text-white placeholder:text-slate-600"
          />
        </div>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[150px] bg-[#0f2140] border-[#1e3a5f] text-white">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent className="bg-[#0f2140] border-[#1e3a5f]">
            <SelectItem value="all" className="text-white focus:bg-[#152a4e]">All Severity</SelectItem>
            <SelectItem value="info" className="text-white focus:bg-[#152a4e]">Info</SelectItem>
            <SelectItem value="warning" className="text-white focus:bg-[#152a4e]">Warning</SelectItem>
            <SelectItem value="critical" className="text-white focus:bg-[#152a4e]">Critical</SelectItem>
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[150px] bg-[#0f2140] border-[#1e3a5f] text-white">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent className="bg-[#0f2140] border-[#1e3a5f]">
            <SelectItem value="all" className="text-white focus:bg-[#152a4e]">All Actions</SelectItem>
            <SelectItem value="login" className="text-white focus:bg-[#152a4e]">Login</SelectItem>
            <SelectItem value="create" className="text-white focus:bg-[#152a4e]">Create</SelectItem>
            <SelectItem value="update" className="text-white focus:bg-[#152a4e]">Update</SelectItem>
            <SelectItem value="delete" className="text-white focus:bg-[#152a4e]">Delete</SelectItem>
            <SelectItem value="deploy" className="text-white focus:bg-[#152a4e]">Deploy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs List */}
      <div className="rounded-xl border border-[#1e3a5f] overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-[#152a4e] rounded mb-3 animate-pulse" />
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="mx-auto h-10 w-10 text-slate-600 mb-3" />
            <p className="text-slate-400">No audit logs found</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1e3a5f]">
            {filteredLogs.map((log, idx) => {
              const SeverityIcon = severityIcons[log.severity] || Info;
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="p-4 hover:bg-[#152a4e]/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                      log.severity === "critical" ? "bg-red-500/20" :
                      log.severity === "warning" ? "bg-amber-500/20" : "bg-[#152a4e]"
                    )}>
                      <SeverityIcon className={cn(
                        "h-5 w-5",
                        log.severity === "critical" ? "text-red-400" :
                        log.severity === "warning" ? "text-amber-400" : "text-slate-400"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("font-medium text-sm", actionColors[log.action])}>
                          {log.action?.toUpperCase()}
                        </span>
                        {log.entity_type && (
                          <span className="text-slate-500 text-sm">on {log.entity_type}</span>
                        )}
                        <Badge variant="outline" className={cn("border text-xs", severityColors[log.severity])}>
                          {log.severity?.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-white mt-1">{log.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.user_email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {log.created_date && format(new Date(log.created_date), "MMM d, yyyy HH:mm")}
                        </span>
                        {log.ip_address && (
                          <span>IP: {log.ip_address}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
        <span>Showing {filteredLogs.length} of {logs.length} logs</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            Info: {logs.filter(l => l.severity === "info").length}
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            Warning: {logs.filter(l => l.severity === "warning").length}
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            Critical: {logs.filter(l => l.severity === "critical").length}
          </span>
        </div>
      </div>
    </div>
  );
}