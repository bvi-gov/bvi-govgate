import React from "react";
import { Check, Loader2, AlertCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function DeploymentPhase({ phase, title, description, status, isActive }) {
  const statusIcons = {
    pending: <div className="w-4 h-4 rounded-full border-2 border-slate-600" />,
    in_progress: <Loader2 className="w-4 h-4 text-[#d4af37] animate-spin" />,
    completed: <Check className="w-4 h-4 text-emerald-400" />,
    failed: <AlertCircle className="w-4 h-4 text-red-400" />,
  };

  const statusColors = {
    pending: "border-slate-700 bg-slate-800/50",
    in_progress: "border-[#d4af37]/50 bg-[#d4af37]/10",
    completed: "border-emerald-500/50 bg-emerald-500/10",
    failed: "border-red-500/50 bg-red-500/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "relative flex items-start gap-4 p-4 rounded-xl border transition-all",
        statusColors[status],
        isActive && "ring-1 ring-[#d4af37]/30"
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
        status === "in_progress" ? "bg-[#d4af37]/20" : "bg-white/5"
      )}>
        {statusIcons[status]}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={cn(
            "font-semibold",
            status === "completed" ? "text-emerald-400" : 
            status === "in_progress" ? "text-[#d4af37]" : 
            status === "failed" ? "text-red-400" : "text-slate-400"
          )}>
            {title}
          </h4>
          {status === "in_progress" && (
            <span className="text-xs text-[#d4af37] animate-pulse">Processing...</span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
        
        {status === "in_progress" && (
          <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#d4af37] to-[#e6c453]"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "linear" }}
            />
          </div>
        )}
      </div>

      {status === "completed" && (
        <Lock className="w-4 h-4 text-emerald-400/50" />
      )}
    </motion.div>
  );
}