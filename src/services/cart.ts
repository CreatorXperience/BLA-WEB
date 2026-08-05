import { apiClient, unwrap } from "./client";
import type { ApiResponse } from "@/types/api";
import type { Cart, CartItem } from "@/types/cart";

export interface AddToCartInput {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface UpdateCartInput {
  quantity?: number;
}

export const cartService = {
  async get(country?: string): Promise<Cart> {
    const qs = country ? `?country=${encodeURIComponent(country)}` : "";
    const res = await apiClient<ApiResponse<Cart>>(`/cart${qs}`, { cartToken: true, auth: true });
    return unwrap(res);
  },

  async count(): Promise<{ count: number }> {
    const res = await apiClient<ApiResponse<{ count: number }>>("/cart/count", { cartToken: true, auth: true });
    return unwrap(res);
  },

  async addItem(input: AddToCartInput): Promise<Cart> {
    const res = await apiClient<ApiResponse<Cart>>("/cart/items", {
      method: "POST",
      body: { variantId: input.variantId, quantity: input.quantity },
      cartToken: true,
      auth: true,
    });
    return unwrap(res);
  },

  async updateItem(itemId: string, input: UpdateCartInput): Promise<Cart> {
    const res = await apiClient<ApiResponse<Cart>>(`/cart/items/${itemId}`, {
      method: "PATCH",
      body: input,
      cartToken: true,
      auth: true,
    });
    return unwrap(res);
  },

  async removeItem(itemId: string): Promise<Cart> {
    const res = await apiClient<ApiResponse<Cart>>(`/cart/items/${itemId}`, {
      method: "DELETE",
      cartToken: true,
      auth: true,
    });
    return unwrap(res);
  },

  async clear(): Promise<Cart> {
    const res = await apiClient<ApiResponse<Cart>>("/cart", {
      method: "DELETE",
      cartToken: true,
      auth: true,
    });
    return unwrap(res);
  },

  async applyCoupon(code: string): Promise<Cart> {
    const res = await apiClient<ApiResponse<Cart>>("/cart/coupon", {
      method: "POST",
      body: { code },
      cartToken: true,
      auth: true,
    });
    return unwrap(res);
  },

  async removeCoupon(): Promise<Cart> {
    const res = await apiClient<ApiResponse<Cart>>("/cart/coupon", {
      method: "DELETE",
      cartToken: true,
      auth: true,
    });
    return unwrap(res);
  },

  async setShipping(methodId: string, country: string): Promise<Cart> {
    const res = await apiClient<ApiResponse<Cart>>("/cart/shipping", {
      method: "POST",
      body: { methodId, country },
      cartToken: true,
      auth: true,
    });
    return unwrap(res);
  },

  toTokenString(items?: CartItem[]): string {
    return items?.map((i) => `${i.variantId ?? i.id}:${i.quantity}`).join("|") ?? "";
  },
};

export const shippingService = {
  async options(country: string): Promise<unknown[]> {
    const res = await apiClient<ApiResponse<unknown[]>>("/shipping/estimate", {
      method: "POST",
      body: { country },
    });
    return unwrap(res);
  },
};