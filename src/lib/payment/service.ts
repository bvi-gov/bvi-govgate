/**
 * Payment Service - BVI GovGate
 *
 * Central service that manages payment providers and orchestrates
 * the payment lifecycle. Routes requests to the appropriate provider
 * based on configuration and payment method.
 *
 * Usage:
 *   const service = new PaymentService();
 *   const result = await service.processPayment({ ... });
 *
 * Configuration:
 *   PAYMENT_PROVIDER=simulator  (default - instant simulation)
 *   PAYMENT_PROVIDER=stripe     (future - real Stripe integration)
 *   PAYMENT_PROVIDER=paypal     (future - real PayPal integration)
 */

import type {
  PaymentProvider,
  CreatePaymentParams,
  PaymentResult,
  VerifyResult,
  RefundResult,
  PaymentMethod,
} from './providers';
import { SimulatorProvider } from './simulator';
import { providerConfig, currency, generateReceiptNumber, generatePaymentRef } from './config';

// ─── Provider Registry ───────────────────────────────────────────────────────
// Register all available providers here.
// Future: import and register StripeProvider, PayPalProvider, etc.

type ProviderConstructor = new () => PaymentProvider;

const providerRegistry: Record<string, ProviderConstructor> = {
  simulator: SimulatorProvider,
  // stripe: StripeProvider,    // TODO: Implement when Stripe SDK is installed
  // paypal: PayPalProvider,    // TODO: Implement when PayPal SDK is installed
};

// ─── Payment Service ─────────────────────────────────────────────────────────

export class PaymentService {
  private providers: Map<string, PaymentProvider> = new Map();

  constructor() {
    this.initializeProviders();
  }

  /**
   * Initialize the active provider(s) based on configuration.
   * Falls back to simulator if the configured provider is not registered.
   */
  private initializeProviders(): void {
    const activeName = providerConfig.activeProvider;

    if (activeName in providerRegistry) {
      const ProviderClass = providerRegistry[activeName];
      const provider = new ProviderClass();
      this.providers.set(activeName, provider);
      console.log(`[PaymentService] Initialized provider: ${activeName}`);
    } else {
      console.warn(
        `[PaymentService] Unknown provider "${activeName}", falling back to simulator`,
      );
      this.providers.set('simulator', new SimulatorProvider());
    }

    // Always ensure simulator is available as a fallback
    if (!this.providers.has('simulator')) {
      this.providers.set('simulator', new SimulatorProvider());
    }
  }

  /**
   * Get a provider by name.
   * Falls back to simulator if the requested provider is not available.
   */
  getProvider(name?: string): PaymentProvider {
    const key = name || providerConfig.activeProvider;
    const provider = this.providers.get(key);

    if (!provider) {
      console.warn(
        `[PaymentService] Provider "${key}" not found, falling back to simulator`,
      );
      return this.providers.get('simulator')!;
    }

    return provider;
  }

  /**
   * Process a payment through the configured provider.
   * This is the main entry point for citizen-facing payment initiation.
   */
  async processPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    const provider = this.getProvider(providerConfig.activeProvider);

    try {
      const result = await provider.createPayment({
        ...params,
        currency: params.currency || currency.code,
      });

      if (!result.success) {
        console.error(
          `[PaymentService] Payment failed for application ${params.applicationId}:`,
          result.error,
        );
      }

      return result;
    } catch (error) {
      console.error('[PaymentService] Payment processing error:', error);
      return {
        success: false,
        paymentRef: '',
        receiptNumber: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  /**
   * Verify the status of an existing payment.
   * Used for async flows (webhook confirmation, polling).
   */
  async verifyPayment(paymentRef: string, providerName?: string): Promise<VerifyResult> {
    const provider = this.getProvider(providerName);

    try {
      return await provider.verifyPayment(paymentRef);
    } catch (error) {
      console.error('[PaymentService] Payment verification error:', error);
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  /**
   * Process a refund for an existing payment.
   */
  async refundPayment(
    paymentRef: string,
    providerName?: string,
    amount?: number,
  ): Promise<RefundResult> {
    const provider = this.getProvider(providerName);

    try {
      return await provider.refund(paymentRef, amount);
    } catch (error) {
      console.error('[PaymentService] Refund processing error:', error);
      return {
        success: false,
        refundRef: '',
        error: error instanceof Error ? error.message : 'Refund failed',
      };
    }
  }

  /**
   * Admin-side manual payment verification.
   * This does NOT go through a payment provider — it directly records
   * that an admin has verified a payment (cash, bank transfer, etc.)
   *
   * This preserves backward compatibility with the existing admin flow.
   */
  createManualPaymentRecord(method: PaymentMethod, amount: number): {
    paymentRef: string;
    receiptNumber: string;
  } {
    const paymentRef = generatePaymentRef();
    const receiptNumber = generateReceiptNumber();

    console.log(
      `[PaymentService] Manual payment recorded by admin`,
      `\n  Method:  ${method}`,
      `\n  Amount:  ${currency.code} ${amount.toFixed(2)}`,
      `\n  Ref:     ${paymentRef}`,
      `\n  Receipt: ${receiptNumber}`,
    );

    return { paymentRef, receiptNumber };
  }

  /**
   * Get the name of the currently active provider.
   */
  getActiveProviderName(): string {
    return providerConfig.activeProvider;
  }
}

// ─── Singleton Export ─────────────────────────────────────────────────────────

let _instance: PaymentService | null = null;

/**
 * Get the singleton PaymentService instance.
 * Re-creates on each call to pick up environment changes during development.
 */
export function getPaymentService(): PaymentService {
  if (!_instance) {
    _instance = new PaymentService();
  }
  return _instance;
}
