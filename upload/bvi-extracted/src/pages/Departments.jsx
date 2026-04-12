import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { 
  Building2, Search, Filter, Plus, MoreVertical, Power, 
  Trash2, Edit, Eye, Download, RefreshCw, AlertTriangle
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const MASTER_ADMINS = ["admin@zeitgeistbusiness.com", "comandomorillo2020@gmail.com"];

export default function Departments() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAccess = async () => {
      const user = await base44.auth.me();
      if (!MASTER_ADMINS.includes(user?.email)) {
        window.location.href = createPageUrl("TenantDashboard");
      }
    };
    checkAccess();
  }, []);

  const { data: departments = [], isLoading, refetch } = useQuery({
    queryKey: ["departments"],
    queryFn: () => base44.entities.Department.list("-created_date", 100),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Department.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(["departments"]),
  });

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(search.toLowerCase()) ||
                          dept.code?.toLowerCase().includes(search.toLowerCase()) ||
                          dept.owner_email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || dept.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    suspended: "bg-red-500/20 text-red-400 border-red-500/30",
    pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    overdue: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  };

  const handleToggleStatus = (dept) => {
    updateMutation.mutate({
      id: dept.id,
      data: { status: dept.status === "active" ? "suspended" : "active" }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">All Departments</h1>
          <p className="text-sm text-slate-500">Manage deployed BVI government departments</p>
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
          <Link to={createPageUrl("DeployDepartment")}>
            <Button className="bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#0a1628] font-semibold">
              <Plus className="mr-2 h-4 w-4" /> Deploy New
            </Button>
          </Link>
        </div>
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
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent className="bg-[#0f2140] border-[#1e3a5f]">
            <SelectItem value="all" className="text-white focus:bg-[#152a4e]">All Status</SelectItem>
            <SelectItem value="active" className="text-white focus:bg-[#152a4e]">Active</SelectItem>
            <SelectItem value="suspended" className="text-white focus:bg-[#152a4e]">Suspended</SelectItem>
            <SelectItem value="pending" className="text-white focus:bg-[#152a4e]">Pending</SelectItem>
            <SelectItem value="overdue" className="text-white focus:bg-[#152a4e]">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#1e3a5f] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[#1e3a5f] hover:bg-transparent">
              <TableHead className="text-slate-400">Department</TableHead>
              <TableHead className="text-slate-400">Code</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-slate-400">Tier</TableHead>
              <TableHead className="text-slate-400">Owner</TableHead>
              <TableHead className="text-slate-400">Monthly Fee</TableHead>
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
            ) : filteredDepartments.length === 0 ? (
              <TableRow className="border-[#1e3a5f]">
                <TableCell colSpan={7} className="text-center py-12">
                  <Building2 className="mx-auto h-10 w-10 text-slate-600 mb-3" />
                  <p className="text-slate-400">No departments found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredDepartments.map((dept, idx) => (
                <motion.tr
                  key={dept.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-[#1e3a5f] hover:bg-[#152a4e]/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#152a4e] flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-[#d4af37]" />
                      </div>
                      <span className="font-medium text-white">{dept.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-400 font-mono text-sm">{dept.code}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("border", statusColors[dept.status])}>
                      {dept.status?.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-[#d4af37] font-medium text-sm">
                      {dept.tier?.toUpperCase() || "STANDARD"}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-300 text-sm">{dept.owner_email}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "font-semibold",
                      dept.payment_status === "overdue" ? "text-red-400" : "text-emerald-400"
                    )}>
                      {dept.currency || "USD"} {dept.monthly_fee?.toLocaleString() || "0"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white hover:bg-[#1e3a5f]">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#0f2140] border-[#1e3a5f]">
                        <DropdownMenuItem className="text-slate-300 focus:bg-[#152a4e] focus:text-white">
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-slate-300 focus:bg-[#152a4e] focus:text-white">
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-[#1e3a5f]" />
                        <DropdownMenuItem 
                          className={cn(
                            "focus:bg-[#152a4e]",
                            dept.status === "active" ? "text-amber-400" : "text-emerald-400"
                          )}
                          onClick={() => handleToggleStatus(dept)}
                        >
                          <Power className="mr-2 h-4 w-4" />
                          {dept.status === "active" ? "Suspend" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 focus:bg-red-500/10">
                          <Trash2 className="mr-2 h-4 w-4" /> Kill Switch
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Stats Footer */}
      <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
        <span>Showing {filteredDepartments.length} of {departments.length} departments</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            Active: {departments.filter(d => d.status === "active").length}
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            Suspended: {departments.filter(d => d.status === "suspended").length}
          </span>
        </div>
      </div>
    </div>
  );
}