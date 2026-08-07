"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminCmsService,
  adminCollectionService,
  adminCouponService,
  adminDashboardService,
  adminInventoryService,
  adminOrderService,
  adminProductService,
  adminUserService,
} from "@/services/admin";
import type {
  AdminOrderQuery,
  AdminProductQuery,
  AdminUserQuery,
  AuditLogQuery,
  CouponInput,
  HomepageSectionAdmin,
  ProductFlagsInput,
} from "@/types/admin";

export const qk = {
  dashboard: ["admin", "dashboard"] as const,
  products: (q: AdminProductQuery) => ["admin", "products", q] as const,
  product: (id: string) => ["admin", "products", id] as const,
  orders: (q: AdminOrderQuery) => ["admin", "orders", q] as const,
  order: (id: string) => ["admin", "orders", id] as const,
  users: (q: AdminUserQuery) => ["admin", "users", q] as const,
  auditLogs: (q: AuditLogQuery) => ["admin", "audit-logs", q] as const,
  coupons: (q: { page?: number; perPage?: number; q?: string; type?: string; isActive?: string }) => ["admin", "coupons", q] as const,
  cmsSections: ["admin", "cms", "sections"] as const,
  cmsSettings: (group?: string) => ["admin", "cms", "settings", group ?? "all"] as const,
  cmsAnnouncements: ["admin", "cms", "announcements"] as const,
  cmsNav: ["admin", "cms", "nav"] as const,
  cmsPages: ["admin", "cms", "pages"] as const,
  collections: ["admin", "collections"] as const,
  inventoryAlerts: ["admin", "inventory", "alerts"] as const,
};

// ---- Dashboard ----

export function useDashboardOverview() {
  return useQuery({ queryKey: qk.dashboard, queryFn: adminDashboardService.overview, retry: 1 });
}

// ---- Products ----

export function useAdminProducts(query: AdminProductQuery) {
  return useQuery({ queryKey: qk.products(query), queryFn: () => adminProductService.list(query), retry: 1 });
}

export function useAdminProduct(id: string) {
  return useQuery({ queryKey: qk.product(id), queryFn: () => adminProductService.byId(id), enabled: Boolean(id), retry: 1 });
}

export function useAdminProductMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin", "products"] });
    void qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    void qc.invalidateQueries({ queryKey: ["products"] });
    void qc.invalidateQueries({ queryKey: ["collections"] });
  };
  return {
    create: useMutation({
      mutationFn: (input: Record<string, unknown>) => adminProductService.create(input),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, input }: { id: string; input: Record<string, unknown> }) => adminProductService.update(id, input),
      onSuccess: invalidate,
    }),
    flags: useMutation({
      mutationFn: ({ id, input }: { id: string; input: ProductFlagsInput }) => adminProductService.flags(id, input),
      onSuccess: invalidate,
    }),
    publish: useMutation({
      mutationFn: ({ id, input }: { id: string; input: { publishAt?: string | null } }) => adminProductService.publish(id, input),
      onSuccess: invalidate,
    }),
    archive: useMutation({ mutationFn: (id: string) => adminProductService.archive(id), onSuccess: invalidate }),
    restore: useMutation({ mutationFn: (id: string) => adminProductService.restore(id), onSuccess: invalidate }),
    duplicate: useMutation({ mutationFn: (id: string) => adminProductService.duplicate(id), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: (id: string) => adminProductService.remove(id), onSuccess: invalidate }),
  };
}

// ---- Orders ----

export function useAdminOrders(query: AdminOrderQuery) {
  return useQuery({ queryKey: qk.orders(query), queryFn: () => adminOrderService.list(query), retry: 1 });
}

export function useAdminOrder(id: string) {
  return useQuery({ queryKey: qk.order(id), queryFn: () => adminOrderService.byId(id), enabled: Boolean(id), retry: 1 });
}

export function useAdminOrderMutations() {
  const qc = useQueryClient();
  const invalidate = (id?: string) => {
    void qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    if (id) void qc.invalidateQueries({ queryKey: ["admin", "orders", id] });
    void qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
  };
  return {
    updateStatus: useMutation({
      mutationFn: ({
        id,
        input,
      }: {
        id: string;
        input: { status: string; reason?: string; trackingNumber?: string; courier?: string; notifyCustomer?: boolean };
      }) => adminOrderService.updateStatus(id, input),
      onSuccess: (_data, vars) => invalidate(vars.id),
    }),
    addNote: useMutation({
      mutationFn: ({ id, note }: { id: string; note: string }) => adminOrderService.addNote(id, note),
      onSuccess: (_data, vars) => invalidate(vars.id),
    }),
  };
}

// ---- Users ----

export function useAdminUsers(query: AdminUserQuery) {
  return useQuery({ queryKey: qk.users(query), queryFn: () => adminUserService.list(query), retry: 1 });
}

export function useAdminUserMutations() {
  const qc = useQueryClient();
  return {
    updateRole: useMutation({
      mutationFn: ({ id, role }: { id: string; role: string }) => adminUserService.updateRole(id, role),
      onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "users"] }),
    }),
    updateStatus: useMutation({
      mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminUserService.updateStatus(id, isActive),
      onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "users"] }),
    }),
  };
}

export function useAdminAuditLogs(query: AuditLogQuery) {
  return useQuery({ queryKey: qk.auditLogs(query), queryFn: () => adminUserService.auditLogs(query), retry: 1 });
}

// ---- Coupons ----

