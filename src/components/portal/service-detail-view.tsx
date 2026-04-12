'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Baby, Heart, HeartHandshake, Store, Briefcase, Building2, Car,
  Calculator, BookOpen, Shield, Clock, DollarSign, FileText,
  CheckCircle2, ArrowLeft, ArrowRight, AlertCircle,
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Baby, Heart, HeartHandshake, Store, Briefcase, Building2, Car,
  Calculator, BookOpen, Shield,
};

interface ServiceDetail {
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
  requirements: string;
  formFields: string;
}

export function ServiceDetailView() {
  const { selectedServiceSlug, setCurrentView, setCurrentApplicationId, setApplicationStep } = useAppStore();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchService() {
      if (!selectedServiceSlug) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/services/${selectedServiceSlug}`);
        if (res.ok) {
          const data = await res.json();
          setService(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchService();
  }, [selectedServiceSlug]);

  const handleApply = () => {
    setApplicationStep(0);
    setCurrentView('application-form');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-8 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-500">Service not found</h2>
        <Button variant="outline" onClick={() => setCurrentView('services')} className="mt-4">
          Back to Services
        </Button>
      </div>
    );
  }

  const IconComp = iconMap[service.icon] || FileText;
  const requirements: string[] = JSON.parse(service.requirements || '[]');
  const formFields: { key: string; label: string; type: string; required: boolean }[] = JSON.parse(service.formFields || '[]');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 section-enter">
      {/* Back Button */}
      <button
        onClick={() => setCurrentView('services')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#009B3A] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Services
      </button>

      {/* Service Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-start gap-5">
          <div className="w-16 h-16 bg-[#009B3A]/10 rounded-2xl flex items-center justify-center shrink-0">
            <IconComp className="w-8 h-8 text-[#009B3A]" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className="bg-[#009B3A]/10 text-[#009B3A] border-0 capitalize">
                {service.category}
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0C1B2A] mb-2">{service.name}</h1>
            <p className="text-sm text-gray-400 mb-3">{service.department}</p>
            <p className="text-gray-600">{service.description}</p>
          </div>
        </div>
      </div>

      {/* Key Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
          <Clock className="w-6 h-6 text-[#009B3A] mx-auto mb-2" />
          <div className="text-2xl font-bold text-[#0C1B2A]">{service.processingDays}</div>
          <div className="text-xs text-gray-500 mt-1">Business Days</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
          <DollarSign className="w-6 h-6 text-[#FFD100] mx-auto mb-2" />
          <div className="text-2xl font-bold text-[#0C1B2A]">
            {service.feeAmount > 0 ? `$${service.feeAmount}` : 'Free'}
          </div>
          <div className="text-xs text-gray-500 mt-1">Application Fee</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-[#0C1B2A]">Online</div>
          <div className="text-xs text-gray-500 mt-1">Digital Application</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Requirements */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-[#0C1B2A] mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#009B3A]" />
            Required Documents
          </h2>
          {requirements.length > 0 ? (
            <ul className="space-y-2.5">
              {requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-[#009B3A] shrink-0 mt-0.5" />
                  {req}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No additional documents required</p>
          )}
        </div>

        {/* Form Preview */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-[#0C1B2A] mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#009B3A]" />
            Information Needed
          </h2>
          <p className="text-sm text-gray-400 mb-3">You will be asked to provide the following information:</p>
          <ul className="space-y-2.5">
            {formFields.map((field) => (
              <li key={field.key} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                <span>
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Apply Button */}
      <div className="text-center">
        <Button
          size="lg"
          onClick={handleApply}
          className="bg-[#009B3A] text-white hover:bg-[#007A2E] font-semibold rounded-xl px-10 h-12 text-base"
        >
          Apply Now — {service.feeAmount > 0 ? `$${service.feeAmount}` : 'Free'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <p className="text-xs text-gray-400 mt-3">
          You can save and return to your application at any time
        </p>
      </div>
    </div>
  );
}
