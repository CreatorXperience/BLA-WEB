import { apiClient, unwrap } from "./client";
import type { ApiResponse } from "@/types/api";
import type { CheckoutPayload, CheckoutPreview, PaymentInitResult, PaymentProvider, PlacedOrder, ShippingOption } from "@/types/checkout";

export const checkoutService = {
  async preview(payload: CheckoutPayload): Promise<CheckoutPreview> {
    const res = await apiClient<ApiResponse<CheckoutPreview>>("/checkout/preview", {
      method: "POST",
      body: payload,
      cartToken: true,
    });
    return unwrap(res);
  },

  async shippingOptions(country: string): Promise<ShippingOption[]> {
    const res = await apiClient<ApiResponse<{ methods: ShippingOption[] }>>("/checkout/shipping-options", {
      method: "POST",
      body: { country },
      cartToken: true,
    });
    return unwrap(res).methods.map((m) => ({
      ...m,
      baseRate: Number(m.baseRate),
      freeAbove: m.freeAbove == null ? null : Number(m.freeAbove),
    }));
  },

  async placeOrder(payload: CheckoutPayload): Promise<PlacedOrder> {
    const res = await apiClient<ApiResponse<PlacedOrder>>("/checkout/place-order", {
      method: "POST",
      body: payload,
      cartToken: true,
      auth: true,
    });
    return unwrap(res);
  },
};

export const paymentsService = {
  async initialize(orderId: string, provider: PaymentProvider): Promise<PaymentInitResult> {
    const res = await apiClient<ApiResponse<PaymentInitResult>>("/payments/initialize", {
      method: "POST",
      body: { orderId, provider },
    });
    return unwrap(res);
  },

  async verify(reference: string): Promise<PaymentInitResult> {
    const res = await apiClient<ApiResponse<PaymentInitResult>>("/payments/verify", {
      method: "POST",
      body: { reference },
    });
    return unwrap(res);
  },
};
