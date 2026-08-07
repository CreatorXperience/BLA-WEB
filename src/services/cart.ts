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

interface RawCartItem {
  id: string;
  variantId?: string | null;
  productId?: string | null;
  productName?: string | null;
  slug?: string | null;
  sku?: string | null;
  color?: string | null;
  size?: string | null;
  imageUrl?: string | null;
  unitPrice?: string | number | null;
  compareAtPrice?: string | number | null;
  quantity: number;
  lineTotal?: string | number | null;
  inStock?: boolean;
}

interface RawCartTotals {
  subtotal?: number;
  discountTotal?: number;
  shippingTotal?: number;
  taxTotal?: number;
  grandTotal?: number;
  itemCount?: number;
  totalQuantity?: number;
  currency?: string;
}

interface RawCart {
  id: string;
  token: string;
  currency?: string;
  items?: RawCartItem[];
  totals?: RawCartTotals;
  coupon?: { code: string; discount?: number } | null;
  shipping?: { methodId?: string; methodName?: string; estimate?: number; available?: unknown[] } | null;
}

function toNumber(value: string | number | null | undefined): number {
  return typeof value === "string" ? Number(value) || 0 : Number(value ?? 0) || 0;
}

function normalizeCart(raw: RawCart): Cart {
  const totals = raw.totals ?? {};
  const items = (raw.items ?? []).map<CartItem>((item) => ({
    id: item.id,
    quantity: item.quantity,
    productId: item.productId ?? undefined,
    variantId: item.variantId ?? undefined,
    name: item.productName ?? undefined,
    slug: item.slug ?? undefined,
    image: item.imageUrl ?? undefined,
    color: item.color ?? undefined,
    size: item.size ?? undefined,
    unitPrice: toNumber(item.unitPrice),
    price: toNumber(item.unitPrice),
    compareAtPrice: item.compareAtPrice != null ? toNumber(item.compareAtPrice) : null,
    stockStatus: item.inStock === false ? "OUT_OF_STOCK" : "IN_STOCK",
    product: {
      id: item.productId ?? "",
      name: item.productName ?? "",
      slug: item.slug ?? "",
      imageUrl: item.imageUrl ?? undefined,
    },
  }));
  return {
    id: raw.id,
    token: raw.token,
    currency: raw.currency ?? totals.currency ?? "NGN",
    items,
    itemCount: totals.itemCount ?? items.length,
    subtotal: toNumber(totals.subtotal),
    discount: toNumber(totals.discountTotal),
    shippingRate: toNumber(totals.shippingTotal),
    shippingMethodId: raw.shipping?.methodId ?? null,
    shippingEstimate: raw.shipping
      ? {
          methodId: raw.shipping.methodId,
          name: raw.shipping.methodName,
          rate: raw.shipping.estimate,
          currency: raw.currency,
        }
      : null,
    tax: toNumber(totals.taxTotal),
    total: toNumber(totals.grandTotal),
    coupon: raw.coupon ?? null,
  };
}

export const cartService = {
  async get(country?: string): Promise<Cart> {
    const qs = country ? `?country=${encodeURIComponent(country)}` : "";
    const res = await apiClient<ApiResponse<RawCart>>(`/cart${qs}`, { cartToken: true, auth: true });
    return normalizeCart(unwrap(res));
  },

  async count(): Promise<{ count: number }> {
    const res = await apiClient<ApiResponse<{ count: number }>>("/cart/count", { cartToken: true, auth: true });
    return unwrap(res);
  },

  async addItem(input: AddToCartInput): Promise<Cart> {
    const res = await apiClient<ApiResponse<RawCart>>("/cart/items", {
      method: "POST",
      body: { variantId: input.variantId, quantity: input.quantity },
      cartToken: true,
      auth: true,
    });
    return normalizeCart(unwrap(res));
  },

  async updateItem(itemId: string, input: UpdateCartInput): Promise<Cart> {
    const res = await apiClient<ApiResponse<RawCart>>(`/cart/items/${itemId}`, {
      method: "PATCH",
      body: input,
      cartToken: true,
      auth: true,
    });
    return normalizeCart(unwrap(res));
  },

  async removeItem(itemId: string): Promise<Cart> {
    const res = await apiClient<ApiResponse<RawCart>>(`/cart/items/${itemId}`, {
      method: "DELETE",
      cartToken: true,
      auth: true,
    });
    return normalizeCart(unwrap(res));
  },

  async clear(): Promise<Cart> {
    const res = await apiClient<ApiResponse<RawCart>>("/cart", {
      method: "DELETE",
      cartToken: true,
      auth: true,
    });
    return normalizeCart(unwrap(res));
  },

  async applyCoupon(code: string): Promise<Cart> {
    const res = await apiClient<ApiResponse<RawCart>>("/cart/coupon", {
      method: "POST",
      body: { code },
      cartToken: true,
      auth: true,
    });
    return normalizeCart(unwrap(res));
  },

  async removeCoupon(): Promise<Cart> {
    const res = await apiClient<ApiResponse<RawCart>>("/cart/coupon", {
      method: "DELETE",
      cartToken: true,
      auth: true,
    });
    return normalizeCart(unwrap(res));
  },

  async setShipping(methodId: string, country: string): Promise<Cart> {
    const res = await apiClient<ApiResponse<RawCart>>("/cart/shipping", {
      method: "POST",
      body: { methodId, country },
      cartToken: true,
      auth: true,
    });
    return normalizeCart(unwrap(res));
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