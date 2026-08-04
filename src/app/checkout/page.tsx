import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutClient } from "@/features/checkout/checkout-client";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure checkout at BLA.",
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container-lux py-20">Loading…</div>}>
      <CheckoutClient />
    </Suspense>
  );
}
