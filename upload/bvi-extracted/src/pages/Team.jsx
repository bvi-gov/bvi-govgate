import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, Search, Plus, MoreVertical, Shield, User,
  Mail, Clock, CheckCircle, XCircle, Edit, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Team() {
  const [user, setUser] = useState(null);
  const [department, setDepartment] = useState(null);
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteData, setInviteData] = useState({ email: "", name: "", role: "operator" });
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

  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ["team", department?.id],
    queryFn: () => department ? base44.entities.DepartmentUser.filter({ department_id: department.id }) : [],
    enabled: !!department,
  });

  const inviteMutation = useMutation({
    mutationFn: (data) => base44.entities.DepartmentUser.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["team"]);
      setShowInvite(false);
      setInviteData({ email: "", name: "", role: "operator" });
    },
  });

  const filteredMembers = teamMembers.filter(member =>
    member.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    member.user_email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleInvite = () => {
    if (!department || !inviteData.email) return;
    inviteMutation.mutate({
      department_id: department.id,
      user_email: inviteData.email,
      user_name: inviteData.name,
      role: inviteData.role,
      status: "pending",
    });
  };

  const roleColors = {
    admin: "bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/30",
    supervisor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    operator: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };

  const statusColors = {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    suspended: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Members</h1>
          <p className="text-sm text-slate-500">{department?.name || "Loading..."}</p>
        </div>
        <Button 
          onClick={() => setShowInvite(true)}
          className="bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#0a1628] font-semibold"
        >
          <Plus className="mr-2 h-4 w-4" /> Invite Member
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#0f2140] border-[#1e3a5f] text-white placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Team Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-[#152a4e] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-[#1e3a5f]">
          <Users className="mx-auto h-12 w-12 text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-400">No team members found</h3>
          <p className="text-sm text-slate-500 mt-1">Invite your first team member to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-5 rounded-xl bg-gradient-to-br from-[#152a4e] to-[#0f2140] border border-[#1e3a5f] hover:border-[#d4af37]/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#152a4e] flex items-center justify-center border border-[#2a4a70]">
                    <span className="text-lg font-bold text-[#d4af37]">
                      {member.user_name?.[0]?.toUpperCase() || member.user_email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{member.user_name || "Unnamed"}</h3>
                    <p className="text-sm text-slate-500">{member.user_email}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white hover:bg-[#1e3a5f]">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#0f2140] border-[#1e3a5f]">
                    <DropdownMenuItem className="text-slate-300 focus:bg-[#152a4e] focus:text-white">
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#1e3a5f]" />
                    <DropdownMenuItem className="text-red-400 focus:bg-red-500/10">
                      <Trash2 className="mr-2 h-4 w-4" /> Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="outline" className={cn("border", roleColors[member.role])}>
                  {member.role === "admin" && <Shield className="h-3 w-3 mr-1" />}
                  {member.role?.toUpperCase()}
                </Badge>
                <Badge variant="outline" className={cn("border", statusColors[member.status])}>
                  {member.status?.toUpperCase()}
                </Badge>
              </div>

              <div className="mt-4 pt-4 border-t border-[#1e3a5f]/50 text-xs text-slate-500">
                {member.last_login ? (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last login: {format(new Date(member.last_login), "MMM d, yyyy")}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Invitation pending
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="bg-[#0f2140] border-[#1e3a5f] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Invite Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Email Address *</Label>
              <Input
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData(d => ({ ...d, email: e.target.value }))}
                placeholder="member@example.com"
                className="bg-[#0a1628] border-[#1e3a5f] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Full Name</Label>
              <Input
                value={inviteData.name}
                onChange={(e) => setInviteData(d => ({ ...d, name: e.target.value }))}
                placeholder="John Smith"
                className="bg-[#0a1628] border-[#1e3a5f] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Role</Label>
              <Select 
                value={inviteData.role} 
                onValueChange={(v) => setInviteData(d => ({ ...d, role: v }))}
              >
                <SelectTrigger className="bg-[#0a1628] border-[#1e3a5f] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0f2140] border-[#1e3a5f]">
                  <SelectItem value="operator" className="text-white focus:bg-[#152a4e]">Operator</SelectItem>
                  <SelectItem value="supervisor" className="text-white focus:bg-[#152a4e]">Supervisor</SelectItem>
                  <SelectItem value="admin" className="text-white focus:bg-[#152a4e]">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowInvite(false)}
                className="border-[#1e3a5f] text-slate-300 hover:bg-[#152a4e]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                disabled={!inviteData.email || inviteMutation.isPending}
                className="bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#0a1628] font-semibold"
              >
                Send Invitation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}