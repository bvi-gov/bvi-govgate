'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard,
  Building,
  Banknote,
  Check,
  Loader2,
  ShieldCheck,
  ArrowLeft,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';

interface ServiceInfo {
  id: string;
  name: string;
  feeAmount: number;
  department: string;
}

interface PaymentMethodInfo {
  method: string;
  displayName: string;
  description: string;
  onlinePayment: boolean;
}

interface PaymentInitiateResponse {
  success: boolean;
  status: string;
  receiptNumber: string;
  trackingNumber: string;
  amount: number;
  currency: string;
  method: string;
  feeBreakdown: {
    subtotal: number;
    processingFee: number;
    tax: number;
    total: number;
  };
}

const METHOD_ICONS: Record<string, React.FC<{ className?: string }>> = {
  credit_card: CreditCard,
  bank_transfer: Building,
  cash: Banknote,
};

const METHOD_LABELS: Record<string, string> = {
  credit_card: 'Credit / Debit Card',
  bank_transfer: 'Bank Transfer',
  cash: 'Cash at Office',
};

export function PaymentView() {
  const {
    currentApplicationId, submittedTrackingNumber,
    setCurrentView, goBack,
  } = useAppStore();

  const [service, setService] = useState<ServiceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState<'credit_card' | 'bank_transfer' | 'cash'>('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successData, setSuccessData] = useState<PaymentInitiateResponse | null>(null);
  const [availableMethods, setAvailableMethods] = useState<PaymentMethodInfo[]>([]);

  useEffect(() => {
    async function fetchPaymentInfo() {
      if (!currentApplicationId) return;
      try {
        // Fetch application details
        const res = await fetch(`/api/applications/${currentApplicationId}`);
        if (res.ok) {
          const data = await res.json();
          setService({
            id: data.service.id,
            name: data.service.name,
            feeAmount: data.service.feeAmount,
            department: data.service.department,
          });

          // If already paid, go to success state
          if (data.paymentStatus === 'paid') {
            setSuccessData({
              success: true,
              status: 'completed',
              receiptNumber: data.payment?.receiptNumber || '',
              trackingNumber: data.trackingNumber,
              amount: data.paymentAmount,
              currency: 'USD',
              method: data.paymentMethod || 'credit_card',
              feeBreakdown: {
                subtotal: data.paymentAmount,
                processingFee: 0,
                tax: 0,
                total: data.paymentAmount,
              },
            });
            setSuccess(true);
            return;
          }
        }

        // Fetch available payment methods
        const methodsRes = await fetch(`/api/payments/${currentApplicationId}/initiate`);
        if (methodsRes.ok) {
          const methodsData = await methodsRes.json();
          setAvailableMethods(methodsData.availableMethods || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPaymentInfo();
  }, [currentApplicationId]);

  const handlePay = async () => {
    if (!agreed) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setProcessing(true);

    try {
      // Use the new payment initiation endpoint
      const res = await fetch(`/api/payments/${currentApplicationId}/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSuccessData(data);
          setSuccess(true);
          toast.success('Payment successful!', {
            description: `Your application ${submittedTrackingNumber} is now being processed.`,
          });
        } else {
          toast.error(data.error || 'Payment failed. Please try again.');
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || 'Payment failed. Please try again.');
      }
    } catch {
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center section-enter">
        <div className="w-20 h-20 bg-[#009B3A]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-[#009B3A]" />
        </div>
        <h1 className="text-2xl font-bold text-[#0C1B2A] mb-2">Payment Successful!</h1>
        <p className="text-gray-500 mb-6">Your application has been submitted and is now being processed.</p>

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 text-left max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Tracking Number</span>
            <button onClick={() => handleCopy(successData?.trackingNumber || submittedTrackingNumber || '')} className="text-gray-400 hover:text-[#009B3A]">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xl font-mono font-bold text-[#0C1B2A] mb-4">{successData?.trackingNumber || submittedTrackingNumber}</p>

          {successData?.receiptNumber && (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Receipt Number</span>
                <button onClick={() => handleCopy(successData.receiptNumber)} className="text-gray-400 hover:text-[#009B3A]">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm font-mono font-semibold text-[#0C1B2A] mb-4">{successData.receiptNumber}</p>
            </>
          )}

          <Separator className="mb-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Service</span>
              <span className="text-[#0C1B2A] font-medium">{service?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Amount Paid</span>
              <span className="text-[#009B3A] font-bold">${successData?.amount.toFixed(2) || service?.feeAmount?.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Payment Method</span>
              <span className="text-[#0C1B2A] font-medium capitalize">{(successData?.method || method).replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <Badge className="bg-[#009B3A]/10 text-[#009B3A]">
                {successData?.status === 'completed' ? 'Confirmed' : successData?.status || 'Processing'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => setCurrentView('tracking')}
            className="bg-[#009B3A] text-white hover:bg-[#007A2E]"
          >
            Track Application
          </Button>
          <Button variant="outline" onClick={() => setCurrentView('public-home')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 section-enter">
      <button
        onClick={goBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#009B3A] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-2xl font-bold text-[#0C1B2A] mb-1">Complete Payment</h1>
      <p className="text-gray-500 text-sm mb-6">Secure payment for your application</p>

      {/* Order Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-[#0C1B2A] mb-4">Order Summary</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{service.name}</span>
            <span className="text-[#0C1B2A] font-medium">${service.feeAmount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Processing Fee</span>
            <span className="text-[#0C1B2A] font-medium">$0.00</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between font-semibold">
            <span className="text-[#0C1B2A]">Total</span>
            <span className="text-xl text-[#009B3A]">${service.feeAmount.toFixed(2)} USD</span>
          </div>
        </div>
        {submittedTrackingNumber && (
          <div className="mt-4 bg-gray-50 rounded-lg p-3 text-sm">
            <span className="text-gray-400">Tracking:</span>{' '}
            <span className="font-mono font-semibold text-[#0C1B2A]">{submittedTrackingNumber}</span>
          </div>
        )}
      </div>

      {/* Payment Method Selection */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-[#0C1B2A] mb-4">Payment Method</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            { value: 'credit_card' as const, label: METHOD_LABELS.credit_card, icon: CreditCard },
            { value: 'bank_transfer' as const, label: METHOD_LABELS.bank_transfer, icon: Building },
            { value: 'cash' as const, label: METHOD_LABELS.cash, icon: Banknote },
          ].map((m) => {
            const isAvailable = availableMethods.length === 0 || availableMethods.some((am) => am.method === m.value);
            return (
              <button
                key={m.value}
                onClick={() => isAvailable && setMethod(m.value)}
                disabled={!isAvailable}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  !isAvailable
                    ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    : method === m.value
                      ? 'border-[#009B3A] bg-[#009B3A]/5'
                      : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <m.icon className={`w-6 h-6 ${method === m.value && isAvailable ? 'text-[#009B3A]' : 'text-gray-400'}`} />
                <span className={`text-xs font-medium ${method === m.value && isAvailable ? 'text-[#009B3A]' : 'text-gray-500'}`}>
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Credit Card Form */}
        {method === 'credit_card' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                placeholder="Name on card"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                className="bg-white"
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, '');
                    if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
                    setExpiry(v);
                  }}
                  className="bg-white"
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="bg-white"
                  maxLength={4}
                  type="password"
                />
              </div>
            </div>
          </div>
        )}

        {method === 'bank_transfer' && (
          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
            <p className="font-medium text-[#0C1B2A]">Bank Transfer Details</p>
            <p><span className="text-gray-400">Bank:</span> FirstCaribbean International Bank</p>
            <p><span className="text-gray-400">Account Name:</span> Government of the Virgin Islands</p>
            <p><span className="text-gray-400">Account Number:</span> BVI-GOV-001234567</p>
            <p><span className="text-gray-400">Routing:</span> 021000021</p>
            <p className="text-xs text-gray-400 mt-2">Include your tracking number as the payment reference.</p>
          </div>
        )}

        {method === 'cash' && (
          <div className="bg-gray-50 rounded-lg p-4 text-sm">
            <p className="font-medium text-[#0C1B2A]">Cash Payment at Office</p>
            <p className="text-gray-500 mt-1">
              Visit the {service.department} office at Road Town, Tortola during business hours
              (Monday - Friday, 8:30 AM - 4:30 PM). Bring your tracking number:
            </p>
            <p className="font-mono font-bold text-[#009B3A] mt-2">{submittedTrackingNumber}</p>
          </div>
        )}
      </div>

      {/* Terms and Pay */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <label className="flex items-start gap-3 cursor-pointer mb-6">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-[#009B3A] focus:ring-[#009B3A]"
          />
          <span className="text-sm text-gray-500">
            I agree to the Terms and Conditions and confirm that the information provided is accurate.
            I understand that providing false information may result in my application being rejected.
          </span>
        </label>

        <Button
          size="lg"
          onClick={handlePay}
          disabled={processing || !agreed}
          className="w-full bg-[#009B3A] text-white hover:bg-[#007A2E] h-12 font-semibold"
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5 mr-2" />
              Pay ${service.feeAmount.toFixed(2)}
            </>
          )}
        </Button>

        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>256-bit SSL encrypted. Your payment information is secure.</span>
        </div>
      </div>
    </div>
  );
}
