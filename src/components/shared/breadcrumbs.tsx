import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className={cn("flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-muted")}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link href={item.href} className="transition-colors hover:text-ink">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-ink" : ""}>{item.label}</span>
              )}
              {!isLast ? <ChevronRight className="size-3" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
