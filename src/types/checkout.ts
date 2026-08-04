import type { AddressInput } from "./address";

export interface CheckoutPayload {
  shippingAddress: AddressInput;
  billingAddress?: AddressInput;
  billingSameAsShipping?: boolean;
  email: string;
  couponCode?: string;
  shippingMethodId?: string;
  currency?: string;
  customerNote?: string;
}

export interface CheckoutPreview {
  subtotal: number;
  discount: number;
  shippingRate: number;
  tax: number;
  total: number;
  currency: string;
  items: unknown[];
}

export interface ShippingOption {
  id: string;
  name: string;
  baseRate: number;
  freeAbove?: number | null;
  estimatedDaysMin?: number | null;
  estimatedDaysMax?: number | null;
  isPickup?: boolean;
}

export interface PlacedOrder {
  order: {
    id: string;
    orderNumber: string;
    total: number;
    currency: string;
    status: string;
  };
  payment?: {
    reference: string;
    provider: "paystack" | "flutterwave";
    authorizationUrl?: string | null;
    status?: string;
  };
}

export type PaymentProvider = "paystack" | "flutterwave";

export interface InitializePaymentPayload {
  orderId: string;
  provider: PaymentProvider;
  callbackUrl?: string;
}

export interface PaymentInitResult {
  reference: string;
  provider: PaymentProvider;
  authorizationUrl?: string | null;
  status?: string;
  orderId?: string;
  orderNumber?: string;
}
