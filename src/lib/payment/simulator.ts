/**
 * Simulator Payment Provider - BVI GovGate
 *
 * Default payment provider used in development/demo mode.
 * Simulates instant payment without connecting to any real gateway.
 * Always returns success with generated mock receipt and payment references.
 *
 * This provider handles ALL payment methods in simulation mode:
 * - credit_card: Simulates instant card payment
 * - bank_transfer: Simulates verified bank transfer
 * - cash: Simulates confirmed cash payment at office
 */

import type {
  PaymentProvider,
  CreatePaymentParams,
  PaymentResult,
  VerifyResult,
  RefundResult,
} from './providers';
import { generateReceiptNumber, generatePaymentRef } from './config';

export class SimulatorProvider implements PaymentProvider {
  name = 'simulator';
  method = 'credit_card' as const;

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    // Simulate a small delay to mimic real processing
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 700));

    const paymentRef = generatePaymentRef();
    const receiptNumber = generateReceiptNumber();

    // Log for debugging
    console.log(
      `[Simulator] Payment created: ${receiptNumber}`,
      `\n  Application: ${params.applicationId}`,
      `\n  Tracking:    ${params.trackingNumber}`,
      `\n  Amount:      ${params.currency} ${params.amount.toFixed(2)}`,
      `\n  Method:      credit_card`,
      `\n  Reference:   ${paymentRef}`,
    );

    return {
      success: true,
      paymentRef,
      receiptNumber,
      status: 'completed',
    };
  }

  async verifyPayment(paymentRef: string): Promise<VerifyResult> {
    // Simulator always reports as completed
    console.log(`[Simulator] Verifying payment: ${paymentRef}`);
    return {
      success: true,
      status: 'completed',
      gatewayRef: paymentRef,
    };
  }

  async refund(paymentRef: string, amount?: number): Promise<RefundResult> {
    const refundRef = `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    console.log(
      `[Simulator] Refund processed: ${refundRef}`,
      amount ? `\n  Amount: ${amount.toFixed(2)}` : '',
      `\n  Original Ref: ${paymentRef}`,
    );

    return {
      success: true,
      refundRef,
      amount,
    };
  }
}
