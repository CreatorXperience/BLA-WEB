"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { productImageUrl } from "@/constants/imagery";
import { useUIStore } from "@/store/ui-store";
import { useCartStore } from "@/store/cart-store";
import type { Product } from "@/types/product";
import { toast } from "sonner";

function uniqueValues(variants: Product["variants"], key: "color" | "size"): string[] {
  const set = new Set<string>();
  for (const v of variants) {
    const value = v[key];
    if (value) set.add(value);
  }
  return Array.from(set);
}

export function QuickView() {
  const product = useUIStore((s) => s.quickView?.product ?? null);
  const close = useUIStore((s) => s.closeQuickView);
  const openCart = useUIStore((s) => s.openCart);
  const addItem = useCartStore((s) => s.addItem);
  const isUpdating = useCartStore((s) => s.isUpdating);

  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const colors = useMemo(() => (product ? uniqueValues(product.variants, "color") : []), [product]);
  const sizes = useMemo(() => (product ? uniqueValues(product.variants, "size") : []), [product]);

  const defaultColor = colors[0] ?? null;
  const selectedColor = color ?? defaultColor;
  const selectedSize = size ?? (sizes.length === 1 ? sizes[0] : null);

  const variant = useMemo(() => {
    if (!product) return null;
    return (
      product.variants.find((v) => (selectedColor ? v.color === selectedColor : true) && (selectedSize ? v.size === selectedSize : true) && v.isActive) ??
      product.variants.find((v) => v.isDefault) ??
      product.variants[0] ??
      null
    );
  }, [product, selectedColor, selectedSize]);

  const addToCart = async () => {
    if (!product || !variant) {
      toast.error("Please select a size");
      return;
    }
    if (product.variants.length > 0 && !selectedSize && sizes.length > 0) {
      toast.error("Please select a size");
      return;
    }
    try {
      await addItem({ productId: product.id, variantId: variant.id, quantity });
      toast.success("Added to bag");
      close();
      openCart();
    } catch {
      toast.error("Could not add to bag");
    }
  };

  return (
    <Dialog open={Boolean(product)} onOpenChange={(o) => (o ? null : close())}>
      <DialogContent className="max-w-4xl p-0 sm:p-0">
        {product ? (
          <div className="grid max-h-[88vh] overflow-y-auto md:grid-cols-2">
            <div className="relative aspect-[4/5] bg-mist">
              <Image
                src={productImageUrl(product.images?.[0]?.url)}
                alt={product.images?.[0]?.altText ?? product.name}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col p-7 md:p-10">
              <div>
                {product.brand ? <p className="eyebrow">{product.brand}</p> : null}
                <h2 className="mt-2 text-2xl font-normal tracking-tight text-ink">{product.name}</h2>
                <p className="mt-2 text-sm text-muted">
                  {formatPrice(product.basePrice, product.currency)}
                  {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.basePrice) ? (
                    <span className="ml-2 text-muted line-through">
                      {formatPrice(product.compareAtPrice, product.currency)}
                    </span>
                  ) : null}
                </p>
              </div>

              <div className="mt-8 flex-1">
                {colors.length > 0 ? (
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Color — {selectedColor ?? "Select"}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {colors.map((c) => (
                        <button
                          key={c}
                          onClick={() => setColor(c)}
                          className={
                            c === selectedColor
                              ? "border border-ink bg-ink px-4 py-2 text-xs text-background"
                              : "border border-ink/20 px-4 py-2 text-xs text-ink hover:border-ink"
                          }
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {sizes.length > 0 ? (
                  <div className="mt-6">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Size — {selectedSize ?? "Select"}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSize(s)}
                          className={
                            s === selectedSize
                              ? "border border-ink bg-ink px-4 py-2 text-xs text-background"
                              : "border border-ink/20 px-4 py-2 text-xs text-ink hover:border-ink"
                          }
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-8 flex items-center gap-4">
                  <div className="flex h-12 items-center border border-ink/20">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex size-12 items-center justify-center hover:bg-line/60" aria-label="Decrease quantity">−</button>
                    <span className="w-8 text-center text-sm tabular-nums">{quantity}</span>
                    <button onClick={() => setQuantity((q) => q + 1)} className="flex size-12 items-center justify-center hover:bg-line/60" aria-label="Increase quantity">+</button>
                  </div>
                  <Button size="lg" className="flex-1" onClick={addToCart} disabled={isUpdating}>
                    Add to Bag
                  </Button>
                </div>

                <Link
                  href={`/products/${product.slug}`}
                  onClick={close}
                  className="mt-6 inline-block text-xs uppercase tracking-[0.18em] text-muted underline-offset-4 hover:text-ink hover:underline"
                >
                  View full details
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-[50vh] items-center justify-center">
            <Skeleton className="h-8 w-40" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}