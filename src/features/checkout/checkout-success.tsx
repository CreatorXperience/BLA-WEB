"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, AlertTriangle, RefreshCw } from "lucide-react";
import { paymentsService } from "@/services/checkout";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";

type PaymentState = "checking" | "success" | "failed" | "pending" | "unconfirmed";

export function CheckoutSuccess() {
  const params = useSearchParams();
  const orderNumber = params.get("order");
  const reference = params.get("reference");
  const fetchCart = useCartStore((s) => s.fetchCart);
  const [state, setState] = useState<PaymentState>("checking");

  useEffect(() => {
    if (!reference) {
      // No reference to verify. Only treat as confirmed when there's not even an
      // order (a stray/non-payment visit). Never claim success for an order whose
      // payment we could not confirm — the gateway was likely cancelled/abandoned.
      if (orderNumber) {
        setState("unconfirmed");
        void fetchCart().catch(() => undefined);
      } else {
        setState("success");
      }
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const payment = await paymentsService.verify(reference);
        if (cancelled) return;
        const s = payment?.status;
        if (s === "CAPTURED" || s === "AUTHORIZED") {
          setState("success");
        } else if (s === "FAILED" || s === "REFUNDED" || s === "REVERSED") {
          // Payment failed — the API cancelled the order and restored the items to
          // the bag. Refresh the cart so the restored items show immediately.
          setState("failed");
          await fetchCart().catch(() => undefined);
        } else {
          setState("pending");
        }
      } catch {
        if (!cancelled) setState("pending");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reference, orderNumber, fetchCart]);

  if (state === "checking") {
    return (
      <div className="container-lux flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
        <RefreshCw className="size-8 animate-spin text-muted" />
        <p className="mt-5 text-sm text-muted">Confirming your payment…</p>
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div className="container-lux flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
        <span className="flex size-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-600">
          <AlertTriangle className="size-7" />
        </span>
        <p className="eyebrow mt-8">Payment not completed</p>
        <h1 className="editorial-title mt-3 text-ink">Your order was not placed</h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
          The payment did not go through{orderNumber ? <> for order <span className="text-ink">{orderNumber}</span></> : null}, so your
          items have been returned to your bag. You can try again whenever you are ready.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/checkout">Retry checkout</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/cart">Review bag</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (state === "pending") {
    return (
      <div className="container-lux flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
        <RefreshCw className="size-8 text-muted" />
        <p className="eyebrow mt-8">Payment pending</p>
        <h1 className="editorial-title mt-3 text-ink">Almost there</h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
          We are still confirming your payment. Check your orders shortly for the final status.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/account/orders">View orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (state === "unconfirmed") {
    return (
      <div className="container-lux flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="size-8 text-amber-600" />
        <p className="eyebrow mt-8">Payment not confirmed</p>
        <h1 className="editorial-title mt-3 text-ink">We could not confirm your payment</h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
          {orderNumber ? (
            <>
              Your order <span className="text-ink">{orderNumber}</span> was not confirmed as paid. If you were taken to the
              payment page but did not see a confirmation, your items are still in your bag.
            </>
          ) : (
            "We could not confirm any recent payment. Your items are still in your bag."
          )}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/checkout">Try again</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/account/orders">Check orders</Link>
          </Button>
        </div>
      </div>
    );
  }

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
            Your order <span className="text-ink">{orderNumber}</span> has been received and paid for. A confirmation email is on
            its way.
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
