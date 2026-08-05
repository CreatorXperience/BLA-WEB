"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, PackagePlus, Pencil, RefreshCw, Search, Trash2 } from "lucide-react";
import { useAdminProducts, useAdminProductMutations } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { productImageUrl } from "@/constants/imagery";
import { AdminPageHeader, StatusBadge } from "@/features/admin/shared";
import type { AdminProduct } from "@/types/admin";
import type { ProductStatus } from "@/types/product";
import { cn, formatPrice } from "@/lib/utils";

const STATUSES = ["", "DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED", "DELETED"] as const;

export function ProductsManager() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"" | ProductStatus>("");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const { data, isLoading, isError, error } = useAdminProducts({ page, perPage: 20, status: status || undefined, q: debouncedQ || undefined });

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      toast.success(success);
      void qc.invalidateQueries({ queryKey: ["admin", "products"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Products"
        actions={
          <Button size="sm" asChild>
            <Link href="/admin/products/new">
              <PackagePlus className="mr-1 size-4" /> New product
            </Link>
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_220px_160px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input className="pl-9" placeholder="Search by name, SKU…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Label className="sr-only" htmlFor="status-filter">
          Status
        </Label>
        <select
          id="status-filter"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as "" | ProductStatus);
            setPage(1);
          }}
          className="border border-line bg-paper px-3 py-2 text-sm focus:border-ink focus:outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "" ? "All statuses" : s.toLowerCase()}
            </option>
          ))}
        </select>
        <Button variant="outline" size="sm" onClick={() => void qc.invalidateQueries({ queryKey: ["admin", "products"] })}>
          <RefreshCw className="mr-1 size-3.5" /> Refresh
        </Button>
      </div>

      <div className="overflow-x-auto border border-line bg-paper">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : isError ? (
          <p className="p-6 text-sm text-red-600">{error instanceof Error ? error.message : "Could not load products."}</p>
        ) : !data || data.data.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">No products found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted">
              <tr className="border-b border-line">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Flags</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.data.map((p) => (
                <ProductRow key={p.id} product={p} onAction={run} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4">
        {data && data.total > 20 ? <Pagination page={page} total={data.total} perPage={20} onChange={setPage} /> : null}
      </div>
    </div>
  );
}

function ProductRow({ product: p, onAction }: { product: AdminProduct; onAction: (a: () => Promise<unknown>, s: string) => void }) {
  const mutations = useAdminProductMutations();
  const img = p.images?.find((i) => i.isThumbnail) ?? p.images?.[0];

  const toggleFlag = (key: keyof AdminProduct, value: boolean) => {
    void onAction(async () => {
      await mutations.flags.mutateAsync({ id: p.id, input: { [key]: value } as never });
    }, `${p.name}: ${key.replace("is", "").toLowerCase()} ${value ? "on" : "off"}`);
  };

  return (
    <tr className="hover:bg-mist/40">
      <td className="px-4 py-3">
        <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={productImageUrl(img.url, 0)} alt="" className="size-12 shrink-0 border border-line bg-mist object-cover" />
          ) : (
            <div className="size-12 shrink-0 border border-line bg-mist" />
          )}
          <div className="min-w-0">
            <p className="truncate font-medium text-ink hover:underline">{p.name}</p>
            <p className="truncate text-xs text-muted">
              {p.sku ?? p.slug} · {p.variants?.length ?? 0} variants
            </p>
          </div>
        </Link>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={p.status} />
      </td>
      <td className="px-4 py-3 text-muted">
        <span className="font-medium text-ink">{formatPrice(Number(p.basePrice), p.currency)}</span>
        {p.compareAtPrice ? <span className="ml-2 text-xs text-economy line-through">{formatPrice(Number(p.compareAtPrice), p.currency)}</span> : null}
      </td>
      <td className="px-4 py-3">
        <span className={cn(p.inStock === false ? "text-red-600" : "text-muted")}>
          {p.totalStock ?? "—"}
          {p.inStock === false ? " (out)" : ""}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {(
            [
              ["isFeatured", "Feat"],
              ["isBestSeller", "Best"],
              ["isNewArrival", "New"],
              ["isTrending", "Trend"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleFlag(key, !p[key])}
              title={p[key] ? `Turn off ${label}` : `Turn on ${label}`}
              className={cn(
                "border px-1.5 py-0.5 text-[10px] uppercase tracking-wider",
                p[key] ? "border-ink bg-ink text-paper" : "border-line text-economy hover:border-ink/40",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="iconSm" asChild title="Edit">
            <Link href={`/admin/products/${p.id}`}>
              <Pencil className="size-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="iconSm"
            title="Duplicate"
            onClick={() => void onAction(() => mutations.duplicate.mutateAsync(p.id), "Product duplicated")}
          >
            <Copy className="size-4" />
          </Button>
          {p.status === "ARCHIVED" ? (
            <Button
              variant="ghost"
              size="iconSm"
              title="Restore"
              onClick={() => void onAction(() => mutations.restore.mutateAsync(p.id), "Product restored")}
            >
              <RefreshCw className="size-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="iconSm"
              title="Archive"
              onClick={() => void onAction(() => mutations.archive.mutateAsync(p.id), "Product archived")}
            >
              <PackagePlus className="size-4 -rotate-45" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="iconSm"
            title="Delete permanently"
            className="text-red-600"
            onClick={() => {
              if (confirm(`Permanently delete "${p.name}"?`)) void onAction(() => mutations.remove.mutateAsync(p.id), "Product deleted");
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
