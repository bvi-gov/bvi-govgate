import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { 
  Building2, Shield, LayoutDashboard, Users, FileText, 
  Settings, Bell, LogOut, Menu, X, ChevronDown, Zap,
  Lock, Globe, CreditCard, BarChart3, FolderKey
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const MASTER_ADMINS = ["admin@zeitgeistbusiness.com", "comandomorillo2020@gmail.com"];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMaster, setIsMaster] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setIsMaster(MASTER_ADMINS.includes(currentUser?.email));
      } catch (e) {
        console.log("Not authenticated");
      }
    };
    loadUser();
  }, []);

  const masterNavItems = [
    { name: "Bunker", icon: Shield, page: "Bunker" },
    { name: "Deploy Department", icon: Zap, page: "DeployDepartment" },
    { name: "All Departments", icon: Building2, page: "Departments" },
    { name: "Subscriptions", icon: CreditCard, page: "Subscriptions" },
    { name: "System Health", icon: BarChart3, page: "SystemHealth" },
    { name: "Audit Logs", icon: FolderKey, page: "AuditLogs" },
    { name: "Settings", icon: Settings, page: "Settings" },
  ];

  const tenantNavItems = [
    { name: "Dashboard", icon: LayoutDashboard, page: "TenantDashboard" },
    { name: "Workstation", icon: Zap, page: "OperatorWorkstation" },
    { name: "Requests", icon: FileText, page: "ServiceRequests" },
    { name: "Documents", icon: FileText, page: "Documents" },
    { name: "Team", icon: Users, page: "Team" },
    { name: "Settings", icon: Settings, page: "TenantSettings" },
  ];

  const navItems = isMaster ? masterNavItems : tenantNavItems;

  if (currentPageName === "Login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <style>{`
        :root {
          --navy-900: #0a1628;
          --navy-800: #0f2140;
          --navy-700: #152a4e;
          --navy-600: #1e3a5f;
          --gold-500: #d4af37;
          --gold-400: #e6c453;
          --gold-300: #f0d77a;
        }
      `}</style>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a1628] border-b border-[#1e3a5f] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-400 hover:text-white hover:bg-[#152a4e]"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#b8941f] flex items-center justify-center">
                <Shield className="h-4 w-4 text-[#0a1628]" />
              </div>
              <span className="font-semibold text-white tracking-tight">BVI Digital Tower</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 h-screen w-64 bg-[#0a1628] border-r border-[#1e3a5f] transition-transform lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-[#1e3a5f]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#b8941f] flex items-center justify-center shadow-lg shadow-[#d4af37]/20">
            <Shield className="h-5 w-5 text-[#0a1628]" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight">BVI Digital</h1>
            <p className="text-xs text-[#d4af37] font-medium">TOWER SYSTEM</p>
          </div>
        </div>

        {/* Master Badge */}
        {isMaster && (
          <div className="mx-4 mt-4 px-3 py-2 rounded-lg bg-gradient-to-r from-[#d4af37]/10 to-transparent border border-[#d4af37]/30">
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-[#d4af37]" />
              <span className="text-xs font-semibold text-[#d4af37] tracking-wide">LANDLORD MASTER</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="mt-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive 
                    ? "bg-gradient-to-r from-[#d4af37]/20 to-transparent text-[#d4af37] border-l-2 border-[#d4af37]" 
                    : "text-slate-400 hover:text-white hover:bg-[#152a4e]"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive && "text-[#d4af37]")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#1e3a5f]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#152a4e] transition-colors">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#152a4e] to-[#0f2140] flex items-center justify-center border border-[#1e3a5f]">
                  <span className="text-sm font-semibold text-[#d4af37]">
                    {user?.full_name?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white truncate">{user?.full_name || "User"}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#0f2140] border-[#1e3a5f]">
              <DropdownMenuItem className="text-slate-300 focus:bg-[#152a4e] focus:text-white">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#1e3a5f]" />
              <DropdownMenuItem 
                className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                onClick={() => base44.auth.logout()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "min-h-screen bg-slate-950 transition-all",
        "lg:ml-64 pt-16 lg:pt-0"
      )}>
        {children}
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}