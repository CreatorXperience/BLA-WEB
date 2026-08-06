import { apiClient, unwrap } from "./client";
import type { ApiResponse } from "@/types/api";
import type { Collection } from "@/types/catalog";
import type {
  AdminOrderDetail,
  AdminOrderListItem,
  AdminOrderQuery,
  AdminOrderPaged,
  AdminProduct,
  AdminProductList,
  AdminProductQuery,
  AdminUser,
  AdminUserPaged,
  AdminUserQuery,
  AuditLogEntry,
  AuditLogQuery,
  Coupon,
  CouponInput,
  CouponPaged,
  DashboardOverview,
  HomepageSectionAdmin,
  StoreSettingAdmin,
  AnnouncementAdmin,
  NavItemAdmin,
  CmsPageAdmin,
  ProductFlagsInput,
} from "@/types/admin";

const auth = { auth: true } as const;

export const adminDashboardService = {
  async overview(): Promise<DashboardOverview> {
    const res = await apiClient<ApiResponse<DashboardOverview>>("/dashboard/overview", auth);
    return unwrap(res);
  },
};

export const adminProductService = {
  async list(query: AdminProductQuery = {}): Promise<AdminProductList> {
    const qs = new URLSearchParams();
    if (query.page) qs.set("page", String(query.page));
    if (query.perPage) qs.set("perPage", String(query.perPage));
    if (query.status) qs.set("status", query.status);
    if (query.q) qs.set("q", query.q);
    if (query.sort) qs.set("sort", query.sort);
    const res = await apiClient<ApiResponse<AdminProductList>>(`/products/admin${qs.size ? `?${qs}` : ""}`, auth);
    return unwrap(res);
  },

  async byId(id: string): Promise<AdminProduct> {
    const res = await apiClient<ApiResponse<AdminProduct>>(`/products/admin/${id}`, auth);
    return unwrap(res);
  },

  async stats() {
    const res = await apiClient<ApiResponse<unknown>>("/products/admin/stats", auth);
    return unwrap(res);
  },

  async create(input: Record<string, unknown>): Promise<AdminProduct> {
    const res = await apiClient<ApiResponse<AdminProduct>>("/products/admin", { ...auth, method: "POST", body: input });
    return unwrap(res);
  },

  async update(id: string, input: Record<string, unknown>): Promise<AdminProduct> {
    const res = await apiClient<ApiResponse<AdminProduct>>(`/products/admin/${id}`, { ...auth, method: "PATCH", body: input });
    return unwrap(res);
  },

  async flags(id: string, input: ProductFlagsInput): Promise<AdminProduct> {
    const res = await apiClient<ApiResponse<AdminProduct>>(`/products/admin/${id}/flags`, { ...auth, method: "PATCH", body: input });
    return unwrap(res);
  },

  async publish(id: string, input: { publishAt?: string | null }): Promise<AdminProduct> {
    const res = await apiClient<ApiResponse<AdminProduct>>(`/products/admin/${id}/schedule`, { ...auth, method: "POST", body: input });
    return unwrap(res);
  },

  async archive(id: string): Promise<AdminProduct> {
    const res = await apiClient<ApiResponse<AdminProduct>>(`/products/admin/${id}/archive`, { ...auth, method: "POST" });
    return unwrap(res);
  },

  async restore(id: string): Promise<AdminProduct> {
    const res = await apiClient<ApiResponse<AdminProduct>>(`/products/admin/${id}/restore`, { ...auth, method: "POST" });
    return unwrap(res);
  },

  async duplicate(id: string): Promise<AdminProduct> {
    const res = await apiClient<ApiResponse<AdminProduct>>(`/products/admin/${id}/duplicate`, { ...auth, method: "POST" });
    return unwrap(res);
  },

  async remove(id: string): Promise<void> {
    await apiClient(`/products/admin/${id}`, { ...auth, method: "DELETE" });
  },
};

