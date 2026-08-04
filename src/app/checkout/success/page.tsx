import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutSuccess } from "@/features/checkout/checkout-success";

export const metadata: Metadata = {
  title: "Order confirmed",
  description: "Thank you for your order.",
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container-lux py-20">Loading…</div>}>
      <CheckoutSuccess />
    </Suspense>
  );
}
