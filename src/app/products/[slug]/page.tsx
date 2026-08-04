import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductClient } from "@/features/products/product-client";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slugToTitle(slug),
    description: `Shop ${slugToTitle(slug)} at BLA.`,
    alternates: { canonical: `/products/${slug}` },
  };
}

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function ProductPage() {
  return (
    <Suspense fallback={<div className="container-lux py-20">Loading…</div>}>
      <ProductClient />
    </Suspense>
  );
}
