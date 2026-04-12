'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Baby,
  Heart,
  HeartHandshake,
  Store,
  Briefcase,
  Building2,
  Car,
  Calculator,
  BookOpen,
  Shield,
  ArrowRight,
  Search,
  Clock,
  CheckCircle2,
  FileCheck,
  Zap,
  Users,
  Globe,
  ChevronRight,
  Mountain,
} from 'lucide-react';

const popularServices = [
  { slug: 'birth-certificate', name: 'Birth Certificate', icon: Baby, color: 'bg-pink-100 text-pink-600', desc: 'Get a certified copy of your birth certificate' },
  { slug: 'trade-license', name: 'Trade License', icon: Store, color: 'bg-emerald-100 text-emerald-600', desc: 'Apply for a business trade license' },
  { slug: 'work-permit', name: 'Work Permit', icon: Briefcase, color: 'bg-amber-100 text-amber-600', desc: 'Apply for legal employment authorization' },
  { slug: 'passport-application', name: 'Passport Application', icon: BookOpen, color: 'bg-blue-100 text-blue-600', desc: 'Apply for a BVI passport' },
  { slug: 'drivers-license-renewal', name: "Driver's License", icon: Car, color: 'bg-purple-100 text-purple-600', desc: 'Renew your driver\'s license' },
  { slug: 'tax-filing-individual', name: 'Tax Filing', icon: Calculator, color: 'bg-orange-100 text-orange-600', desc: 'Submit your annual tax return' },
  { slug: 'property-title-search', name: 'Property Title Search', icon: Mountain, color: 'bg-lime-100 text-lime-700', desc: 'Search land titles and ownership records' },
];

export function HomeView() {
  const { setCurrentView, setSelectedServiceSlug } = useAppStore();

  const handleServiceClick = (slug: string) => {
    setSelectedServiceSlug(slug);
    setCurrentView('service-detail');
  };

  return (
    <div className="section-enter">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#009B3A] via-[#007A2E] to-[#005F23] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
              <Globe className="w-4 h-4" />
              <span>Official Government Portal</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              Government of the<br />
              <span className="text-[#FFD100]">Virgin Islands</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg">
              Access government services online. Apply for certificates, licenses, and permits
              — track your applications and receive documents digitally.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => setCurrentView('services')}
                className="bg-[#FFD100] text-[#0C1B2A] hover:bg-[#E6BC00] font-semibold rounded-lg px-6"
              >
                Browse All Services
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setCurrentView('tracking')}
                className="border-white/30 text-white hover:bg-white/10 rounded-lg px-6"
              >
                Track Application
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#0C1B2A] text-white -mt-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: FileCheck, value: '1,247+', label: 'Applications Processed' },
              { icon: Clock, value: '3.5 days', label: 'Average Processing Time' },
              { icon: Zap, value: '15', label: 'Digital Services' },
              { icon: Users, value: '98%', label: 'Citizen Satisfaction' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-6 h-6 text-[#FFD100] mx-auto mb-2" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0C1B2A]">Popular Services</h2>
            <p className="text-gray-500 mt-1">Most used government services</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => setCurrentView('services')}
            className="text-[#009B3A] hover:text-[#007A2E] hidden sm:flex"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularServices.map((service) => (
            <button
              key={service.slug}
              onClick={() => handleServiceClick(service.slug)}
              className="group flex items-start gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-[#009B3A]/30 transition-all text-left"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${service.color}`}>
                <service.icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-[#0C1B2A] group-hover:text-[#009B3A] transition-colors">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{service.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#009B3A] transition-colors shrink-0 mt-1" />
            </button>
          ))}
        </div>

        <div className="sm:hidden mt-4 text-center">
          <Button
            variant="outline"
            onClick={() => setCurrentView('services')}
            className="text-[#009B3A] border-[#009B3A] w-full"
          >
            View All Services
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0C1B2A]">How It Works</h2>
            <p className="text-gray-500 mt-2">Getting your government documents is now easier than ever</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '1',
                icon: Search,
                title: 'Choose Service',
                desc: 'Browse our catalog of government services and select what you need.',
              },
              {
                step: '2',
                icon: FileCheck,
                title: 'Fill Form & Pay',
                desc: 'Complete the online application form and pay the required fee securely.',
              },
              {
                step: '3',
                icon: CheckCircle2,
                title: 'Receive Document',
                desc: 'Track your application status and receive your document when ready.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center relative">
                <div className="w-16 h-16 bg-[#009B3A] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#009B3A]/20">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <div className="inline-flex items-center justify-center w-7 h-7 bg-[#FFD100] text-[#0C1B2A] rounded-full text-sm font-bold mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg text-[#0C1B2A] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Announcements */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-[#0C1B2A] mb-8">Announcements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              date: 'April 2025',
              title: 'BVI GovGate Portal Launches',
              desc: 'The Government of the Virgin Islands is proud to announce the launch of our new digital services portal. Citizens can now apply for certificates, licenses, and permits online.',
              badge: 'New',
            },
            {
              date: 'March 2025',
              title: 'Extended Office Hours for Tax Season',
              desc: 'The Inland Revenue Department has extended office hours from 8:00 AM to 5:00 PM, Monday through Friday, to assist with annual tax filings. Deadline: March 31st.',
              badge: 'Notice',
            },
            {
              date: 'March 2025',
              title: 'New Work Permit Requirements',
              desc: 'Effective April 1, 2025, all work permit applications must include a medical certificate issued within the last 3 months. Previously, the requirement was 6 months.',
              badge: 'Update',
            },
            {
              date: 'February 2025',
              title: 'Passport Processing Center Updates',
              desc: 'The Immigration Department has introduced a new fast-track option for passport applications. Standard processing remains at 10 business days.',
              badge: 'Info',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-[#009B3A] bg-[#009B3A]/10 rounded-full px-2.5 py-0.5">
                  {item.badge}
                </span>
                <span className="text-xs text-gray-400">{item.date}</span>
              </div>
              <h3 className="font-semibold text-[#0C1B2A] mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#009B3A] py-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to Get Started?</h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">
            Browse all available government services and apply online today. No need to visit the office.
          </p>
          <Button
            size="lg"
            onClick={() => setCurrentView('services')}
            className="bg-[#FFD100] text-[#0C1B2A] hover:bg-[#E6BC00] font-semibold rounded-lg px-8"
          >
            Explore All Services
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}
