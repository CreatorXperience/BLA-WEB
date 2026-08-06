"use client";

import { useQuery } from "@tanstack/react-query";
import { cmsService } from "@/services/cms";
import { categoryService, collectionService, productService } from "@/services/products";
import { searchService } from "@/services/search";
import type { ProductQuery } from "@/types/product";

export const qk = {
  homepage: ["cms", "homepage"] as const,
  announcement: ["cms", "announcement"] as const,
  navigation: ["cms", "navigation"] as const,
  cmsPage: (slug: string) => ["cms", "page", slug] as const,
  collections: ["collections"] as const,
  collection: (slug: string) => ["collections", slug] as const,
  categories: ["categories"] as const,
  products: (query: ProductQuery) => ["products", query] as const,
  product: (slug: string) => ["products", "slug", slug] as const,
  related: (id: string) => ["products", "related", id] as const,
  featured: ["products", "featured"] as const,
  bestSellers: ["products", "best-sellers"] as const,
  newArrivals: ["products", "new-arrivals"] as const,
  trending: ["products", "trending"] as const,
  trendingSearches: ["search", "trending"] as const,
  autocomplete: (q: string) => ["search", "autocomplete", q] as const,
  search: (q: string, cursor?: string) => ["search", q, cursor ?? ""] as const,
};

export function useHomepage() {
  return useQuery({ queryKey: qk.homepage, queryFn: cmsService.homepage, staleTime: 60_000 });
}

export function useAnnouncement() {
  return useQuery({ queryKey: qk.announcement, queryFn: cmsService.announcement, staleTime: 60_000 });
}

export function useNavigation() {
  return useQuery({ queryKey: qk.navigation, queryFn: cmsService.navigation, staleTime: 60_000 });
}

export function useCmsPage(slug: string) {
  return useQuery({ queryKey: qk.cmsPage(slug), queryFn: () => cmsService.page(slug) });
}

export function useContentPage<T>(key: string, fallback: T) {
  return useQuery<T>({
    queryKey: ["cms", "content", key] as const,
    queryFn: () => cmsService.contentPage<T>(key, fallback),
    staleTime: 60_000,
  });
}

export function useProducts(query: ProductQuery) {
  return useQuery({ queryKey: qk.products(query), queryFn: () => productService.list(query), placeholderData: (prev) => prev });
}

export function useProduct(slug: string) {
  return useQuery({ queryKey: qk.product(slug), queryFn: () => productService.bySlug(slug) });
}

export function useRelated(productId: string | undefined) {
  return useQuery({
    queryKey: qk.related(productId ?? ""),
    queryFn: () => productService.related(productId as string),
    enabled: Boolean(productId),
  });
}

export function useFeatured() {
  return useQuery({ queryKey: qk.featured, queryFn: productService.featured });
}

export function useBestSellers() {
  return useQuery({ queryKey: qk.bestSellers, queryFn: productService.bestSellers });
}

export function useNewArrivals() {
  return useQuery({ queryKey: qk.newArrivals, queryFn: productService.newArrivals });
}

export function useTrendingProducts() {
  return useQuery({ queryKey: qk.trending, queryFn: productService.trending });
}

export function useTrendingSearches() {
  return useQuery({ queryKey: qk.trendingSearches, queryFn: searchService.trending, staleTime: 300_000 });
}

export function useCollections() {
  return useQuery({ queryKey: qk.collections, queryFn: collectionService.list });
}

export function useCollection(slug: string) {
  return useQuery({ queryKey: qk.collection(slug), queryFn: () => collectionService.bySlug(slug) });
}

export function useCategories() {
  return useQuery({ queryKey: qk.categories, queryFn: categoryService.list });
}

export function useAutocomplete(q: string) {
  return useQuery({
    queryKey: qk.autocomplete(q),
    queryFn: () => searchService.autocomplete(q),
    enabled: q.trim().length >= 2,
    staleTime: 30_000,
  });
}
