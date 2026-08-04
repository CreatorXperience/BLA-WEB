"use client";

import { useState } from "react";
import Link from "next/link";
import { useOrders } from "@/hooks/use-account";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/shared/pagination";

export function OrdersList() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useOrders(page);
  const orders = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div>
      <header className="mb-8">
        <p className="eyebrow">Orders</p>
        <h2 className="editorial-title mt-2 text-ink">Order history</h2>
        <p className="mt-3 text-sm text-muted">
          {total > 0 ? `${total} order${total === 1 ? "" : "s"} placed` : "Track and review everything you have ordered."}
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="border border-line p-14 text-center">
          <p className="text-sm text-muted">You have not placed any orders yet.</p>
          <Link href="/shop" className="mt-3 inline-block text-sm text-ink underline-offset-2 hover:underline">
            Shop the collection
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/account/orders/${order.id}`} className="flex flex-wrap items-center justify-between gap-4 py-6 hover:bg-mist/60">
                <div>
                  <p className="text-sm font-medium text-ink">{order.orderNumber}</p>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {order.items.reduce((n, i) => n + i.quantity, 0)} items · {order.items[0]?.productName}
                    {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-8">
                  <span className="text-sm text-ink">
                    {order.total.toLocaleString("en-NG", { style: "currency", currency: order.currency })}
                  </span>
                  <span className="w-28 text-right text-xs uppercase tracking-wider text-muted">{order.status}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {total > 0 ? <Pagination page={page} total={total} perPage={data?.perPage ?? 10} onChange={setPage} className="mt-10" /> : null}
    </div>
  );
}
