/**
 * Payment Provider Interface - BVI GovGate
 *
 * Implement this interface to add real payment gateways (Stripe, PayPal, etc.)
 * Each provider handles a specific payment method (credit_card, bank_transfer, etc.)
 *
 * Future providers:
 * - StripeProvider: Credit/debit cards via Stripe (PaymentIntents or Checkout)
 * - PayPalProvider: PayPal payments via PayPal REST API
 * - BankTransferProvider: Bank transfer tracking
 */

export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'cash' | 'paypal';

export type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded';

export interface CreatePaymentParams {
  applicationId: string;
  trackingNumber: string;
  amount: number;
  currency: string;
  applicantName: string;
  applicantEmail: string;
  description: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  paymentRef: string;
  /** For redirect-based flows (Stripe Checkout, PayPal) */
  redirectUrl?: string;
  /** For client-side confirmation (Stripe PaymentIntent) */
  clientSecret?: string;
  receiptNumber: string;
  status: PaymentStatus;
  error?: string;
}

export interface VerifyResult {
  success: boolean;
  status: PaymentStatus;
  amount?: number;
  gatewayRef?: string;
  error?: string;
}

export interface RefundResult {
  success: boolean;
  refundRef: string;
  amount?: number;
  error?: string;
}

export interface PaymentProvider {
  /** Unique provider identifier (e.g., 'simulator', 'stripe', 'paypal') */
  name: string;

  /** The payment method this provider handles */
  method: PaymentMethod;

  /**
   * Create a payment session/intent.
   * For redirect flows (Stripe Checkout, PayPal): return redirectUrl
   * For embedded flows (Stripe PaymentIntent): return clientSecret
   * For simulator: return success immediately
   */
  createPayment(params: CreatePaymentParams): Promise<PaymentResult>;

  /**
   * Verify/check the current status of a payment.
   * Used for async flows where payment completion is confirmed server-side.
   */
  verifyPayment(paymentRef: string): Promise<VerifyResult>;

  /**
   * Process a refund for a completed payment.
   * @param paymentRef - The gateway reference for the original payment
   * @param amount - Optional partial refund amount (full refund if omitted)
   */
  refund(paymentRef: string, amount?: number): Promise<RefundResult>;
}