export const adminOrderService = {
  async list(query: AdminOrderQuery = {}): Promise<AdminOrderPaged> {
    const qs = new URLSearchParams();
    if (query.page) qs.set("page", String(query.page));
    if (query.perPage) qs.set("perPage", String(query.perPage));
    if (query.status) qs.set("status", query.status);
    if (query.q) qs.set("q", query.q);
    if (query.sort) qs.set("sort", query.sort);
    if (query.from) qs.set("from", query.from);
    if (query.to) qs.set("to", query.to);
    const res = await apiClient<ApiResponse<AdminOrderListItem[]>>(`/orders/admin${qs.size ? `?${qs}` : ""}`, auth);
    const items = unwrap(res).map((o) => ({
      ...o,
      customer:
        o.customer ??
        ((o.user ? `${o.user.firstName ?? ""} ${o.user.lastName ?? ""}`.trim() : "") || o.email || ""),
      itemCount: o.itemCount ?? o.items?.length ?? 0,
    }));
    return {
      items,
      total: res.meta?.pagination?.total ?? 0,
      page: res.meta?.pagination?.page ?? query.page ?? 1,
      perPage: res.meta?.pagination?.perPage ?? query.perPage ?? 20,
    };
  },

  async stats() {
    const res = await apiClient<ApiResponse<unknown>>("/orders/admin/stats", auth);
    return unwrap(res);
  },

  async byId(id: string): Promise<AdminOrderDetail> {
    const res = await apiClient<ApiResponse<AdminOrderDetail>>(`/orders/admin/${id}`, auth);
    return unwrap(res);
  },

  async updateStatus(
    id: string,
    input: { status: string; reason?: string; trackingNumber?: string; courier?: string; notifyCustomer?: boolean },
  ): Promise<AdminOrderDetail> {
    const res = await apiClient<ApiResponse<AdminOrderDetail>>(`/orders/admin/${id}/status`, { ...auth, method: "PATCH", body: input });
    return unwrap(res);
  },

  async addNote(id: string, note: string): Promise<AdminOrderDetail> {
    const res = await apiClient<ApiResponse<AdminOrderDetail>>(`/orders/admin/${id}/notes`, { ...auth, method: "POST", body: { note } });
    return unwrap(res);
  },
};

export const adminUserService = {
  async list(query: AdminUserQuery = {}): Promise<AdminUserPaged> {
    const qs = new URLSearchParams();
    if (query.page) qs.set("page", String(query.page));
    if (query.perPage) qs.set("perPage", String(query.perPage));
    if (query.q) qs.set("q", query.q);
    if (query.role) qs.set("role", query.role);
    if (query.isActive) qs.set("isActive", query.isActive);
    if (query.sort) qs.set("sort", query.sort);
    if (query.order) qs.set("order", query.order);
    const res = await apiClient<ApiResponse<AdminUser[]>>(`/admin/users${qs.size ? `?${qs}` : ""}`, auth);
    const items = unwrap(res);
    return {
      items,
      total: res.meta?.pagination?.total ?? 0,
      page: res.meta?.pagination?.page ?? query.page ?? 1,
      perPage: res.meta?.pagination?.perPage ?? query.perPage ?? 20,
    };
  },

  async get(id: string): Promise<AdminUser> {
    const res = await apiClient<ApiResponse<AdminUser>>(`/admin/users/${id}`, auth);
    return unwrap(res);
  },

  async updateRole(id: string, role: string): Promise<AdminUser> {
    const res = await apiClient<ApiResponse<AdminUser>>(`/admin/users/${id}/role`, { ...auth, method: "PATCH", body: { role } });
    return unwrap(res);
  },

  async updateStatus(id: string, isActive: boolean): Promise<AdminUser> {
    const res = await apiClient<ApiResponse<AdminUser>>(`/admin/users/${id}/status`, { ...auth, method: "PATCH", body: { isActive } });
    return unwrap(res);
  },

  async auditLogs(query: AuditLogQuery = {}): Promise<{ items: AuditLogEntry[]; total: number; page: number; perPage: number }> {
    const qs = new URLSearchParams();
    if (query.page) qs.set("page", String(query.page));
    if (query.perPage) qs.set("perPage", String(query.perPage));
    if (query.entity) qs.set("entity", query.entity);
    if (query.action) qs.set("action", query.action);
    const res = await apiClient<ApiResponse<AuditLogEntry[]>>(`/admin/audit-logs${qs.size ? `?${qs}` : ""}`, auth);
    const items = unwrap(res);
    return {
      items,
      total: res.meta?.pagination?.total ?? 0,
      page: res.meta?.pagination?.page ?? query.page ?? 1,
      perPage: res.meta?.pagination?.perPage ?? query.perPage ?? 20,
    };
  },
};

