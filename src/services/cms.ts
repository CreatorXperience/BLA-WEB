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

  async publicSettings(): Promise<Record<string, string>> {
    const res = await apiClient<ApiResponse<Record<string, string>>>("/cms/settings/public");
    return unwrap(res);
  },

  async page(slug: string): Promise<CmsPage> {
    const res = await apiClient<ApiResponse<CmsPage>>(`/cms/pages/${slug}`);
    return unwrap(res);
  },
};
