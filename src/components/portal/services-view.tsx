'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Search,
  Clock,
  DollarSign,
  ArrowRight,
  ChevronRight,
  Mountain,
  LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
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
  Mountain,
};

const categories = [
  { value: 'all', label: 'All Services' },
  { value: 'certificates', label: 'Certificates' },
  { value: 'licenses', label: 'Licenses' },
  { value: 'immigration', label: 'Immigration' },
  { value: 'land', label: 'Land & Property' },
  { value: 'taxation', label: 'Taxation' },
  { value: 'registration', label: 'Registration' },
];

interface GovService {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  department: string;
  processingDays: number;
  feeAmount: number;
  currency: string;
  icon: string;
}

export function ServicesView() {
  const { setCurrentView, setSelectedServiceSlug, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useAppStore();
  const [services, setServices] = useState<GovService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') params.set('category', selectedCategory);
        const res = await fetch(`/api/services?${params}`);
        if (res.ok) {
          const data = await res.json();
          setServices(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, [selectedCategory]);

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleServiceClick = (slug: string) => {
    setSelectedServiceSlug(slug);
    setCurrentView('service-detail');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 section-enter">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0C1B2A]">Government Services</h1>
        <p className="text-gray-500 mt-1">Browse and apply for government services online</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search services by name, department, or keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 bg-white border-gray-200 rounded-xl text-base"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.value
                ? 'bg-[#009B3A] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">No services found</h3>
          <p className="text-gray-400 mt-1">Try adjusting your search or category filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((service) => {
            const IconComp = iconMap[service.icon] || Store;
            return (
              <button
                key={service.id}
                onClick={() => handleServiceClick(service.slug)}
                className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-[#009B3A]/30 transition-all text-left"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-[#009B3A]/10 rounded-xl flex items-center justify-center">
                    <IconComp className="w-6 h-6 text-[#009B3A]" />
                  </div>
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-500 capitalize">
                    {service.category}
                  </Badge>
                </div>
                <h3 className="font-semibold text-[#0C1B2A] group-hover:text-[#009B3A] transition-colors mb-1">
                  {service.name}
                </h3>
                <p className="text-xs text-gray-400 mb-4 line-clamp-2">{service.department}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {service.processingDays} days
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    {service.feeAmount > 0 ? `$${service.feeAmount}` : 'Free'}
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-[#009B3A] font-medium group-hover:underline">
                    Apply Now
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#009B3A] transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
