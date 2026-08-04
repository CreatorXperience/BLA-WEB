"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetCloseX,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { productImageUrl } from "@/constants/imagery";
import { useUIStore } from "@/store/ui-store";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

export function CartDrawer() {
  const open = useUIStore((s) => s.cartOpen);
  const close = useUIStore((s) => s.closeCart);
  const cart = useCartStore((s) => s.cart);
  const isLoading = useCartStore((s) => s.isLoading);
  const isUpdating = useCartStore((s) => s.isUpdating);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const updateItem = useCartStore((s) => s.updateItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);

  const [couponInput, setCouponInput] = useState("");

  const items = cart?.items ?? [];
  const currency = cart?.currency ?? "NGN";
  const hasItems = items.length > 0;

  const handleQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    void updateItem(itemId, quantity);
  };

  const handleCoupon = async () => {
    if (!couponInput.trim()) return;
    try {
      await applyCoupon(couponInput.trim());
      toast.success("Coupon applied");
      setCouponInput("");
    } catch {
      toast.error("Coupon could not be applied");
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => (o ? null : close())}>
      <SheetContent side="right" className="flex w-full max-w-md flex-col p-0">
        <SheetHeader>
          <SheetTitle>Your Bag</SheetTitle>
          <SheetDescription>View and manage the items in your bag.</SheetDescription>
          <SheetCloseX />
        </SheetHeader>

        {isLoading && !cart ? (
          <div className="space-y-6 p-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="size-24" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : !hasItems ? (
          <EmptyState
            icon={<ShoppingBag className="size-7" />}
            title="Your bag is empty"
            description="Discover limited-edition pieces from the collection."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  close();
                }}
                asChild
              >
                <Link href="/shop">Continue shopping</Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className="no-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto p-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-line pb-5 last:border-0">
                  <Link
                    href={`/products/${item.product?.slug ?? item.slug ?? item.productId}`}
                    className="relative size-24 shrink-0 overflow-hidden bg-mist"
                    onClick={close}
                  >
                    <Image
                      src={productImageUrl(item.product?.imageUrl ?? item.image)}
                      alt={item.product?.name ?? item.name ?? ""}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <Link
                        href={`/products/${item.product?.slug ?? item.slug ?? item.productId}`}
                        onClick={close}
                        className="text-sm leading-snug text-ink hover:opacity-70"
                      >
                        {item.product?.name ?? item.name}
                      </Link>
                      <button
                        onClick={() => void removeItem(item.id)}
                        aria-label="Remove item"
                        className="text-muted transition-colors hover:text-ink"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    {(item.size || item.color) && (
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">
                        {[item.size, item.color].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex h-9 items-center border border-ink/15">
                        <button
                          onClick={() => handleQuantity(item.id, item.quantity - 1)}
                          className="flex size-9 items-center justify-center hover:bg-line/60"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantity(item.id, item.quantity + 1)}
                          className="flex size-9 items-center justify-center hover:bg-line/60"
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <p className="text-sm text-ink">{formatPrice(item.unitPrice ?? item.price, currency)}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Coupon */}
              <div>
                {cart?.coupon ? (
                  <div className="mb-3 flex items-center justify-between border border-ink/15 bg-mist px-4 py-3">
                    <p className="text-sm text-ink">
                      Coupon <span className="uppercase">{cart.coupon.code}</span>
                    </p>
                    <button
                      onClick={() => void removeCoupon()}
                      className="text-xs text-muted underline-offset-2 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCoupon()}
                    placeholder="Discount code"
                    className="h-10 flex-1 border border-ink/15 bg-transparent px-3 text-sm uppercase focus-visible:border-ink focus-visible:outline-none"
                  />
                  <button
                    onClick={handleCoupon}
                    disabled={isUpdating}
                    className="h-10 border border-ink px-4 text-[11px] uppercase tracking-[0.16em] transition-colors hover:bg-ink hover:text-background disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-line p-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="text-ink">{formatPrice(cart?.subtotal, currency)}</span>
                </div>
                {cart && cart.discount > 0 ? (
                  <div className="flex justify-between text-muted">
                    <span>Discount</span>
                    <span className="text-ink">−{formatPrice(cart.discount, currency)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between border-t border-line pt-3 text-base">
                  <span className="text-ink">Total</span>
                  <span className="text-ink">{formatPrice(cart?.total, currency)}</span>
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-2">
                <Button size="lg" asChild onClick={close} className="w-full">
                  <Link href={isAuthenticated ? "/checkout" : "/checkout"}>Checkout</Link>
                </Button>
                <Button variant="outline" size="sm" asChild onClick={close}>
                  <Link href="/shop">View full collection</Link>
                </Button>
              </div>
            </div>
</>
      )}
    </SheetContent>
  </Sheet>
  );
}