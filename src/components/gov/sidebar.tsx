'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  Shield,
  LayoutDashboard,
  Building2,
  FileText,
  Globe,
  MonitorDot,
  FolderOpen,
  Users,
  ScrollText,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'departments', label: 'Departamentos', icon: Building2 },
  { id: 'requests', label: 'Solicitudes', icon: FileText },
  { id: 'citizen-portal', label: 'Portal Ciudadano', icon: Globe },
  { id: 'operator-workstation', label: 'Estación de Operador', icon: MonitorDot },
  { id: 'documents', label: 'Documentos', icon: FolderOpen },
  { id: 'team', label: 'Equipo', icon: Users },
  { id: 'audit', label: 'Auditoría', icon: ScrollText },
  { id: 'monitoring', label: 'Monitoreo', icon: Activity },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { activeSection, setActiveSection, sidebarOpen, toggleSidebar } = useAppStore();

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    onNavigate?.();
  };

  return (
    <div className="flex flex-col h-full bg-[#0a1220] border-r border-[#1e3a5f]">
      {/* Logo Area */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#b8941e] flex items-center justify-center">
          <Shield className="w-6 h-6 text-[#0a1628]" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-gold-gradient truncate">BVI Digital Tower</h1>
            <p className="text-[10px] text-[#8899b4] truncate">Government Portal</p>
          </div>
        )}
      </div>

      <Separator className="bg-[#1e3a5f] mx-3 w-auto" />

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          const btn = (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30'
                  : 'text-[#8899b4] hover:bg-[#152a4e] hover:text-[#e8edf5] border border-transparent'
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-[#d4af37]')} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );

          if (collapsed) {
            return (
              <TooltipProvider key={item.id} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>{btn}</TooltipTrigger>
                  <TooltipContent side="right" className="bg-[#152a4e] text-[#e8edf5] border-[#1e3a5f]">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }

          return btn;
        })}
      </nav>

      {/* Collapse button (desktop only) */}
      {!collapsed && (
        <div className="hidden lg:block px-2 pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="w-full justify-start text-[#8899b4] hover:text-[#e8edf5] hover:bg-[#152a4e]"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Collapse
          </Button>
        </div>
      )}

      {/* User Section */}
      <Separator className="bg-[#1e3a5f] mx-3 w-auto" />
      <div className="p-3">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar className="w-8 h-8 border border-[#d4af37]/50">
            <AvatarFallback className="bg-[#152a4e] text-[#d4af37] text-xs font-bold">AD</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#e8edf5] truncate">Admin User</p>
              <p className="text-[10px] text-[#8899b4] truncate">admin@bvi.gov.vg</p>
            </div>
          )}
          {!collapsed && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-[#8899b4] hover:text-[#f87171]">
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-[#0f2140] border border-[#1e3a5f] text-[#d4af37]"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Sheet */}
      <Sheet open={sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 1024} onOpenChange={(open) => { if (!open) toggleSidebar(); }}>
        <SheetContent side="left" className="p-0 w-64 bg-[#0a1220] border-[#1e3a5f]">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SidebarContent collapsed={false} onNavigate={toggleSidebar} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-shrink-0 flex-col h-screen sticky top-0 transition-all duration-300',
          sidebarOpen ? 'w-60' : 'w-16'
        )}
      >
        <SidebarContent collapsed={!sidebarOpen} />
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute top-3 -right-3 z-10 w-6 h-6 rounded-full bg-[#d4af37] text-[#0a1628] flex items-center justify-center hover:bg-[#e6c453] transition-colors"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </aside>
    </>
  );
}
