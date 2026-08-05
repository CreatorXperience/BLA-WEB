"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminAnalyticsService } from "@/services/admin";
import { AdminPageHeader } from "@/features/admin/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";

const INTERVALS = ["day", "week", "month"];

function useAnalytics() {
  const [interval, setInterval] = useState("day");
  const [range, setRange] = useState("30");
  const now = new Date();
  const from = new Date(now);
  from.setDate(now.getDate() - Number(range));
  const params = { from: from.toISOString(), interval };
  return {
    interval,
    setInterval,
    range,
    setRange,
    overview: useQuery({
      queryKey: ["admin", "analytics", "overview", params],
      queryFn: () => adminAnalyticsService.overview(params),
      retry: 1,
    }),
    revenue: useQuery({
      queryKey: ["admin", "analytics", "revenue", params],
      queryFn: () => adminAnalyticsService.revenue(params),
      retry: 1,
    }),
    bestSellers: useQuery({
      queryKey: ["admin", "analytics", "best-sellers", params],
      queryFn: () => adminAnalyticsService.bestSellers(params),
      retry: 1,
    }),
    topRevenue: useQuery({
      queryKey: ["admin", "analytics", "top-revenue", params],
      queryFn: () => adminAnalyticsService.topRevenueProducts(params),
      retry: 1,
    }),
    traffic: useQuery({
      queryKey: ["admin", "analytics", "traffic", params],
      queryFn: () => adminAnalyticsService.traffic(params),
      retry: 1,
    }),
    conversion: useQuery({
      queryKey: ["admin", "analytics", "conversion", params],
      queryFn: () => adminAnalyticsService.conversion(params),
      retry: 1,
    }),
  };
}

function RevenueChart({ series }: { series: Array<{ date?: string; label?: string; value: number }> }) {
  const max = Math.max(...series.map((p) => Number(p.value ?? 0)), 1);
  return (
    <div className="flex h-44 items-end gap-1">
      {series.map((p, i) => (
        <div key={i} className="group relative flex flex-1 flex-col justify-end" style={{ height: "100%" }}>
          <div
            className="w-full bg-ink/80 transition-all group-hover:bg-ink"
            style={{ height: `${Math.max((Number(p.value) / max) * 100, 2)}%` }}
            title={`${p.date ?? p.label ?? ""}: ${formatPrice(Number(p.value))}`}
          />
        </div>
      ))}
    </div>
  );
}

export function AnalyticsPage() {
  const a = useAnalytics();
  const overview = a.overview.data as
    | { revenue: number; orders: number; averageOrderValue: number; customers: number; newCustomers: number; conversionRate: number; lowStockCount: number }
    | undefined;
  const revenue = a.revenue.data as { totalRevenue: number; paidOrders: number; series?: Array<{ date?: string; value: number }> } | undefined;
  const bestSellers = (a.bestSellers.data ?? []) as Array<{ id: string; name: string; slug: string; totalSold: number; revenue: number }>;
  const topRevenue = (a.topRevenue.data ?? []) as Array<{ id: string; name: string; totalSold: number; revenue: number }>;
  const traffic = a.traffic.data as Array<{ source: string; sessions: number }> | undefined;
  const conversion = a.conversion.data as { rate: number; sessions: number; orders: number } | undefined;

  return (
    <div>
      <AdminPageHeader
        title="Analytics"
        actions={
          <div className="flex items-center gap-2">
            <select
              value={a.interval}
              onChange={(e) => a.setInterval(e.target.value)}
              className="border border-line bg-paper px-3 py-2 text-sm focus:border-ink focus:outline-none"
            >
              {INTERVALS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
            <select
              value={a.range}
              onChange={(e) => a.setRange(e.target.value)}
              className="border border-line bg-paper px-3 py-2 text-sm focus:border-ink focus:outline-none"
            >
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
            </select>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {a.overview.isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20" />)
        ) : (
          <>
            <Stat label="Revenue" value={formatPrice(Number(overview?.revenue ?? 0))} />
            <Stat label="Orders" value={String(overview?.orders ?? 0)} />
            <Stat label="Avg. order value" value={formatPrice(Number(overview?.averageOrderValue ?? 0))} />
            <Stat label="Customers" value={String(overview?.customers ?? 0)} sub={`${overview?.newCustomers ?? 0} new`} />
            <Stat label="Conversion" value={`${Number(conversion?.rate ?? 0).toFixed(2)}%`} />
            <Stat label="Low stock" value={String(overview?.lowStockCount ?? 0)} />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="border border-line bg-paper p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-ink">Revenue</h2>
          {a.revenue.isLoading ? (
            <Skeleton className="h-44" />
          ) : revenue?.series && revenue.series.length ? (
            <RevenueChart series={revenue.series} />
          ) : (
            <p className="py-10 text-center text-sm text-muted">No revenue in this window.</p>
          )}
        </section>

        <section className="border border-line bg-paper p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-ink">Traffic sources</h2>
          {a.traffic.isLoading ? (
            <Skeleton className="h-44" />
          ) : !traffic || traffic.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">No traffic data yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {traffic.map((t) => (
                <li key={t.source} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-ink">{t.source}</span>
                  <span className="text-muted">{t.sessions} sessions</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="border border-line bg-paper">
          <div className="border-b border-line px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">Best sellers</h2>
          </div>
          <ul className="divide-y divide-line">
            {bestSellers.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-6 py-3 text-sm">
                <span className="font-medium text-ink">{p.name}</span>
                <span className="text-muted">
                  {p.totalSold} sold · {formatPrice(Number(p.revenue ?? 0))}
                </span>
              </li>
            ))}
            {bestSellers.length === 0 ? <li className="px-6 py-10 text-center text-sm text-muted">No sales yet.</li> : null}
          </ul>
        </section>

        <section className="border border-line bg-paper">
          <div className="border-b border-line px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">Top revenue products</h2>
          </div>
          <ul className="divide-y divide-line">
            {topRevenue.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-6 py-3 text-sm">
                <span className="font-medium text-ink">{p.name}</span>
                <span className="text-muted">{formatPrice(Number(p.revenue ?? 0))}</span>
              </li>
            ))}
            {topRevenue.length === 0 ? <li className="px-6 py-10 text-center text-sm text-muted">No sales yet.</li> : null}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border border-line bg-paper p-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 text-xl font-semibold text-ink">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-muted">{sub}</p> : null}
    </div>
  );
}
