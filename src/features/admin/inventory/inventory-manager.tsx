"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminInventoryService } from "@/services/admin";
import { useInventoryMutations } from "@/hooks/use-admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageHeader, StatusBadge } from "@/features/admin/shared";
import { cn, formatPrice } from "@/lib/utils";

interface InventoryItem {
  id: string;
  quantity: number;
  reserved: number;
  status: string;
  lowStockThreshold: number;
  allowBackorder: boolean;
  variant: {
    id: string;
    sku?: string | null;
    color?: string | null;
    size?: string | null;
    price?: string;
    product: { id: string; name: string; slug: string };
  };
}

const STATUSES = ["", "IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "BACKORDER"];

export function InventoryManager() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "inventory", { page, status, q: debouncedQ }],
    queryFn: () => adminInventoryService.list({ page, perPage: 20, status: status || undefined, q: debouncedQ || undefined }),
    retry: 1,
  });
  const mutations = useInventoryMutations();
  const [adjusting, setAdjusting] = useState<Record<string, string>>({});

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const onAdjust = async (item: InventoryItem, delta: number) => {
    const value = adjusting[item.id];
    const change = value ? Number(value) : delta;
    if (!change) return;
    try {
      await mutations.adjust.mutateAsync({ variantId: item.variant.id, change, reason: "Manual adjustment" });      setAdjusting((prev) => ({ ...prev, [item.id]: "" }));
      toast.success(`Stock adjusted by ${change}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Adjust failed");
    }
  };

  const result = data as unknown as { data?: InventoryItem[]; total?: number; page?: number; perPage?: number } | undefined;

  return (
    <div>
      <AdminPageHeader title="Inventory" />

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input className="pl-9" placeholder="Search product or SKU…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Label className="sr-only" htmlFor="inv-status">
          Status
        </Label>
        <select
          id="inv-status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
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
      </div>

      <div className="overflow-x-auto border border-line bg-paper">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : isError ? (
          <p className="p-6 text-sm text-red-600">Could not load inventory.</p>
        ) : !result || !result.data || result.data.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">No inventory records found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted">
              <tr className="border-b border-line">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Variant</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">On hand</th>
                <th className="px-4 py-3 font-medium">Reserved</th>
                <th className="px-4 py-3 font-medium">Available</th>
                <th className="px-4 py-3 font-medium text-right">Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {result.data.map((item) => (
                <tr key={item.id} className="hover:bg-mist/40">
                  <td className="px-4 py-3 font-medium text-ink">{item.variant.product.name}</td>
                  <td className="px-4 py-3 text-muted">
                    {[item.variant.sku, item.variant.color, item.variant.size].filter(Boolean).join(" · ") || "—"}
                    {item.variant.price ? <span className="ml-2">{formatPrice(Number(item.variant.price))}</span> : null}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3 text-muted">{item.reserved}</td>
                  <td className={cn("px-4 py-3", item.quantity - item.reserved <= 0 ? "font-medium text-red-600" : "text-muted")}>
                    {item.quantity - item.reserved}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <ButtonGhost title="Decrement" onClick={() => void onAdjust(item, -1)}>
                        <Minus className="size-3.5" />
                      </ButtonGhost>
                      <input
                        type="number"
                        value={adjusting[item.id] ?? ""}
                        placeholder="±"
                        onChange={(e) => setAdjusting((prev) => ({ ...prev, [item.id]: e.target.value }))}
                        className="w-16 border border-line bg-paper px-2 py-1 text-center text-xs focus:border-ink focus:outline-none"
                      />
                      <ButtonGhost title="Increment" onClick={() => void onAdjust(item, 1)}>
                        <Plus className="size-3.5" />
                      </ButtonGhost>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4">
        {result && (result.total ?? 0) > 20 ? (
          <Pagination page={page} total={result.total ?? 0} perPage={20} onChange={setPage} />
        ) : null}
      </div>
    </div>
  );
}

function ButtonGhost({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="border border-line px-2 py-1 text-muted transition-colors hover:border-ink hover:text-ink"
    >
      {children}
    </button>
  );
}
