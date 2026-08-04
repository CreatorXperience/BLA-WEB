"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn, formatPrice } from "@/lib/utils";
import { productImageUrl } from "@/constants/imagery";
import type { Product } from "@/types/product";
import { WishlistButton } from "@/components/product/wishlist-button";
import { useUIStore } from "@/store/ui-store";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  className?: string;
}

export function ProductCard({ product, priority = false, className }: ProductCardProps) {
  const openQuickView = useUIStore((s) => s.openQuickView);
  const openCart = useUIStore((s) => s.openCart);
  const addItem = useCartStore((s) => s.addItem);
  const isUpdating = useCartStore((s) => s.isUpdating);

  const defaultVariant = useMemo(
    () =>
      product.variants?.find((v) => v.isDefault) ??
      product.variants?.find((v) => v.isActive) ??
      product.variants?.[0],
    [product.variants],
  );

  const image = productImageUrl(product.images?.[0]?.url);
  const hoverImage = productImageUrl(product.images?.[1]?.url ?? product.images?.[0]?.url, 1);
  const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const price = Number(product.basePrice ?? 0);

  const quickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultVariant) {
      openQuickView(product);
      return;
    }
    try {
      await addItem({ productId: product.id, variantId: defaultVariant.id, quantity: 1 });
      toast.success("Added to bag");
      openCart();
    } catch {
      toast.error("Could not add to bag");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn("group", className)}
    >
      <Link href={`/products/${product.slug}`} className="block" aria-label={product.name}>
        <div className="relative aspect-[4/5] overflow-hidden bg-mist">
          <Image
            src={image}
            alt={product.images?.[0]?.altText ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-lux)] group-hover:opacity-0"
            priority={priority}
          />
          {hoverImage !== image ? (
            <Image
              src={hoverImage}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="scale-105 object-cover opacity-0 transition-all duration-[1.2s] ease-[var(--ease-lux)] group-hover:scale-100 group-hover:opacity-100"
            />
          ) : null}
          <div className="absolute right-3 top-3 z-10">
            <WishlistButton productId={product.id} />
          </div>

          <div className="absolute inset-x-3 bottom-3 z-10 translate-y-2 opacity-0 transition-all duration-500 ease-[var(--ease-lux)] group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <button
                onClick={quickAdd}
                disabled={isUpdating}
                className="h-10 flex-1 bg-background/95 text-xs uppercase tracking-[0.16em] text-ink backdrop-blur transition-colors hover:bg-ink hover:text-background"
              >
                Quick Add
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openQuickView(product);
                }}
                aria-label="Quick view"
                className="h-10 border border-ink/15 bg-background/95 px-4 text-[11px] uppercase tracking-[0.14em] text-ink backdrop-blur transition-colors hover:bg-ink hover:text-background"
              >
                View
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-start justify-between gap-3 pt-4">
          <div>
            {product.brand ? (
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted">{product.brand}</p>
            ) : null}
            <h3 className="mt-1 text-[15px] font-normal tracking-wide text-ink">{product.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-ink">
              {formatPrice(price, product.currency)}
            </p>
            {compareAt && compareAt > price ? (
              <p className="text-xs text-muted line-through">{formatPrice(compareAt, product.currency)}</p>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