export function useAdminCoupons(query: { page?: number; perPage?: number; q?: string; type?: string; isActive?: string }) {
  return useQuery({ queryKey: qk.coupons(query), queryFn: () => adminCouponService.list(query), retry: 1 });
}

export function useAdminCouponMutations() {
  const qc = useQueryClient();
  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
  return {
    create: useMutation({ mutationFn: (input: CouponInput) => adminCouponService.create(input), onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, input }: { id: string; input: Partial<CouponInput> }) => adminCouponService.update(id, input),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: (id: string) => adminCouponService.remove(id), onSuccess: invalidate }),
  };
}

// ---- Collections ----

export function useAdminCollections() {
  return useQuery({ queryKey: qk.collections, queryFn: adminCollectionService.list, retry: 1 });
}

export function useAdminCollectionMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin", "collections"] });
    void qc.invalidateQueries({ queryKey: ["collections"] });
  };
  return {
    create: useMutation({ mutationFn: (input: Record<string, unknown>) => adminCollectionService.create(input), onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, input }: { id: string; input: Record<string, unknown> }) => adminCollectionService.update(id, input),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: (id: string) => adminCollectionService.remove(id), onSuccess: invalidate }),
  };
}

// ---- CMS ----

export function useCmsSections() {
  return useQuery({ queryKey: qk.cmsSections, queryFn: adminCmsService.homepageSections, retry: 1 });
}

export function useCmsSettings(group?: string) {
  return useQuery({ queryKey: qk.cmsSettings(group), queryFn: () => adminCmsService.settings(group), retry: 1 });
}

export function useCmsAnnouncements() {
  return useQuery({ queryKey: qk.cmsAnnouncements, queryFn: adminCmsService.announcements, retry: 1 });
}

export function useCmsNav() {
  return useQuery({ queryKey: qk.cmsNav, queryFn: adminCmsService.nav, retry: 1 });
}

export function useCmsPages() {
  return useQuery({ queryKey: qk.cmsPages, queryFn: () => adminCmsService.pages(true), retry: 1 });
}

export function useCmsMutations() {
  const qc = useQueryClient();
  return {
    upsertSection: useMutation({
      mutationFn: ({ sectionKey, input }: { sectionKey: string; input: Record<string, unknown> }) =>
        adminCmsService.upsertHomepageSection(sectionKey, input),
      onSuccess: () => void qc.invalidateQueries({ queryKey: qk.cmsSections }),
    }),
    deleteSection: useMutation({
      mutationFn: (sectionKey: string) => adminCmsService.deleteHomepageSection(sectionKey),
      onSuccess: () => void qc.invalidateQueries({ queryKey: qk.cmsSections }),
    }),
    setSetting: useMutation({
      mutationFn: (input: { key: string; value: unknown; group?: string; isSecret?: boolean; description?: string }) =>
        adminCmsService.setSetting(input),
      onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "cms", "settings"] }),
    }),
    deleteSetting: useMutation({
      mutationFn: (key: string) => adminCmsService.deleteSetting(key),
      onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "cms", "settings"] }),
    }),
    upsertAnnouncement: useMutation({
      mutationFn: ({ id, input }: { id?: string; input: Record<string, unknown> }) => adminCmsService.upsertAnnouncement(id, input),
      onSuccess: () => void qc.invalidateQueries({ queryKey: qk.cmsAnnouncements }),
    }),
    deleteAnnouncement: useMutation({
      mutationFn: (id: string) => adminCmsService.deleteAnnouncement(id),
      onSuccess: () => void qc.invalidateQueries({ queryKey: qk.cmsAnnouncements }),
    }),
    upsertNavItem: useMutation({
      mutationFn: ({ id, input }: { id?: string; input: Record<string, unknown> }) => adminCmsService.upsertNavItem(id, input),
      onSuccess: () => void qc.invalidateQueries({ queryKey: qk.cmsNav }),
    }),
    deleteNavItem: useMutation({
      mutationFn: (id: string) => adminCmsService.deleteNavItem(id),
      onSuccess: () => void qc.invalidateQueries({ queryKey: qk.cmsNav }),
    }),
    upsertPage: useMutation({
      mutationFn: ({ id, input }: { id?: string; input: Record<string, unknown> }) => adminCmsService.upsertPage(id, input),
      onSuccess: () => void qc.invalidateQueries({ queryKey: qk.cmsPages }),
    }),
    deletePage: useMutation({
      mutationFn: (id: string) => adminCmsService.deletePage(id),
      onSuccess: () => void qc.invalidateQueries({ queryKey: qk.cmsPages }),
    }),
  };
}

// ---- Inventory ----

export function useInventoryAlerts() {
  return useQuery({ queryKey: qk.inventoryAlerts, queryFn: adminInventoryService.alerts, retry: 1 });
}

export function useInventoryMutations() {
  const qc = useQueryClient();
  return {
    setStock: useMutation({
      mutationFn: (input: { variantId: string; quantity: number; warehouseId?: string; reason?: string }) =>
        adminInventoryService.setStock(input),
      onSuccess: () => {
        void qc.invalidateQueries({ queryKey: ["admin", "inventory"] });
        void qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      },
    }),
    adjust: useMutation({
      mutationFn: (input: { variantId: string; change: number; reason: string; warehouseId?: string }) =>
        adminInventoryService.adjust(input),
      onSuccess: () => {
        void qc.invalidateQueries({ queryKey: ["admin", "inventory"] });
        void qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      },
    }),
  };
}

export type { HomepageSectionAdmin };
