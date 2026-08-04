"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useOrders } from "@/hooks/use-account";
import { Skeleton } from "@/components/ui/skeleton";

export function AccountOverview() {
  const user = useAuthStore((s) => s.user);
  const { data: ordersPage, isLoading } = useOrders(1, 5);
  const orders = ordersPage?.data ?? [];

  return (
    <div className="space-y-10">
      <section className="border border-line p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-sm uppercase tracking-[0.2em] text-muted">Profile</h2>
            <p className="mt-4 text-lg text-ink">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="mt-1 text-sm text-muted">{user?.email}</p>
            <p className="mt-1 text-sm text-muted">{user?.phone ?? "No phone on file"}</p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-[0.2em] text-muted">Recent orders</h2>
          <Link href="/account/orders" className="text-xs text-ink underline-offset-2 hover:underline">
            View all
          </Link>
        </div>
        {isLoading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-4 border border-line p-10 text-center">
            <p className="text-sm text-muted">No orders yet.</p>
            <Link href="/shop" className="mt-3 inline-block text-sm text-ink underline-offset-2 hover:underline">
              Shop the collection
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {orders.map((order) => (
              <li key={order.id}>
                <Link href={`/account/orders/${order.id}`} className="flex flex-wrap items-center justify-between gap-3 py-5 hover:bg-mist/60">
                  <div>
                    <p className="text-sm text-ink">{order.orderNumber}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} ·{" "}
                      {order.items.reduce((n, i) => n + i.quantity, 0)} items
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-sm text-ink">
                      {order.total.toLocaleString("en-NG", { style: "currency", currency: order.currency })}
                    </span>
                    <span className="w-24 text-right text-xs uppercase tracking-wider text-muted">{order.status}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/account/addresses" className="group border border-line p-8 hover:border-ink">
          <h3 className="text-sm text-ink">Addresses</h3>
          <p className="mt-2 text-sm text-muted group-hover:text-ink">Manage your shipping and billing addresses.</p>
        </Link>
        <Link href="/account/wishlist" className="group border border-line p-8 hover:border-ink">
          <h3 className="text-sm text-ink">Wishlist</h3>
          <p className="mt-2 text-sm text-muted group-hover:text-ink">Save pieces you want to come back to.</p>
        </Link>
      </section>
    </div>
  );
}
