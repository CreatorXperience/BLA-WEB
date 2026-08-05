"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Search } from "lucide-react";
import { useAdminOrders } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageHeader, StatusBadge } from "@/features/admin/shared";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

const STATUSES = ["", "PENDING", "PAID", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export function OrdersManager() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const { data, isLoading, isError, error } = useAdminOrders({ page, perPage: 20, status: status || undefined, q: debouncedQ || undefined });

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        actions={
          <Button variant="outline" size="sm" onClick={() => void qc.invalidateQueries({ queryKey: ["admin", "orders"] })}>
            <RefreshCw className="mr-1 size-3.5" /> Refresh
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input className="pl-9" placeholder="Search by order #, email, product…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Label className="sr-only" htmlFor="order-status">
          Status
        </Label>
        <select
          id="order-status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as OrderStatus | "");
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
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : isError ? (
          <p className="p-6 text-sm text-red-600">{error instanceof Error ? error.message : "Could not load orders."}</p>
        ) : !data || data.data.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">No orders found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted">
              <tr className="border-b border-line">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium text-right">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.data.map((o) => {
                const itemCount = o.itemCount ?? o.items?.length ?? 0;
                return (
                  <tr key={o.id} className="hover:bg-mist/40">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="font-medium text-ink underline-offset-2 hover:underline">
                        #{o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink">{o.customer ?? "—"}</p>
                      {o.email ? <p className="text-xs text-muted">{o.email}</p> : null}
                    </td>
                    <td className="px-4 py-3 text-muted">{itemCount}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-ink">{formatPrice(Number(o.grandTotal), o.currency)}</td>
                    <td className="px-4 py-3 text-right text-xs text-muted">{new Date(o.placedAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
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
