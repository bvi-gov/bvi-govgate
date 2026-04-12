/**
 * Payment Configuration - BVI GovGate
 *
 * Centralized configuration for payment methods, currency settings,
 * and tax handling. All values can be overridden via environment variables.
 */

import type { PaymentMethod } from './providers';

// ─── Currency Settings ───────────────────────────────────────────────────────

export interface CurrencyConfig {
  /** ISO 4217 currency code */
  code: string;
  /** Display symbol */
  symbol: string;
  /** Symbol placement: 'prefix' ($100) or 'suffix' (100$) */
  placement: 'prefix' | 'suffix';
  /** Decimal places */
  decimals: number;
  /** Thousand separator */
  thousandsSeparator: string;
  /** Decimal separator */
  decimalSeparator: string;
}

export const currency: CurrencyConfig = {
  code: process.env.PAYMENT_CURRENCY_CODE || 'USD',
  symbol: process.env.PAYMENT_CURRENCY_SYMBOL || '$',
  placement: 'prefix',
  decimals: 2,
  thousandsSeparator: ',',
  decimalSeparator: '.',
};

// ─── Tax Settings ────────────────────────────────────────────────────────────

export interface TaxConfig {
  /** Whether tax is enabled */
  enabled: boolean;
  /** Tax rate as a decimal (e.g., 0.05 for 5%) */
  rate: number;
  /** Tax label shown to citizens */
  label: string;
  /** Whether tax is included in displayed price */
  includedInPrice: boolean;
}

export const tax: TaxConfig = {
  enabled: process.env.PAYMENT_TAX_ENABLED === 'true',
  rate: parseFloat(process.env.PAYMENT_TAX_RATE || '0'),
  label: process.env.PAYMENT_TAX_LABEL || 'Service Fee',
  includedInPrice: process.env.PAYMENT_TAX_INCLUDED === 'true',
};

// ─── Payment Method Config ───────────────────────────────────────────────────

export interface PaymentMethodConfig {
  /** Payment method key */
  method: PaymentMethod;
  /** Display name shown to citizens */
  displayName: string;
  /** Whether this method is currently available */
  available: boolean;
  /** Processing fee percentage (e.g., 0.029 = 2.9%) */
  feePercentage: number;
  /** Fixed processing fee in currency units (e.g., 0.30) */
  feeFixed: number;
  /** Whether this method supports online payment (vs. in-person) */
  onlinePayment: boolean;
  /** Description shown when selected */
  description: string;
  /** Icon identifier (Lucide icon name) */
  iconName: string;
}

export const paymentMethods: Record<PaymentMethod, PaymentMethodConfig> = {
  credit_card: {
    method: 'credit_card',
    displayName: 'Credit / Debit Card',
    available: true,
    feePercentage: 0.029,
    feeFixed: 0.30,
    onlinePayment: true,
    description: 'Visa, Mastercard, or American Express',
    iconName: 'CreditCard',
  },
  bank_transfer: {
    method: 'bank_transfer',
    displayName: 'Bank Transfer',
    available: true,
    feePercentage: 0,
    feeFixed: 0,
    onlinePayment: false,
    description: 'Transfer to Government of the Virgin Islands account',
    iconName: 'Building',
  },
  cash: {
    method: 'cash',
    displayName: 'Cash at Office',
    available: true,
    feePercentage: 0,
    feeFixed: 0,
    onlinePayment: false,
    description: 'Pay in person at the relevant government office',
    iconName: 'Banknote',
  },
  paypal: {
    method: 'paypal',
    displayName: 'PayPal',
    available: false, // Enable when PayPal provider is implemented
    feePercentage: 0.034,
    feeFixed: 0.30,
    onlinePayment: true,
    description: 'Pay with your PayPal account',
    iconName: 'Wallet',
  },
};

// ─── Provider Settings ───────────────────────────────────────────────────────

export interface ProviderConfig {
  /** Active provider name (set via PAYMENT_PROVIDER env var) */
  activeProvider: string;
  /** Gateway environment */
  environment: 'development' | 'staging' | 'production';
  /** Webhook base URL for receiving gateway callbacks */
  webhookBaseUrl: string;
  /** Webhook signing secret (per gateway) */
  webhookSecrets: Record<string, string>;
}

export const providerConfig: ProviderConfig = {
  activeProvider: process.env.PAYMENT_PROVIDER || 'simulator',
  environment: (process.env.PAYMENT_ENVIRONMENT as ProviderConfig['environment']) || 'development',
  webhookBaseUrl: process.env.PAYMENT_WEBHOOK_BASE_URL || '',
  webhookSecrets: {
    stripe: process.env.STRIPE_WEBHOOK_SECRET || '',
    paypal: process.env.PAYPAL_WEBHOOK_SECRET || '',
  },
};

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Format an amount for display using the configured currency.
 * Example: formatCurrency(50) => "$50.00"
 */
export function formatCurrency(amount: number): string {
  const formatted = amount
    .toFixed(currency.decimals)
    .replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandsSeparator)
    .replace('.', currency.decimalSeparator);

  if (currency.placement === 'prefix') {
    return `${currency.symbol}${formatted}`;
  }
  return `${formatted}${currency.symbol}`;
}

/**
 * Calculate the total amount including processing fees.
 * For BVI GovGate, processing fees are absorbed (shown as $0.00 to citizens).
 */
export function calculateTotal(amount: number, method: PaymentMethod): {
  subtotal: number;
  fee: number;
  tax: number;
  total: number;
} {
  const methodConfig = paymentMethods[method];
  const fee = amount * methodConfig.feePercentage + methodConfig.feeFixed;
  const taxAmount = tax.enabled && !tax.includedInPrice ? amount * tax.rate : 0;

  return {
    subtotal: amount,
    fee, // Internal tracking; citizens see $0.00
    tax: taxAmount,
    total: amount + taxAmount, // Fees are absorbed by gov
  };
}

/**
 * Generate a receipt number in the format RCP-XXXXXXXX
 */
export function generateReceiptNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RCP-${timestamp}-${random}`;
}

/**
 * Generate a payment reference number in the format PAY-XXXXXXXX
 */
export function generatePaymentRef(): string {
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `PAY-${random}`;
}

/**
 * Get a list of payment methods available for citizen-facing selection.
 */
export function getAvailablePaymentMethods(): PaymentMethodConfig[] {
  return Object.values(paymentMethods).filter((m) => m.available);
}
