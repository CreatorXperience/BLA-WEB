"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CheckoutSuccess() {
  const params = useSearchParams();
  const orderNumber = params.get("order");

  return (
    <div className="container-lux flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex size-16 items-center justify-center rounded-full border border-ink bg-ink text-background">
        <Check className="size-7" />
      </span>
      <p className="eyebrow mt-8">Order confirmed</p>
      <h1 className="editorial-title mt-3 text-ink">Thank you</h1>
      <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
        {orderNumber ? (
          <>
            Your order <span className="text-ink">{orderNumber}</span> has been received. A confirmation email is on its way.
          </>
        ) : (
          "Your order has been received. A confirmation email is on its way."
        )}
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/account/orders">Track order</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}
