import { apiClient, unwrap } from "./client";
import type { ApiResponse } from "@/types/api";
import type { Product } from "@/types/product";
import type { SearchAutocomplete } from "@/types/misc";

export const searchService = {
  async search(q: string, cursor?: string, limit = 20): Promise<{ items: Product[]; total: number }> {
    const qs = new URLSearchParams({ q, limit: String(limit) });
    if (cursor) qs.set("cursor", cursor);
    const res = await apiClient<ApiResponse<{ items: Product[]; total: number }>>(`/search?${qs}`);
    return unwrap(res);
  },

  async autocomplete(q: string): Promise<SearchAutocomplete> {
    const res = await apiClient<ApiResponse<SearchAutocomplete>>(`/search/autocomplete?q=${encodeURIComponent(q)}`);
    return unwrap(res);
  },

  async trending(): Promise<string[]> {
    const res = await apiClient<ApiResponse<string[]>>("/search/trending");
    return unwrap(res);
  },
};
