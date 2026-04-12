import React from "react";
import { Building2, MoreVertical, Power, Trash2, Edit, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function DepartmentCard({ department, onAction }) {
  const statusColors = {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    suspended: "bg-red-500/20 text-red-400 border-red-500/30",
    pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    overdue: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  };

  const paymentColors = {
    current: "text-emerald-400",
    overdue: "text-red-400",
    suspended: "text-slate-500",
  };

  return (
    <div className="group relative rounded-xl bg-gradient-to-br from-[#152a4e] to-[#0f2140] border border-[#1e3a5f] p-5 hover:border-[#d4af37]/30 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#152a4e] flex items-center justify-center border border-[#2a4a70]">
            {department.logo_url ? (
              <img src={department.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <Building2 className="h-5 w-5 text-[#d4af37]" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white">{department.name}</h3>
            <p className="text-xs text-slate-500">Code: {department.code}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white hover:bg-[#1e3a5f]">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#0f2140] border-[#1e3a5f]">
            <DropdownMenuItem 
              className="text-slate-300 focus:bg-[#152a4e] focus:text-white"
              onClick={() => onAction("view", department)}
            >
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-slate-300 focus:bg-[#152a4e] focus:text-white"
              onClick={() => onAction("edit", department)}
            >
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#1e3a5f]" />
            <DropdownMenuItem 
              className={cn(
                "focus:bg-[#152a4e]",
                department.status === "active" ? "text-amber-400" : "text-emerald-400"
              )}
              onClick={() => onAction("toggle", department)}
            >
              <Power className="mr-2 h-4 w-4" />
              {department.status === "active" ? "Suspend" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-400 focus:bg-red-500/10"
              onClick={() => onAction("delete", department)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Kill Switch
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Badge variant="outline" className={cn("text-xs border", statusColors[department.status])}>
          {department.status?.toUpperCase()}
        </Badge>
        <Badge variant="outline" className="text-xs border-[#1e3a5f] text-slate-400">
          {department.tier?.toUpperCase() || "STANDARD"}
        </Badge>
      </div>

      <div className="mt-4 pt-4 border-t border-[#1e3a5f] grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-500">Owner</p>
          <p className="text-sm text-white truncate">{department.owner_name || department.owner_email}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Monthly Fee</p>
          <p className={cn("text-sm font-semibold", paymentColors[department.payment_status || "current"])}>
            {department.currency || "USD"} {department.monthly_fee?.toLocaleString() || "0"}
          </p>
        </div>
      </div>
    </div>
  );
}