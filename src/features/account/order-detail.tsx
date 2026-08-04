"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Check } from "lucide-react";
import { useOrder } from "@/hooks/use-account";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { productImageUrl } from "@/constants/imagery";
import type { OrderStatus } from "@/types/order";

const STATUS_STEPS: OrderStatus[] = ["PENDING", "PAID", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED"];

export function OrderDetail() {
  const params = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(params.id);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="border border-line p-14 text-center">
        <p className="text-sm text-muted">We could not find this order.</p>
        <Link href="/account/orders" className="mt-3 inline-block text-sm text-ink underline-offset-2 hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const stepIndex = Math.max(0, STATUS_STEPS.indexOf(order.status));
  const isFinal = ["CANCELLED", "REFUNDED"].includes(order.status);

  return (
    <div>
      <Breadcrumbs items={[{ label: "Account", href: "/account" }, { label: "Orders", href: "/account/orders" }, { label: order.orderNumber }]} className="mb-8" />

      <header className="flex flex-wrap items-start justify-between gap-4 border border-line p-8">
        <div>
          <p className="eyebrow">Order {order.orderNumber}</p>
          <p className="mt-2 text-sm text-muted">
            Placed {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} at{" "}
            {new Date(order.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </p>
          {order.trackingNumber ? (
            <p className="mt-1 text-xs text-muted">
              Tracking <span className="text-ink">{order.trackingNumber}</span>
            </p>
          ) : null}
        </div>
        <span className="border border-ink px-4 py-2 text-xs uppercase tracking-[0.18em] text-ink">{order.status}</span>
      </header>

      {/* Timeline */}
      {!isFinal ? (
        <div className="mt-6 border border-line p-8">
          <ol className="flex items-center">
            {STATUS_STEPS.map((step, i) => {
              const done = i <= stepIndex;
              return (
                <li key={step} className={`flex items-center ${i > 0 ? "flex-1" : ""}`}>
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex size-8 items-center justify-center rounded-full border text-xs ${done ? "border-ink bg-ink text-background" : "border-line text-muted"}`}
                    >
                      {done ? <Check className="size-3.5" /> : i + 1}
                    </span>
                    <span className={`mt-2 hidden text-[10px] uppercase tracking-[0.14em] sm:block ${done ? "text-ink" : "text-muted"}`}>
                      {step}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 ? (
                    <span className={`mx-2 mb-6 h-px flex-1 sm:mb-8 ${i < stepIndex ? "bg-ink" : "bg-line"}`} />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}

      {/* Items */}
      <section className="mt-6">
        <h2 className="text-sm uppercase tracking-[0.2em] text-muted">Items</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-5 py-6">
              <div className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden bg-mist">
                {item.imageUrl ? (
                  <Image src={productImageUrl(item.imageUrl)} alt={item.productName} fill sizes="80px" className="object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/products/${item.productSlug ?? ""}`} className="text-sm text-ink hover:underline">
                  {item.productName}
                </Link>
                <p className="mt-1 text-xs text-muted">
                  {[item.color, item.size].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-1 text-xs text-muted">Qty {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-ink">{formatPrice(item.lineTotal, order.currency)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Summary */}
      <section className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="border border-line p-6 md:col-span-1">
          <h2 className="text-sm uppercase tracking-[0.2em] text-muted">Summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="text-ink">{formatPrice(order.subtotal, order.currency)}</dd>
            </div>
            {order.discount > 0 ? (
              <div className="flex justify-between">
                <dt className="text-muted">Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt>
                <dd className="text-ink">−{formatPrice(order.discount, order.currency)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd className="text-ink">{order.shippingRate > 0 ? formatPrice(order.shippingRate, order.currency) : "Free"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Tax</dt>
              <dd className="text-ink">{formatPrice(order.tax, order.currency)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3">
              <dt className="font-medium text-ink">Total</dt>
              <dd className="font-medium text-ink">{formatPrice(order.total, order.currency)}</dd>
            </div>
          </dl>
        </div>

        <div className="border border-line p-6 md:col-span-1">
          <h2 className="text-sm uppercase tracking-[0.2em] text-muted">Shipping address</h2>
          {order.shippingAddress ? (
            <address className="mt-4 text-sm not-italic leading-relaxed text-muted">
              <p className="text-ink">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 ? <p>{order.shippingAddress.line2}</p> : null}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode ?? ""}
              </p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone ? <p className="pt-2">{order.shippingAddress.phone}</p> : null}
            </address>
          ) : (
            <p className="mt-4 text-sm text-muted">No shipping address recorded.</p>
          )}
        </div>

        <div className="border border-line p-6 md:col-span-1">
          <h2 className="text-sm uppercase tracking-[0.2em] text-muted">Payment</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Method</dt>
              <dd className="text-ink">{order.paymentMethod ?? "Card"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Status</dt>
              <dd className="text-ink">{order.paymentStatus ?? "—"}</dd>
            </div>
          </dl>
          <Link href={`/account/orders/${order.id}/invoice`} className="mt-6 inline-block text-xs text-ink underline-offset-2 hover:underline">
            Download invoice
          </Link>
        </div>
      </section>
    </div>
  );
}
