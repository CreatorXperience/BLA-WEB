"use client";

import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Boxes, DollarSign, Package, ShoppingCart, Star, Users } from "lucide-react";
import { useDashboardOverview } from "@/hooks/use-admin";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="border border-line bg-paper p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{label}</p>
        <Icon className="size-4 text-economy" />
      </div>
      <p className="mt-3 text-2xl font-semibold text-ink">{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted">{sub}</p> : null}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone: Record<string, string> = {
    PENDING: "border-amber-200 bg-amber-50 text-amber-700",
    PAID: "border-emerald-200 bg-emerald-50 text-emerald-700",
    PROCESSING: "border-blue-200 bg-blue-50 text-blue-700",
    PACKED: "border-violet-200 bg-violet-50 text-violet-700",
    SHIPPED: "border-cyan-200 bg-cyan-50 text-cyan-700",
    DELIVERED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    CANCELLED: "border-red-200 bg-red-50 text-red-600",
    REFUNDED: "border-stone-200 bg-stone-100 text-stone-600",
  };
  return (
    <span className={cn("inline-block border px-2 py-0.5 text-[10px] uppercase tracking-wider", tone[status] ?? "border-line text-muted")}>
      {status}
    </span>
  );
}

export function OverviewDashboard() {
  const { data, isLoading } = useDashboardOverview();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  const { kpis, inventory, actionItems, bestSellers, revenueSeries, recentOrders } = data;
  const revenue = revenueSeries ?? [];
  const maxRevenue = Math.max(...revenue.map((r) => Number(r.value)), 1);

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">Overview</h1>
        </div>
        <div className="flex items-center gap-3">
          {actionItems.pendingOrders > 0 ? (
            <Badge variant="solid">
              <AlertTriangle className="mr-1 size-3" /> {actionItems.pendingOrders} pending orders
            </Badge>
          ) : null}
          {actionItems.lowStockAlerts > 0 ? (
            <Badge>
              <Boxes className="mr-1 size-3" /> {actionItems.lowStockAlerts} low stock
            </Badge>
          ) : null}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Revenue" value={formatPrice(kpis.revenue)} icon={DollarSign} />
        <StatCard label="Orders" value={String(kpis.orders)} icon={ShoppingCart} />
        <StatCard label="Customers" value={String(kpis.customers)} sub={`${kpis.newCustomers} new`} icon={Users} />
        <StatCard label="Avg. order value" value={formatPrice(kpis.averageOrderValue)} icon={ArrowUpRight} />
        <StatCard label="Products" value={String(kpis.totalProducts)} icon={Package} />
        <StatCard label="In stock" value={String(inventory.inStock)} sub={`${inventory.lowStock} low · ${inventory.outOfStock} out`} icon={Boxes} />
        <StatCard label="Pending reviews" value={String(kpis.pendingReviews)} icon={Star} />
        <StatCard label="Revenue/order" value={`${((kpis.revenue / Math.max(kpis.orders, 1))).toFixed(2)}`} sub="raw" icon={DollarSign} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border border-line bg-paper p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">Revenue (30d)</h2>
          {revenue.length === 0 ? (
            <p className="mt-6 text-sm text-muted">No paid orders in this window yet.</p>
          ) : (
            <div className="mt-6 flex h-40 items-end gap-1">
              {revenue.map((point, i) => (
                <div key={i} className="group relative flex flex-1 flex-col justify-end" style={{ height: "100%" }}>
                  <div
                    className="w-full bg-ink/80 transition-all group-hover:bg-ink"
                    style={{ height: `${Math.max((Number(point.value) / maxRevenue) * 100, 2)}%` }}
                    title={`${point.date}: ${formatPrice(Number(point.value))}`}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="border border-line bg-paper p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">Best sellers</h2>
          <ul className="mt-4 divide-y divide-line">
            {bestSellers.length === 0 ? (
              <li className="py-6 text-sm text-muted">No sales yet.</li>
            ) : (
              bestSellers.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt="" className="size-10 shrink-0 border border-line bg-mist object-cover" />
                    ) : (
                      <div className="size-10 shrink-0 border border-line bg-mist" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                      <p className="text-xs text-muted">{p.totalSold} sold</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-ink">{formatPrice(Number(p.revenue ?? 0))}</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <section className="border border-line bg-paper">
        <div className="flex items-center justify-between border-b border-line p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">Recent orders</h2>
          <Link href="/admin/orders" className="text-xs uppercase tracking-wider text-muted underline-offset-2 hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted">
              <tr className="border-b border-line">
                <th className="px-6 py-3 font-medium">Order</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Total</th>
                <th className="px-6 py-3 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-mist/40">
                  <td className="px-6 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium text-ink underline-offset-2 hover:underline">
                      #{o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-muted">{o.customer}</td>
                  <td className="px-6 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-6 py-3 text-right font-medium text-ink">{formatPrice(Number(o.grandTotal))}</td>
                  <td className="px-6 py-3 text-right text-xs text-muted">{new Date(o.placedAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-muted">
                    No orders yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
