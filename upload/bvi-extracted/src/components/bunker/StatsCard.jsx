import React from "react";
import { cn } from "@/lib/utils";

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, trendUp, variant = "default" }) {
  const variants = {
    default: "from-[#152a4e] to-[#0f2140] border-[#1e3a5f]",
    gold: "from-[#d4af37]/20 to-[#b8941f]/10 border-[#d4af37]/30",
    success: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
    warning: "from-amber-500/20 to-amber-600/10 border-amber-500/30",
    danger: "from-red-500/20 to-red-600/10 border-red-500/30",
  };

  const iconColors = {
    default: "text-slate-400",
    gold: "text-[#d4af37]",
    success: "text-emerald-400",
    warning: "text-amber-400",
    danger: "text-red-400",
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl bg-gradient-to-br border p-5",
      variants[variant]
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              "mt-2 inline-flex items-center text-xs font-medium",
              trendUp ? "text-emerald-400" : "text-red-400"
            )}>
              {trendUp ? "↑" : "↓"} {trend}
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "p-3 rounded-lg bg-white/5",
            iconColors[variant]
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}