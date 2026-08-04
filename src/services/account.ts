import { apiClient, unwrap } from "./client";
import type { ApiResponse } from "@/types/api";
import type { Order, OrderPaged } from "@/types/order";
import type { Address, AddressInput } from "@/types/address";
import type { Product } from "@/types/product";
import type { WishlistItem } from "@/types/misc";

/** Map the backend Order fields to the client Order shape. */
function mapOrder(raw: Record<string, unknown>): Order {
  const items = Array.isArray(raw.items)
    ? (raw.items as Array<Record<string, unknown>>).map((i) => ({
        id: String(i.id ?? ""),
        productId: i.productId != null ? String(i.productId) : undefined,
        variantId: i.variantId != null ? String(i.variantId) : undefined,
        productName: String(i.productName ?? i.name ?? "Item"),
        sku: i.sku != null ? String(i.sku) : undefined,
        imageUrl: i.imageUrl != null ? String(i.imageUrl) : undefined,
        color: i.color != null ? String(i.color) : undefined,
        size: i.size != null ? String(i.size) : undefined,
        quantity: Number(i.quantity ?? 1),
        unitPrice: Number(i.unitPrice ?? i.price ?? 0),
        lineTotal: Number(i.totalPrice ?? i.lineTotal ?? 0),
      }))
    : [];
  return {
    id: String(raw.id),
    orderNumber: String(raw.orderNumber),
    status: raw.status as Order["status"],
    items,
    subtotal: Number(raw.subtotal ?? 0),
    discount: Number(raw.discountTotal ?? 0),
    shippingRate: Number(raw.shippingTotal ?? 0),
    tax: Number(raw.taxTotal ?? 0),
    total: Number(raw.grandTotal ?? raw.total ?? 0),
    currency: String(raw.currency ?? "NGN"),
    shippingAddress: raw.shippingAddress as Order["shippingAddress"],
    billingAddress: raw.billingAddress as Order["billingAddress"],
    trackingNumber: raw.trackingNumber != null ? String(raw.trackingNumber) : null,
    timeline: raw.timeline as Order["timeline"],
    couponCode: raw.couponCode != null ? String(raw.couponCode) : null,
    createdAt: String(raw.createdAt),
  };
}

export const ordersService = {
  async list(page = 1, perPage = 10): Promise<OrderPaged> {
    const res = await apiClient<ApiResponse<Array<Record<string, unknown>>>>(`/me/orders?page=${page}&perPage=${perPage}`, { auth: true });
    return {
      data: (res.data ?? []).map(mapOrder),
      total: res.meta?.pagination?.total ?? (res.data ?? []).length,
      page: res.meta?.pagination?.page ?? page,
      perPage: res.meta?.pagination?.perPage ?? perPage,
    };
  },

  async byId(id: string): Promise<Order> {
    const res = await apiClient<ApiResponse<Record<string, unknown>>>(`/me/orders/${id}`, { auth: true });
    return mapOrder(res.data);
  },

  async track(orderNumber: string): Promise<Order> {
    const res = await apiClient<ApiResponse<Record<string, unknown>>>(`/orders/track/${orderNumber}`);
    return mapOrder(res.data);
  },

  async invoice(id: string): Promise<Blob> {
    return apiClient<Blob>(`/me/orders/${id}/invoice`, { auth: true });
  },
};

export const addressesService = {
  async list(): Promise<Address[]> {
    const res = await apiClient<ApiResponse<Address[]>>("/me/addresses", { auth: true });
    return unwrap(res);
  },

  async create(input: AddressInput): Promise<Address> {
    const res = await apiClient<ApiResponse<Address>>("/me/addresses", {
      method: "POST",
      body: input,
      auth: true,
    });
    return unwrap(res);
  },

  async update(id: string, input: AddressInput): Promise<Address> {
    const res = await apiClient<ApiResponse<Address>>(`/me/addresses/${id}`, {
      method: "PATCH",
      body: input,
      auth: true,
    });
    return unwrap(res);
  },

  async remove(id: string): Promise<void> {
    await apiClient(`/me/addresses/${id}`, { method: "DELETE", auth: true });
  },
};

export const wishlistService = {
  async list(): Promise<WishlistItem[]> {
    const res = await apiClient<ApiResponse<WishlistItem[]>>("/me/wishlist", { auth: true });
    return unwrap(res);
  },

  async add(productId: string): Promise<unknown> {
    const res = await apiClient<ApiResponse<unknown>>("/me/wishlist", {
      method: "POST",
      body: { productId },
      auth: true,
    });
    return unwrap(res);
  },

  async remove(productId: string): Promise<unknown> {
    const res = await apiClient<ApiResponse<unknown>>(`/me/wishlist/${productId}`, {
      method: "DELETE",
      auth: true,
    });
    return unwrap(res);
  },

  async moveToCart(productId: string, variantId: string, quantity = 1): Promise<unknown> {
    const res = await apiClient<ApiResponse<unknown>>(`/me/wishlist/${productId}/move-to-cart`, {
      method: "POST",
      body: { variantId, quantity },
      auth: true,
      cartToken: true,
    });
    return unwrap(res);
  },
};

export const recentlyViewedService = {
  async list(): Promise<Product[]> {
    const res = await apiClient<ApiResponse<Product[]>>("/products/recently-viewed");
    return unwrap(res);
  },
};
