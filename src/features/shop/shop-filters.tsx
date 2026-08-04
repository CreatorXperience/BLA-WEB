"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCategories, useCollections } from "@/hooks/use-catalog";
import type { ProductSort } from "@/types/product";

const SORTS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "best-selling", label: "Popularity" },
  { value: "highest-rated", label: "Highest Rated" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "featured", label: "Featured" },
];

export interface ActiveFilters {
  q?: string;
  category?: string;
  collection?: string;
  size?: string;
  color?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
}

export function ShopFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { data: categories } = useCategories();
  const { data: collections } = useCollections();

  const active: ActiveFilters = useMemo(() => {
    return {
      q: params.get("q") ?? undefined,
      category: params.get("category") ?? undefined,
      collection: params.get("collection") ?? undefined,
      size: params.get("size") ?? undefined,
      color: params.get("color") ?? undefined,
      inStock: params.get("inStock") === "true" ? true : undefined,
      minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : undefined,
      maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined,
      sort: (params.get("sort") as ProductSort) ?? undefined,
    };
  }, [params]);

  const [price, setPrice] = useState<string>(active.minPrice || active.maxPrice ? `${active.minPrice ?? 0}-${active.maxPrice ?? 500000}` : "");

  const apply = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "" || value === undefined) next.delete(key);
      else next.set(key, value);
    }
    next.delete("cursor");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const reset = () => router.push(pathname);

  return (
    <div className="space-y-8">
      {/* Sort */}
      <div>
        <p className="eyebrow mb-3">Sort</p>
        <select
          value={active.sort ?? "newest"}
          onChange={(e) => apply({ sort: e.target.value === "newest" ? null : e.target.value })}
          className="w-full border border-ink/20 bg-transparent px-3 py-2.5 text-sm focus-visible:border-ink focus-visible:outline-none"
          aria-label="Sort products"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Categories */}
      {categories && categories.length > 0 ? (
        <div>
          <p className="eyebrow mb-3">Category</p>
          <ul className="space-y-2.5">
            {categories.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => apply({ category: active.category === c.slug ? null : c.slug })}
                  className={cn(
                    "text-sm transition-colors",
                    active.category === c.slug ? "text-ink" : "text-muted hover:text-ink",
                  )}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Collections */}
      {collections && collections.length > 0 ? (
        <div>
          <p className="eyebrow mb-3">Collection</p>
          <ul className="space-y-2.5">
            {collections.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => apply({ collection: active.collection === c.slug ? null : c.slug })}
                  className={cn(
                    "text-sm transition-colors",
                    active.collection === c.slug ? "text-ink" : "text-muted hover:text-ink",
                  )}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Price */}
      <div>
        <p className="eyebrow mb-3">Price</p>
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const [min, max] = price.split("-");
              apply({ minPrice: min ? min : null, maxPrice: max ? max : null });
            }
          }}
          placeholder="min-max (e.g. 5000-150000)"
          className="w-full border border-ink/20 bg-transparent px-3 py-2.5 text-sm focus-visible:border-ink focus-visible:outline-none"
          aria-label="Price range"
        />
      </div>

      {/* Availability */}
      <div>
        <p className="eyebrow mb-3">Availability</p>
        <label className="flex items-center gap-3 text-sm text-muted">
          <input
            type="checkbox"
            checked={active.inStock ?? false}
            onChange={(e) => apply({ inStock: e.target.checked ? "true" : null })}
            className="size-4 accent-ink"
          />
          In stock only
        </label>
      </div>

      {Object.keys(active).some((k) => k !== "sort" && (active as Record<string, unknown>)[k] !== undefined) ? (
        <button
          onClick={reset}
          className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted hover:text-ink"
        >
          <X className="size-3.5" /> Clear all
        </button>
      ) : null}
    </div>
  );
}
