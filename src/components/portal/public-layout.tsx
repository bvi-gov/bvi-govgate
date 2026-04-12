'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  Menu,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'Home', view: 'public-home' as const },
  { label: 'Services', view: 'services' as const },
  { label: 'Track Application', view: 'tracking' as const },
  { label: 'My Applications', view: 'my-applications' as const },
];

function NavLinks({ onClick, mobile = false }: { onClick?: () => void; mobile?: boolean }) {
  const { setCurrentView, setTrackingInput, setSearchQuery, setSelectedCategory } = useAppStore();

  const handleClick = (view: string) => {
    if (view === 'tracking') {
      setTrackingInput('');
    }
    if (view === 'services') {
      setSearchQuery('');
      setSelectedCategory('all');
    }
    setCurrentView(view as typeof navItems[number]['view']);
    onClick?.();
  };

  const baseClass = mobile
    ? 'text-sm font-medium text-[#0C1B2A] hover:text-[#009B3A] hover:bg-[#009B3A]/5 transition-colors py-3 px-4 rounded-lg'
    : 'text-sm font-medium text-white/80 hover:text-white transition-colors py-2 px-3 rounded-md hover:bg-white/10';

  return (
    <>
      {navItems.map((item) => (
        <button
          key={item.view}
          onClick={() => handleClick(item.view)}
          className={baseClass}
        >
          {item.label}
        </button>
      ))}
    </>
  );
}

export function PublicLayout({ children }: LayoutProps) {
  const { setCurrentView } = useAppStore();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Green Bar */}
      <div className="bg-[#009B3A] text-white text-xs py-1">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>Government of the Virgin Islands</span>
            <span className="hidden sm:inline text-white/60">|</span>
            <span className="hidden sm:inline">Official Digital Services Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline">For assistance: +1 284 468-3701</span>
            <button
              onClick={() => setCurrentView('admin-login')}
              className="text-xs underline underline-offset-2 hover:text-[#FFD100] transition-colors"
            >
              Staff Login
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <button
              onClick={() => setCurrentView('public-home')}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 bg-[#009B3A] rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-[#0C1B2A] leading-tight">BVI GovGate</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider leading-tight">
                  Digital Services Portal
                </p>
              </div>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLinks />
            </nav>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5 text-[#0C1B2A]" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-white">
                <SheetTitle className="text-[#0C1B2A] text-left text-lg">Menu</SheetTitle>
                <div className="flex flex-col gap-1 mt-4">
                  <NavLinks onClick={() => {}} mobile />
                </div>
                <div className="mt-8 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => { setCurrentView('admin-login'); }}
                    className="w-full text-sm font-medium text-[#0C1B2A] hover:text-[#009B3A] py-3 px-4 rounded-lg text-left"
                  >
                    Staff Login
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-[#0C1B2A] text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#009B3A] rounded-lg flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">BVI GovGate</h3>
                  <p className="text-xs text-white/60">Digital Services Portal</p>
                </div>
              </div>
              <p className="text-sm text-white/60 mb-4 max-w-md">
                The official digital government services portal of the British Virgin Islands.
                Access government services online, track applications, and receive documents
                from the comfort of your home.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#009B3A] transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#009B3A] transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#009B3A] transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-[#FFD100] mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><button onClick={() => setCurrentView('services')} className="hover:text-white transition-colors">All Services</button></li>
                <li><button onClick={() => setCurrentView('tracking')} className="hover:text-white transition-colors">Track Application</button></li>
                <li><button onClick={() => setCurrentView('my-applications')} className="hover:text-white transition-colors">My Applications</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Help & FAQ</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-[#FFD100] mb-4">Contact Us</h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Road Town, Tortola<br />British Virgin Islands</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>+1 (284) 468-3701</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>info@bvi.gov.vg</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
            <p>&copy; {new Date().getFullYear()} Government of the Virgin Islands. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white/60 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white/60 transition-colors">Accessibility</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
