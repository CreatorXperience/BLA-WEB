import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopClient } from "@/features/shop/shop-client";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse the BLA collection — limited-edition luxury streetwear.",
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container-lux py-20">Loading…</div>}>
      <ShopClient />
    </Suspense>
  );
}