export const adminCouponService = {
  async list(query: { page?: number; perPage?: number; q?: string; type?: string; isActive?: string } = {}): Promise<CouponPaged> {
    const qs = new URLSearchParams();
    if (query.page) qs.set("page", String(query.page));
    if (query.perPage) qs.set("perPage", String(query.perPage));
    if (query.q) qs.set("q", query.q);
    if (query.type) qs.set("type", query.type);
    if (query.isActive) qs.set("isActive", query.isActive);
    const res = await apiClient<ApiResponse<Coupon[]>>(`/coupons${qs.size ? `?${qs}` : ""}`, auth);
    const items = unwrap(res);
    return {
      items,
      total: res.meta?.pagination?.total ?? 0,
      page: res.meta?.pagination?.page ?? query.page ?? 1,
      perPage: res.meta?.pagination?.perPage ?? query.perPage ?? 20,
    };
  },

  async create(input: CouponInput): Promise<Coupon> {
    const res = await apiClient<ApiResponse<Coupon>>("/coupons", { ...auth, method: "POST", body: input });
    return unwrap(res);
  },

  async update(id: string, input: Partial<CouponInput>): Promise<Coupon> {
    const res = await apiClient<ApiResponse<Coupon>>(`/coupons/${id}`, { ...auth, method: "PATCH", body: input });
    return unwrap(res);
  },

  async remove(id: string): Promise<void> {
    await apiClient(`/coupons/${id}`, { ...auth, method: "DELETE" });
  },
};

