import { apiClient, unwrap } from "./client";
import type { ApiResponse } from "@/types/api";
import type { Announcement, CmsPage, HomepageContent, NavItem } from "@/types/cms";

export const cmsService = {
  async homepage(): Promise<HomepageContent> {
    const res = await apiClient<ApiResponse<HomepageContent>>("/cms/homepage");
    return unwrap(res);
  },

  async announcement(): Promise<Announcement | null> {
    const res = await apiClient<ApiResponse<Announcement>>("/cms/announcement");
    return unwrap(res);
  },

  async navigation(): Promise<NavItem[]> {
    const res = await apiClient<ApiResponse<NavItem[]>>("/cms/navigation");
    return unwrap(res);
  },

  async publicSettings(): Promise<Record<string, unknown>> {
    const res = await apiClient<ApiResponse<Record<string, unknown>>>("/cms/settings/public");
    return unwrap(res);
  },

  async contentPage<T>(key: string, fallback: T): Promise<T> {
    try {
      const all = await this.publicSettings();
      const raw = all[`content.${key}`];
      if (raw && typeof raw === "object") return raw as T;
    } catch {
      /* ignore, fall back */
    }
    return fallback;
  },

  async page(slug: string): Promise<CmsPage> {
    const res = await apiClient<ApiResponse<CmsPage>>(`/cms/pages/${slug}`);
    return unwrap(res);
  },
};
