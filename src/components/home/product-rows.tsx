"use client";

import Link from "next/link";
import { useBestSellers, useFeatured, useNewArrivals } from "@/hooks/use-catalog";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/shared/empty-state";

export function ProductRow({
  title,
  eyebrow,
  useProducts,
  href,
}: {
  title: string;
  eyebrow?: string;
  useProducts: () => { data: unknown[] | undefined; isLoading: boolean };
  href: string;
}) {
  const { data, isLoading } = useProducts();
  const products = (data ?? []) as never[];

  return (
    <section className="container-lux py-16 md:py-24">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        action={<Link href={href} className="link-quiet text-xs uppercase tracking-[0.2em] text-ink">View all</Link>}
      />
      {isLoading ? (
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[4/5] animate-pulse bg-line" />
              <div className="h-4 w-2/3 animate-pulse bg-line" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState title="No products yet" description="Check back soon — new pieces drop regularly." className="py-16" />
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {products.slice(0, 8).map((p, i) => (
            <ProductCard key={(p as { id: string }).id} product={p as never} priority={i < 4} />
          ))}
        </div>
      )}
    </section>
  );
}

export function FeaturedProducts() {
  return <ProductRow title="Featured Pieces" eyebrow="The Edit" useProducts={useFeatured} href="/shop?sort=featured" />;
}

export function BestSellers() {
  return <ProductRow title="Best Sellers" eyebrow="Most Wanted" useProducts={useBestSellers} href="/shop?sort=best-selling" />;
}

export function NewArrivals() {
  return <ProductRow title="New Arrivals" eyebrow="Just Landed" useProducts={useNewArrivals} href="/shop?sort=newest" />;
}