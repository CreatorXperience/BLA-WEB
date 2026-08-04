import { apiClient, unwrap } from "./client";
import type { ApiResponse } from "@/types/api";
import type { Order, OrderPaged } from "@/types/order";
import type { Address, AddressInput } from "@/types/address";
import type { Product } from "@/types/product";
import type { WishlistItem } from "@/types/misc";

export const ordersService = {
  async list(page = 1, perPage = 10): Promise<OrderPaged> {
    const res = await apiClient<ApiResponse<{ data: Order[]; total: number; page: number; perPage: number }>>(
      `/me/orders?page=${page}&perPage=${perPage}`,
      { auth: true },
    );
    return unwrap(res);
  },

  async byId(id: string): Promise<Order> {
    const res = await apiClient<ApiResponse<Order>>(`/me/orders/${id}`, { auth: true });
    return unwrap(res);
  },

  async track(orderNumber: string): Promise<Order> {
    const res = await apiClient<ApiResponse<Order>>(`/orders/track/${orderNumber}`);
    return unwrap(res);
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
