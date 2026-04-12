'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  AlertCircle,
  User,
  FileText,
  ClipboardCheck,
  CreditCard,
  Mail,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';

interface ServiceInfo {
  id: string;
  name: string;
  slug: string;
  feeAmount: number;
  formFields: string;
  department: string;
  requirements: string;
}

interface FormData {
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  [key: string]: string;
}

interface FormFieldDef {
  key: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

// Keys that indicate the service form already captures these contact details
const NAME_KEYS = ['surname', 'givennames', 'fullname', 'applicantname', 'bridefullname', 'groomfullname', 'deceasedname', 'informantname', 'businessname', 'taxpayername', 'ownername', 'companyname', 'employeename', 'submittedbyname'];
const EMAIL_KEYS = ['contactemail', 'businessemail', 'applicantemail', 'email'];
const PHONE_KEYS = ['contactnumbers', 'contactphone', 'businesscontactphone', 'applicantphone', 'phone'];

export function ApplicationFormView() {
  const {
    selectedServiceSlug, setCurrentView,
    applicationStep, setApplicationStep,
    setCurrentApplicationId, setSubmittedTrackingNumber,
  } = useAppStore();

  const [service, setService] = useState<ServiceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormData>({
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Parse form fields from service
  const formFields: FormFieldDef[] = useMemo(() => {
    if (!service?.formFields) return [];
    return JSON.parse(service.formFields || '[]');
  }, [service?.formFields]);

  // SMART FORM: Detect if service already captures contact details
  const formConfig = useMemo(() => {
    const fieldKeys = formFields.map(f => f.key.toLowerCase());

    const hasNameFields = fieldKeys.some(k => NAME_KEYS.includes(k));
    const hasEmailField = fieldKeys.some(k => EMAIL_KEYS.includes(k));
    const hasPhoneField = fieldKeys.some(k => PHONE_KEYS.includes(k));

    // If the service form already captures name + email + phone, merge into single step
    const needsContactStep = !(hasNameFields && hasEmailField && hasPhoneField);

    // Build dynamic steps based on service
    const dynamicSteps: { icon: typeof User; label: string }[] = [];
    if (needsContactStep) {
      dynamicSteps.push({ icon: Mail, label: 'Contact Information' });
    }
    dynamicSteps.push({ icon: FileText, label: 'Application Details' });
    dynamicSteps.push({ icon: ClipboardCheck, label: 'Review & Submit' });

    return {
      needsContactStep,
      hasNameFields,
      hasEmailField,
      hasPhoneField,
      steps: dynamicSteps,
    };
  }, [formFields]);

  useEffect(() => {
    async function fetchService() {
      if (!selectedServiceSlug) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/services/${selectedServiceSlug}`);
        if (res.ok) setService(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchService();
    setApplicationStep(0);
    setForm({ applicantName: '', applicantEmail: '', applicantPhone: '' });
    setErrors({});
  }, [selectedServiceSlug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!service) return null;

  const requirements: string[] = JSON.parse(service.requirements || '[]');

  // Map step index to actual content (accounts for optional contact step)
  const getStepContent = (stepIndex: number) => {
    if (formConfig.needsContactStep) {
      // 0 = contact, 1 = form fields, 2 = review
      if (stepIndex === 0) return 'contact';
      if (stepIndex === 1) return 'fields';
      return 'review';
    } else {
      // 0 = form fields (includes contact info within), 1 = review
      if (stepIndex === 0) return 'fields';
      return 'review';
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    const content = getStepContent(step);

    if (content === 'contact') {
      if (!form.applicantName.trim()) newErrors.applicantName = 'Name is required';
      if (!form.applicantEmail.trim()) newErrors.applicantEmail = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.applicantEmail))
        newErrors.applicantEmail = 'Invalid email format';
      if (!form.applicantPhone.trim()) newErrors.applicantPhone = 'Phone is required';
    }

    if (content === 'fields') {
      formFields.forEach((field) => {
        if (field.required && !form[field.key]?.trim()) {
          newErrors[field.key] = `${field.label} is required`;
        }
      });

      // If no separate contact step and the service doesn't have email/phone fields,
      // also validate the generic contact fields here
      if (!formConfig.needsContactStep && !formConfig.hasEmailField) {
        if (!form.applicantEmail.trim()) newErrors.applicantEmail = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.applicantEmail))
          newErrors.applicantEmail = 'Invalid email format';
      }
      if (!formConfig.needsContactStep && !formConfig.hasPhoneField) {
        if (!form.applicantPhone.trim()) newErrors.applicantPhone = 'Phone is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(applicationStep)) {
      setApplicationStep(applicationStep + 1);
    }
  };

  const handleBack = () => {
    if (applicationStep > 0) setApplicationStep(applicationStep - 1);
    else setCurrentView('service-detail');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const serviceFormData: Record<string, string> = {};
      formFields.forEach((f) => {
        serviceFormData[f.key] = form[f.key] || '';
      });

      // If service has name fields, populate applicantName from them
      let applicantName = form.applicantName;
      if (formConfig.hasNameFields && !applicantName.trim()) {
        const surname = form['surname'] || '';
        const givenNames = form['givenNames'] || '';
        const fullName = form['fullName'] || form['applicantName'] || form['businessName'] || '';
        applicantName = [surname, givenNames, fullName].filter(Boolean).join(' ').trim() || 'N/A';
      }

      // If service has email field, populate from it
      if (formConfig.hasEmailField && !form.applicantEmail.trim()) {
        const contactEmail = form['contactEmail'] || form['businessEmail'] || '';
        if (contactEmail) {
          setForm(prev => ({ ...prev, applicantEmail: contactEmail }));
        }
      }

      // If service has phone field, populate from it
      if (formConfig.hasPhoneField && !form.applicantPhone.trim()) {
        const contactPhone = form['contactNumbers'] || form['contactPhone'] || form['businessContactPhone'] || '';
        if (contactPhone) {
          setForm(prev => ({ ...prev, applicantPhone: contactPhone }));
        }
      }

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          applicantName: applicantName || form.applicantName || 'N/A',
          applicantEmail: form.applicantEmail || 'N/A',
          applicantPhone: form.applicantPhone || 'N/A',
          formData: serviceFormData,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const tracking = data.trackingNumber;
        setSubmittedTrackingNumber(tracking);
        setCurrentApplicationId(data.id);

        if (service.feeAmount > 0) {
          toast.success('Application submitted!', { description: `Tracking: ${tracking}` });
          setCurrentView('payment');
        } else {
          toast.success('Application submitted successfully!', {
            description: `Tracking: ${tracking}. No payment required.`,
          });
          setCurrentView('tracking');
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || 'Failed to submit application');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormFieldDef) => (
    <div key={field.key} className="space-y-2">
      <Label htmlFor={field.key}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {field.type === 'select' && field.options ? (
        <Select
          value={form[field.key] || ''}
          onValueChange={(v) => setForm({ ...form, [field.key]: v })}
        >
          <SelectTrigger className="bg-white" id={field.key}>
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.type === 'textarea' ? (
        <Textarea
          id={field.key}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          value={form[field.key] || ''}
          onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
          className="bg-white min-h-[80px]"
        />
      ) : (
        <Input
          id={field.key}
          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          value={form[field.key] || ''}
          onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
          className="bg-white"
        />
      )}
      {errors[field.key] && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {errors[field.key]}
        </p>
      )}
    </div>
  );

  // Render inline contact fields when no separate contact step
  const renderInlineContactFields = () => {
    if (formConfig.needsContactStep) return null;
    const fields: React.ReactNode[] = [];

    if (!formConfig.hasEmailField) {
      fields.push(
        <div key="inline-email" className="space-y-2">
          <Label htmlFor="applicantEmail">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="applicantEmail"
            type="email"
            placeholder="your@email.com"
            value={form.applicantEmail}
            onChange={(e) => setForm({ ...form, applicantEmail: e.target.value })}
            className="bg-white"
          />
          {errors.applicantEmail && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.applicantEmail}
            </p>
          )}
        </div>
      );
    }

    if (!formConfig.hasPhoneField) {
      fields.push(
        <div key="inline-phone" className="space-y-2">
          <Label htmlFor="applicantPhone">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="applicantPhone"
            type="tel"
            placeholder="+1 284 XXX XXXX"
            value={form.applicantPhone}
            onChange={(e) => setForm({ ...form, applicantPhone: e.target.value })}
            className="bg-white"
          />
          {errors.applicantPhone && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.applicantPhone}
            </p>
          )}
        </div>
      );
    }

    return fields;
  };

  const currentContent = getStepContent(applicationStep);
  const totalSteps = formConfig.steps.length;
  const isLastStep = applicationStep === totalSteps - 1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 section-enter">
      {/* Back */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#009B3A] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {applicationStep === 0 ? 'Back to Service' : 'Previous Step'}
      </button>

      {/* Header */}
      <h1 className="text-2xl font-bold text-[#0C1B2A] mb-1">Apply for {service.name}</h1>
      <p className="text-gray-500 text-sm mb-1">{service.department}</p>
      <p className="text-gray-400 text-sm mb-6">
        {formConfig.needsContactStep
          ? 'Complete each step to submit your application'
          : 'Fill in all required fields and submit your application'}
      </p>

      {/* Requirements Banner (only on first step) */}
      {applicationStep === 0 && requirements.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Required Documents
          </h3>
          <p className="text-xs text-amber-700 mb-2">You will need the following documents to complete this application:</p>
          <ul className="space-y-1">
            {requirements.map((req, i) => (
              <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                <Check className="w-3 h-3 mt-0.5 shrink-0 text-amber-500" />
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {formConfig.steps.map((step, i) => (
          <React.Fragment key={step.label}>
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                i === applicationStep
                  ? 'bg-[#009B3A] text-white'
                  : i < applicationStep
                  ? 'bg-[#009B3A]/10 text-[#009B3A]'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {i < applicationStep ? (
                <Check className="w-4 h-4" />
              ) : (
                <step.icon className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < formConfig.steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${i < applicationStep ? 'bg-[#009B3A]' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">

        {/* CONTACT STEP (only for services that don't have name/email/phone in their form) */}
        {currentContent === 'contact' && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-[#0C1B2A]">Your Contact Information</h2>
            <p className="text-sm text-gray-500">
              Provide your contact details. We will use this to send you updates about your {service.name} application.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="applicantName">Full Name <span className="text-red-500">*</span></Label>
                <Input
                  id="applicantName"
                  placeholder="Enter your full legal name"
                  value={form.applicantName}
                  onChange={(e) => setForm({ ...form, applicantName: e.target.value })}
                  className="bg-white"
                />
                {errors.applicantName && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.applicantName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="applicantEmail">Email Address <span className="text-red-500">*</span></Label>
                <Input
                  id="applicantEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={form.applicantEmail}
                  onChange={(e) => setForm({ ...form, applicantEmail: e.target.value })}
                  className="bg-white"
                />
                {errors.applicantEmail && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.applicantEmail}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="applicantPhone">Phone Number <span className="text-red-500">*</span></Label>
                <Input
                  id="applicantPhone"
                  type="tel"
                  placeholder="+1 284 XXX XXXX"
                  value={form.applicantPhone}
                  onChange={(e) => setForm({ ...form, applicantPhone: e.target.value })}
                  className="bg-white"
                />
                {errors.applicantPhone && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.applicantPhone}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FIELDS STEP (service-specific form fields) */}
        {currentContent === 'fields' && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-[#0C1B2A]">Application Details</h2>
            <p className="text-sm text-gray-500">
              Fill in the required information for your {service.name} application.
              All fields should be completed in <span className="font-semibold">BLOCK LETTERS</span> where applicable.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {formFields.map((field) => (
                <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  {renderField(field)}
                </div>
              ))}
              {/* Inline contact fields if no separate step */}
              {renderInlineContactFields()}
            </div>
          </div>
        )}

        {/* REVIEW STEP */}
        {currentContent === 'review' && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-[#0C1B2A]">Review Your Application</h2>
            <p className="text-sm text-gray-500">Please verify all information before submitting. Changes cannot be made after submission.</p>

            <div className="pt-2 space-y-4">
              {/* Applicant Contact Info (show if separate contact step was used) */}
              {formConfig.needsContactStep && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" /> Contact Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-400">Name:</span><br /><span className="text-[#0C1B2A] font-medium">{form.applicantName}</span></div>
                    <div><span className="text-gray-400">Email:</span><br /><span className="text-[#0C1B2A] font-medium">{form.applicantEmail}</span></div>
                    <div><span className="text-gray-400">Phone:</span><br /><span className="text-[#0C1B2A] font-medium">{form.applicantPhone}</span></div>
                  </div>
                </div>
              )}

              {/* Service Fields Review */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> {service.name} Details
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {formFields.map((field) => (
                    <div key={field.key} className={field.type === 'textarea' ? 'col-span-2' : ''}>
                      <span className="text-gray-400">{field.label}:</span>
                      <p className="text-[#0C1B2A] font-medium whitespace-pre-wrap">{form[field.key] || '—'}</p>
                    </div>
                  ))}
                  {/* Show inline contact fields in review if they were present */}
                  {!formConfig.needsContactStep && !formConfig.hasEmailField && (
                    <div>
                      <span className="text-gray-400">Email:</span>
                      <p className="text-[#0C1B2A] font-medium">{form.applicantEmail || '—'}</p>
                    </div>
                  )}
                  {!formConfig.needsContactStep && !formConfig.hasPhoneField && (
                    <div>
                      <span className="text-gray-400">Phone:</span>
                      <p className="text-[#0C1B2A] font-medium">{form.applicantPhone || '—'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fee Summary */}
              <div className="bg-[#009B3A]/5 border border-[#009B3A]/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#0C1B2A]">Application Fee</span>
                    {service.feeAmount > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">Non-refundable processing fee</p>
                    )}
                  </div>
                  <span className="text-xl font-bold text-[#009B3A]">
                    {service.feeAmount > 0 ? `$${service.feeAmount.toFixed(2)} USD` : 'No Fee'}
                  </span>
                </div>
              </div>

              {/* Terms */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-700">
                  By submitting this application, you confirm that all information provided is true and correct
                  to the best of your knowledge. False statements may result in the rejection of this application
                  or legal action under the Laws of the British Virgin Islands.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={handleBack}
            className="border-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {applicationStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          <div className="flex gap-3">
            {!isLastStep ? (
              <Button
                onClick={handleNext}
                className="bg-[#009B3A] text-white hover:bg-[#007A2E]"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-[#009B3A] text-white hover:bg-[#007A2E] min-w-[180px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
