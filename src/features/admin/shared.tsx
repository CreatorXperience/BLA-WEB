"use client";

import { cn } from "@/lib/utils";

const STATUS_TONES: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PROCESSING: "border-blue-200 bg-blue-50 text-blue-700",
  PACKED: "border-violet-200 bg-violet-50 text-violet-700",
  SHIPPED: "border-cyan-200 bg-cyan-50 text-cyan-700",
  DELIVERED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELLED: "border-red-200 bg-red-50 text-red-600",
  REFUNDED: "border-stone-200 bg-stone-100 text-stone-600",
  DRAFT: "border-line bg-mist text-muted",
  SCHEDULED: "border-violet-200 bg-violet-50 text-violet-700",
  PUBLISHED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  ARCHIVED: "border-stone-200 bg-stone-100 text-stone-500",
  DELETED: "border-red-200 bg-red-50 text-red-600",
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  INACTIVE: "border-line bg-mist text-muted",
  IN_STOCK: "border-emerald-200 bg-emerald-50 text-emerald-700",
  LOW_STOCK: "border-amber-200 bg-amber-50 text-amber-700",
  OUT_OF_STOCK: "border-red-200 bg-red-50 text-red-600",
  BACKORDER: "border-cyan-200 bg-cyan-50 text-cyan-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap border px-2 py-0.5 text-[10px] uppercase tracking-wider",
        STATUS_TONES[status] ?? "border-line text-muted",
      )}
    >
      {status.toLowerCase()}
    </span>
  );
}

export function AdminPageHeader({ title, eyebrow, actions }: { title: string; eyebrow?: string; actions?: React.ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-semibold text-ink">{title}</h1>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function AdminCard({ title, children, actions }: { title?: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="border border-line bg-paper">
      {title ? (
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">{title}</h2>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}
