"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { useInfiniteQuery } from "@tanstack/react-query";
import { collectionService } from "@/services/products";
import { ProductCard } from "@/components/product/product-card";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { useCollection } from "@/hooks/use-catalog";
import { IMAGERY } from "@/constants/imagery";
import type { ProductQuery } from "@/types/product";

export function CollectionClient() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { data: collection, isLoading } = useCollection(slug);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: loadingProducts } = useInfiniteQuery({
    queryKey: ["collection-products", slug],
    queryFn: ({ pageParam }) =>
      collectionService.products(collection?.id ?? "", {
        limit: 24,
        cursor: pageParam as string | undefined,
      } as ProductQuery),
    enabled: Boolean(collection?.id),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div>
      {/* Banner */}
      <div className="relative h-[46vh] min-h-[340px] overflow-hidden bg-ink">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <Image
            src={collection?.bannerUrl ?? collection?.imageUrl ?? IMAGERY.collection[0] ?? IMAGERY.productFallback}
            alt={collection?.name ?? "Collection"}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-ink/35" />
        <div className="container-lux absolute inset-x-0 bottom-0 z-10 pb-12">
          <p className="eyebrow mb-3 text-background/70">Collection</p>
          <h1 className="editorial-title text-background">{isLoading ? "Loading…" : collection?.name}</h1>
          {collection?.description ? (
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-background/80">{collection.description}</p>
          ) : null}
        </div>
      </div>

      <div className="container-lux py-12 md:py-16">
        <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: "Collections", href: "/collections" }, { label: collection?.name ?? "Collection" }]} />
        {loadingProducts ? (
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/5] w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState title="Nothing in this collection yet" className="mt-10" />
        ) : (
          <>
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
              {items.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 4} />
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
  );
}