export const adminCmsService = {
  async homepageSections(): Promise<HomepageSectionAdmin[]> {
    const res = await apiClient<ApiResponse<HomepageSectionAdmin[]>>("/cms/admin/homepage-sections", auth);
    return unwrap(res);
  },

  async upsertHomepageSection(sectionKey: string, input: Record<string, unknown>): Promise<HomepageSectionAdmin> {
    const res = await apiClient<ApiResponse<HomepageSectionAdmin>>(`/cms/admin/homepage-sections/${sectionKey}`, {
      ...auth,
      method: "PUT",
      body: input,
    });
    return unwrap(res);
  },

  async deleteHomepageSection(sectionKey: string): Promise<void> {
    await apiClient(`/cms/admin/homepage-sections/${sectionKey}`, { ...auth, method: "DELETE" });
  },

  async settings(group?: string): Promise<StoreSettingAdmin[]> {
    const qs = group ? `?group=${encodeURIComponent(group)}` : "";
    const res = await apiClient<ApiResponse<StoreSettingAdmin[]>>(`/cms/admin/settings${qs}`, auth);
    return unwrap(res);
  },

  async setSetting(input: { key: string; value: unknown; group?: string; isSecret?: boolean; description?: string }): Promise<StoreSettingAdmin> {
    const res = await apiClient<ApiResponse<StoreSettingAdmin>>("/cms/admin/settings", { ...auth, method: "PUT", body: input });
    return unwrap(res);
  },

  async deleteSetting(key: string): Promise<void> {
    await apiClient(`/cms/admin/settings/${encodeURIComponent(key)}`, { ...auth, method: "DELETE" });
  },

  async announcements(): Promise<AnnouncementAdmin[]> {
    const res = await apiClient<ApiResponse<AnnouncementAdmin[]>>("/cms/admin/announcements", auth);
    return unwrap(res);
  },

  async upsertAnnouncement(id: string | undefined, input: Record<string, unknown>): Promise<AnnouncementAdmin> {
    const path = id ? `/cms/admin/announcements/${id}` : "/cms/admin/announcements";
    const res = await apiClient<ApiResponse<AnnouncementAdmin>>(path, { ...auth, method: "PUT", body: input });
    return unwrap(res);
  },

  async deleteAnnouncement(id: string): Promise<void> {
    await apiClient(`/cms/admin/announcements/${id}`, { ...auth, method: "DELETE" });
  },

  async nav(): Promise<NavItemAdmin[]> {
    const res = await apiClient<ApiResponse<NavItemAdmin[]>>("/cms/admin/navigation", auth);
    return unwrap(res);
  },

  async upsertNavItem(id: string | undefined, input: Record<string, unknown>): Promise<NavItemAdmin> {
    const path = id ? `/cms/admin/navigation/${id}` : "/cms/admin/navigation";
    const res = await apiClient<ApiResponse<NavItemAdmin>>(path, { ...auth, method: "PUT", body: input });
    return unwrap(res);
  },

  async deleteNavItem(id: string): Promise<void> {
    await apiClient(`/cms/admin/navigation/${id}`, { ...auth, method: "DELETE" });
  },

  async pages(includeUnpublished = true): Promise<CmsPageAdmin[]> {
    const res = await apiClient<ApiResponse<CmsPageAdmin[]>>(`/cms/admin/pages${includeUnpublished ? "?includeUnpublished=true" : ""}`, auth);
    return unwrap(res);
  },

  async page(id: string): Promise<CmsPageAdmin> {
    const res = await apiClient<ApiResponse<CmsPageAdmin>>(`/cms/admin/pages/${id}`, auth);
    return unwrap(res);
  },

  async upsertPage(id: string | undefined, input: Record<string, unknown>): Promise<CmsPageAdmin> {
    const path = id ? `/cms/admin/pages/${id}` : "/cms/admin/pages";
    const res = await apiClient<ApiResponse<CmsPageAdmin>>(path, { ...auth, method: "PUT", body: input });
    return unwrap(res);
  },

  async deletePage(id: string): Promise<void> {
    await apiClient(`/cms/admin/pages/${id}`, { ...auth, method: "DELETE" });
  },
};

export const adminInventoryService = {
  async list(query: { page?: number; perPage?: number; status?: string; q?: string } = {}): Promise<{
    items: unknown[];
    total: number;
    page: number;
    perPage: number;
  }> {
    const qs = new URLSearchParams();
    if (query.page) qs.set("page", String(query.page));
    if (query.perPage) qs.set("perPage", String(query.perPage));
    if (query.status) qs.set("status", query.status);
    if (query.q) qs.set("q", query.q);
    const res = await apiClient<ApiResponse<unknown[]>>(`/inventory${qs.size ? `?${qs}` : ""}`, auth);
    const items = unwrap(res);
    return {
      items,
      total: res.meta?.pagination?.total ?? 0,
      page: res.meta?.pagination?.page ?? query.page ?? 1,
      perPage: res.meta?.pagination?.perPage ?? query.perPage ?? 20,
    };
  },

  async stats() {
    const res = await apiClient<ApiResponse<unknown>>("/inventory/stats", auth);
    return unwrap(res);
  },

  async alerts() {
    const res = await apiClient<ApiResponse<unknown>>("/inventory/alerts", auth);
    return unwrap(res);
  },

  async setStock(input: { variantId: string; quantity: number; warehouseId?: string; reason?: string }) {
    const res = await apiClient<ApiResponse<unknown>>("/inventory/set", { ...auth, method: "POST", body: input });
    return unwrap(res);
  },

  async adjust(input: { variantId: string; change: number; reason: string; warehouseId?: string }) {
    const res = await apiClient<ApiResponse<unknown>>("/inventory/adjust", { ...auth, method: "POST", body: input });
    return unwrap(res);
  },
};

