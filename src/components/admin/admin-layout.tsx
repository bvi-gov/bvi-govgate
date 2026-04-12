'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Sheet, SheetContent, SheetTrigger, SheetTitle,
} from '@/components/ui/sheet';
import {
  LayoutDashboard,
  ListTodo,
  FileBadge,
  BarChart3,
  ScanLine,
  Upload,
  ShieldCheck,
  LogOut,
  Menu,
  ChevronRight,
  Building2,
  Shield,
  Calculator,
  Briefcase,
  Baby,
  Car,
  Landmark,
  ChevronDown,
  Users,
  Settings,
  Mountain,
} from 'lucide-react';
import { AdminBreadcrumbs } from './admin-breadcrumbs';
import { AdminLogoutModal } from './admin-logout-modal';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const navSections = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', view: 'admin-dashboard' as const, icon: LayoutDashboard },
      { label: 'Application Queue', view: 'admin-queue' as const, icon: ListTodo },
    ],
  },
  {
    title: 'Ministries',
    items: [
      { label: 'Ministry Center', view: 'admin-ministries' as const, icon: Building2 },
      { label: 'Police Force (RVIPF)', view: 'admin-ministry-rvipf' as const, icon: Shield, color: 'text-blue-400', department: 'Royal Virgin Islands Police Force' },
      { label: 'Inland Revenue', view: 'admin-ministry-revenue' as const, icon: Calculator, color: 'text-amber-400', department: 'Inland Revenue Department' },
      { label: 'Immigration', view: 'admin-ministry-immigration' as const, icon: Briefcase, color: 'text-purple-400', department: 'Immigration Department' },
      { label: 'Civil Registry', view: 'admin-ministry-civil-registry' as const, icon: Baby, color: 'text-pink-400', department: 'Registry of Civil Status' },
      { label: 'Motor Vehicles (DMV)', view: 'admin-ministry-dmv' as const, icon: Car, color: 'text-sky-400', department: 'Department of Motor Vehicles' },
      { label: 'Financial Services (FSC)', view: 'admin-ministry-fsc' as const, icon: Landmark, color: 'text-emerald-400', department: 'Financial Services Commission' },
      { label: 'Lands & Survey', view: 'admin-ministry-lands' as const, icon: Mountain, color: 'text-lime-400', department: 'Lands & Survey Department' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { label: 'Certificate Generator', view: 'admin-certificates' as const, icon: FileBadge },
      { label: 'Document Scanner', view: 'admin-scanner' as const, icon: ScanLine },
      { label: 'Bulk Import', view: 'admin-import' as const, icon: Upload },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Reports', view: 'admin-reports' as const, icon: BarChart3 },
      { label: 'Settings', view: 'admin-settings' as const, icon: Settings },
    ],
  },
];

function NavLinks({ onClick, currentView }: { onClick?: () => void; currentView: string }) {
  const { setCurrentView, setCurrentApplicationId, adminRole, adminDepartment } = useAppStore();
  const [ministriesOpen, setMinistriesOpen] = useState(true);

  const handleClick = (view: string) => {
    setCurrentApplicationId(null);
    setCurrentView(view as any);
    onClick?.();
  };

  const isAdmin = adminRole === 'admin';
  const isOfficer = adminRole === 'officer';
  const isSeniorOfficer = adminRole === 'senior_officer';

  // Filter sections based on role
  // Officers and senior officers see only Dashboard and Application Queue
  const filteredSections = navSections.map((section) => {
    if (isOfficer || isSeniorOfficer) {
      if (section.title === 'Main') {
        // Only keep Dashboard and Application Queue
        return { ...section, items: section.items.filter((item) => item.view === 'admin-dashboard' || item.view === 'admin-queue') };
      }
      // Hide Ministries, Tools, System for officers and senior officers
      return { ...section, items: [] };
    }
    return section;
  }).filter((section) => section.items.length > 0);

  return (
    <>
      {filteredSections.map((section) => {
        const isMinistries = section.title === 'Ministries';

        return (
          <div key={section.title} className="mb-4">
            <button
              className="text-[10px] text-gray-500 uppercase tracking-wider px-4 mb-2 mt-2 w-full flex items-center justify-between"
              onClick={() => isMinistries && setMinistriesOpen(!ministriesOpen)}
            >
              {section.title}
              {isMinistries && (
                <ChevronDown className={`w-3 h-3 transition-transform ${ministriesOpen ? '' : '-rotate-90'}`} />
              )}
            </button>
            {(!isMinistries || ministriesOpen) && section.items.map((item) => {
              const isActive = currentView === item.view;
              const isSubMinistry = isMinistries && item.view !== 'admin-ministries';

              return (
                <button
                  key={item.view}
                  onClick={() => handleClick(item.view)}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#009B3A] text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  } ${isSubMinistry ? 'pl-8 text-xs' : ''}`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? '' : (item as any).color || ''}`} />
                  {item.label}
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                </button>
              );
            })}
          </div>
        );
      })}
    </>
  );
}

export function AdminLayout({ children }: LayoutProps) {
  const { currentView, adminName, adminRole, setCurrentView } = useAppStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleGoToPublic = () => {
    setCurrentView('public-home');
  };

  const roleLabel = adminRole === 'admin' ? 'Administrator' : adminRole === 'senior_officer' ? 'Senior Officer' : 'Government Officer';

  return (
    <div className="min-h-screen bg-[#0C1B2A] flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0a1220] border-r border-[#1E3A5F] shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-[#1E3A5F]">
          <button onClick={handleGoToPublic} className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-[#009B3A] rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">BVI GovGate</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Admin Portal</p>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <NavLinks currentView={currentView} />
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-[#1E3A5F]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[#009B3A]/20 rounded-full flex items-center justify-center">
              <span className="text-[#009B3A] text-sm font-bold">
                {adminName?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-white font-medium truncate">{adminName}</p>
              <p className="text-[10px] text-gray-500">{roleLabel}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogoutClick}
            className="w-full text-gray-400 hover:text-red-400 hover:bg-red-400/5 justify-start text-sm h-9"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-[#0a1220] border-b border-[#1E3A5F]">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-[#0a1220] border-[#1E3A5F]">
                <SheetTitle className="text-white text-left">Admin Portal</SheetTitle>
                <div className="mt-6 space-y-1">
                  <NavLinks currentView={currentView} />
                </div>
                <div className="mt-8 pt-4 border-t border-[#1E3A5F]">
                  <Button
                    variant="ghost"
                    onClick={handleLogoutClick}
                    className="w-full text-gray-400 hover:text-red-400 justify-start text-sm"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#009B3A] rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold text-sm">Admin</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoToPublic}
            className="text-gray-400 text-xs"
          >
            View Public Portal
          </Button>
        </header>

        {/* Breadcrumbs */}
        <AdminBreadcrumbs />

        {/* Main Content */}
        <main className="flex-1 min-h-0 overflow-auto">
          <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <AdminLogoutModal open={showLogoutModal} onOpenChange={setShowLogoutModal} />
    </div>
  );
}
