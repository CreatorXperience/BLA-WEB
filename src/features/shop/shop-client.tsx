"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { productService } from "@/services/products";
import { ProductCard } from "@/components/product/product-card";
import { ShopFilters } from "@/features/shop/shop-filters";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import type { ProductQuery, ProductSort } from "@/types/product";

function buildQuery(params: URLSearchParams): ProductQuery {
  const sort = (params.get("sort") as ProductSort) ?? "newest";
  return {
    q: params.get("q") ?? undefined,
    category: params.get("category") ?? undefined,
    collection: params.get("collection") ?? undefined,
    size: params.get("size") ?? undefined,
    color: params.get("color") ?? undefined,
    minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : undefined,
    maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined,
    inStock: params.get("inStock") === "true" ? true : undefined,
    sort,
    limit: 24,
  };
}

export function ShopClient() {
  const params = useSearchParams();
  const query = useMemo(() => buildQuery(params), [params]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["shop", query],
    queryFn: ({ pageParam }) => productService.list({ ...query, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  const items = data?.pages.flatMap((page) => page.items) ?? [];
  const heading = query.q ? `Results for “${query.q}”` : "Shop";

  return (
    <div className="container-lux py-12 md:py-16">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <p className="eyebrow">The Collection</p>
          <h1 className="editorial-title mt-3 text-ink">{heading}</h1>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted">{isLoading ? "…" : `${items.length} items`}</p>
          <Button variant="outline" size="sm" asChild>
            <a href="#filters" className="lg:hidden">
              <SlidersHorizontal className="size-4" /> Filters
            </a>
          </Button>
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside id="filters" className="scroll-mt-28 lg:block">
          <div className="sticky top-28">
            <ShopFilters />
          </div>
        </aside>

        <div>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[4/5] w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              title="Nothing found"
              description="Try adjusting your filters or search for something else."
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3">
                {items.map((product, i) => (
                  <ProductCard key={product.id} product={product} priority={i < 6} />
                ))}
              </div>
              {hasNextPage ? (
                <div className="mt-16 text-center">
                  <Button variant="outline" size="lg" onClick={() => void fetchNextPage()} disabled={isFetchingNextPage}>
                    {isFetchingNextPage ? "Loading…" : "Load more"}
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
