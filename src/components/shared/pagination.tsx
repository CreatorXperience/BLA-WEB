"use client";

import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  total: number;
  perPage: number;
  onChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, total, perPage, onChange, className }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (pages <= 1) return null;

  const visible = new Set<number>([1, pages, page - 1, page, page + 1]);

  const items: (number | "…")[] = [];
  for (let i = 1; i <= pages; i++) {
    if (visible.has(i)) {
      if (items[items.length - 1] === "…") items.pop();
      items.push(i);
    } else if (items[items.length - 1] !== "…") {
      items.push("…");
    }
  }

  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-center gap-1", className)}>
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink disabled:pointer-events-none disabled:opacity-40"
      >
        Prev
      </button>
      {items.map((item, index) =>
        typeof item === "number" ? (
          <button
            key={index}
            onClick={() => onChange(item)}
            aria-current={item === page ? "page" : undefined}
            className={cn(
              "flex size-10 items-center justify-center text-xs transition-colors",
              item === page ? "bg-ink text-background" : "text-muted hover:text-ink",
            )}
          >
            {item}
          </button>
        ) : (
          <span key={index} className="px-1 text-muted">
            {item}
          </span>
        ),
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        className="px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink disabled:pointer-events-none disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}
