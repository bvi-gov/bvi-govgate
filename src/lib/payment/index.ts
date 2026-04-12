/**
 * Payment Module - BVI GovGate
 *
 * Re-exports all payment infrastructure for convenient imports:
 *
 *   import { PaymentService, getPaymentService } from '@/lib/payment';
 *   import type { PaymentProvider, PaymentResult } from '@/lib/payment';
 */

// Provider interface & types
export type {
  PaymentProvider,
  PaymentMethod,
  PaymentStatus,
  CreatePaymentParams,
  PaymentResult,
  VerifyResult,
  RefundResult,
} from './providers';

// Configuration
export {
  currency,
  tax,
  paymentMethods,
  providerConfig,
  formatCurrency,
  calculateTotal,
  generateReceiptNumber,
  generatePaymentRef,
  getAvailablePaymentMethods,
} from './config';

export type { CurrencyConfig, TaxConfig, PaymentMethodConfig, ProviderConfig } from './config';

// Service
export { PaymentService, getPaymentService } from './service';

// Simulator (available for direct use if needed)
export { SimulatorProvider } from './simulator';