export const adminAnalyticsService = {
  async overview(params: { from?: string; to?: string; interval?: string } = {}) {
    const qs = new URLSearchParams();
    if (params.from) qs.set("from", params.from);
    if (params.to) qs.set("to", params.to);
    if (params.interval) qs.set("interval", params.interval);
    const res = await apiClient<ApiResponse<unknown>>(`/analytics/admin/overview${qs.size ? `?${qs}` : ""}`, auth);
    return unwrap(res);
  },

  async revenue(params: { from?: string; to?: string; interval?: string } = {}) {
    const qs = new URLSearchParams();
    if (params.from) qs.set("from", params.from);
    if (params.to) qs.set("to", params.to);
    if (params.interval) qs.set("interval", params.interval);
    const res = await apiClient<ApiResponse<unknown>>(`/analytics/admin/revenue${qs.size ? `?${qs}` : ""}`, auth);
    return unwrap(res);
  },

  async customers(params: { from?: string; to?: string; interval?: string } = {}) {
    const qs = new URLSearchParams();
    if (params.from) qs.set("from", params.from);
    if (params.to) qs.set("to", params.to);
    if (params.interval) qs.set("interval", params.interval);
    const res = await apiClient<ApiResponse<unknown>>(`/analytics/admin/customers${qs.size ? `?${qs}` : ""}`, auth);
    return unwrap(res);
  },

  async bestSellers(params: { from?: string; to?: string; limit?: number } = {}) {
    const qs = new URLSearchParams();
    if (params.from) qs.set("from", params.from);
    if (params.to) qs.set("to", params.to);
    if (params.limit) qs.set("limit", String(params.limit));
    const res = await apiClient<ApiResponse<unknown>>(`/analytics/admin/best-sellers${qs.size ? `?${qs}` : ""}`, auth);
    return unwrap(res);
  },

  async topRevenueProducts(params: { from?: string; to?: string; limit?: number } = {}) {
    const qs = new URLSearchParams();
    if (params.from) qs.set("from", params.from);
    if (params.to) qs.set("to", params.to);
    if (params.limit) qs.set("limit", String(params.limit));
    const res = await apiClient<ApiResponse<unknown>>(`/analytics/admin/top-revenue-products${qs.size ? `?${qs}` : ""}`, auth);
    return unwrap(res);
  },

  async traffic(params: { from?: string; to?: string } = {}) {
    const qs = new URLSearchParams();
    if (params.from) qs.set("from", params.from);
    if (params.to) qs.set("to", params.to);
    const res = await apiClient<ApiResponse<unknown>>(`/analytics/admin/traffic${qs.size ? `?${qs}` : ""}`, auth);
    return unwrap(res);
  },

  async conversion(params: { from?: string; to?: string } = {}) {
    const qs = new URLSearchParams();
    if (params.from) qs.set("from", params.from);
    if (params.to) qs.set("to", params.to);
    const res = await apiClient<ApiResponse<unknown>>(`/analytics/admin/conversion${qs.size ? `?${qs}` : ""}`, auth);
    return unwrap(res);
  },
};

export const adminCollectionService = {
  async list(): Promise<Collection[]> {
    const res = await apiClient<ApiResponse<Collection[] | { data: Collection[] }>>("/collections?limit=100");
    const body = unwrap(res) as Collection[] | { data: Collection[] };
    return Array.isArray(body) ? body : body.data;
  },

  async byId(id: string): Promise<Collection> {
    const res = await apiClient<ApiResponse<Collection>>(`/collections/${id}`, auth);
    return unwrap(res);
  },

  async create(input: Record<string, unknown>): Promise<Collection> {
    const res = await apiClient<ApiResponse<Collection>>("/collections/admin", { ...auth, method: "POST", body: input });
    return unwrap(res);
  },

  async update(id: string, input: Record<string, unknown>): Promise<Collection> {
    const res = await apiClient<ApiResponse<Collection>>(`/collections/admin/${id}`, { ...auth, method: "PATCH", body: input });
    return unwrap(res);
  },

  async remove(id: string): Promise<void> {
    await apiClient(`/collections/admin/${id}`, { ...auth, method: "DELETE" });
  },
};
