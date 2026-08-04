import { apiClient, unwrap } from "./client";
import type { ApiResponse } from "@/types/api";
import type { Category, Collection } from "@/types/catalog";
import type { Product, ProductListResult, ProductQuery } from "@/types/product";

function queryString(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const productService = {
  async list(query: ProductQuery): Promise<ProductListResult> {
    const res = await apiClient<ApiResponse<{ items: Product[]; nextCursor: string | null; total?: number }>>(
      `/products${queryString({ ...query })}`,
    );
    const data = unwrap(res);
    return { items: data.items, nextCursor: data.nextCursor, hasMore: Boolean(data.nextCursor), total: data.total };
  },

  async bySlug(slug: string): Promise<Product> {
    const res = await apiClient<ApiResponse<Product>>(`/products/slug/${slug}`);
    return unwrap(res);
  },

  async related(productId: string): Promise<Product[]> {
    const res = await apiClient<ApiResponse<Product[]>>(`/products/${productId}/related`);
    return unwrap(res);
  },

  async featured(): Promise<Product[]> {
    const res = await apiClient<ApiResponse<Product[]>>("/products/featured");
    return unwrap(res);
  },

  async bestSellers(): Promise<Product[]> {
    const res = await apiClient<ApiResponse<Product[]>>("/products/best-sellers");
    return unwrap(res);
  },

  async newArrivals(): Promise<Product[]> {
    const res = await apiClient<ApiResponse<Product[]>>("/products/new-arrivals");
    return unwrap(res);
  },

  async trending(): Promise<Product[]> {
    const res = await apiClient<ApiResponse<Product[]>>("/products/trending");
    return unwrap(res);
  },
};

export const collectionService = {
  async list(): Promise<Collection[]> {
    const res = await apiClient<ApiResponse<Collection[]>>("/collections");
    return unwrap(res);
  },

  async bySlug(slug: string): Promise<Collection> {
    const res = await apiClient<ApiResponse<Collection>>(`/collections/${slug}`);
    return unwrap(res);
  },

  async products(collectionId: string, query: ProductQuery): Promise<ProductListResult> {
    return productService.list({ ...query, collection: collectionId });
  },
};

export const categoryService = {
  async list(): Promise<Category[]> {
    const res = await apiClient<ApiResponse<Category[]>>("/categories");
    return unwrap(res);
  },

  async bySlug(slug: string): Promise<Category> {
    const res = await apiClient<ApiResponse<Category>>(`/categories/${slug}`);
    return unwrap(res);
  },
};
