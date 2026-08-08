"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Zap } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { WishlistButton } from "@/components/product/wishlist-button";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { productImageUrl } from "@/constants/imagery";
import { useProduct, useRelated } from "@/hooks/use-catalog";
import { useCartStore } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import { useRecentlyViewedStore } from "@/store/ui-store";
import { toast } from "sonner";

export function ProductClient() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: product, isLoading, error } = useProduct(slug);
  const { data: related } = useRelated(product?.id);
  const addItem = useCartStore((s) => s.addItem);
  const isUpdating = useCartStore((s) => s.isUpdating);
  const openCart = useUIStore((s) => s.openCart);
  const recordView = useRecentlyViewedStore((s) => s.record);

  const [activeImage, setActiveImage] = useState(0);
  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (product) recordView(product.id);
  }, [product, recordView]);

  const colors = useMemo(() => uniqueOf(product?.variants ?? [], "color"), [product]);
  const sizes = useMemo(() => uniqueOf(product?.variants ?? [], "size"), [product]);

  const selectedColor = color ?? colors[0] ?? null;
  const selectedSize = size ?? (sizes.length === 1 ? sizes[0] : null);

  const variant = useMemo(() => {
    if (!product) return null;
    return (
      product.variants.find(
        (v) =>
          (selectedColor ? v.color === selectedColor : true) &&
          (selectedSize ? v.size === selectedSize : true) &&
          v.isActive,
      ) ??
      product.variants.find((v) => v.isDefault) ??
      product.variants[0] ??
      null
    );
  }, [product, selectedColor, selectedSize]);

  if (isLoading) {
    return (
      <div className="container-lux grid gap-10 py-12 md:grid-cols-2 md:py-16">
        <Skeleton className="aspect-[4/5] w-full" />
        <div className="space-y-6 pt-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-lux flex min-h-[50vh] flex-col items-center justify-center gap-4 py-20 text-center">
        <h1 className="text-xl text-ink">Product unavailable</h1>
        <p className="text-sm text-muted">We could not find this product. It may have sold out.</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/shop">Back to shop</Link>
        </Button>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [];
  const inStock = variant?.inventory?.status !== "OUT_OF_STOCK";

  const addToCart = async () => {
    if (!variant) {
      toast.error("This product is unavailable");
      return;
    }
    if (sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    try {
      await addItem({ productId: product.id, variantId: variant.id, quantity });
      toast.success("Added to bag");
      openCart();
    } catch {
      toast.error("Could not add to bag");
    }
  };

  const buyNow = async () => {
    await addToCart();
    openCart();
  };

  return (
    <div className="container-lux py-10 md:py-16">
      <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: product.name }]} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        {/* Gallery */}
        <div>
          <div className="grid grid-cols-[80px_1fr] gap-4 lg:grid-cols-[88px_1fr] lg:gap-5">
            {images.length > 1 ? (
              <div className="no-scrollbar flex max-h-[640px] flex-col gap-3 overflow-y-auto lg:gap-4">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`relative aspect-[3/4] overflow-hidden border bg-mist transition-colors ${i === activeImage ? "border-ink" : "border-transparent"}`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <Image src={productImageUrl(img.url)} alt={img.altText ?? ""} fill sizes="88px" className="object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
            <motion.div
              key={activeImage}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-[4/5] cursor-zoom-in overflow-hidden bg-mist lg:aspect-[4/5]"
              onClick={() => setFullscreen(true)}
            >
              <Image
                src={productImageUrl(images[activeImage]?.url ?? product.images?.[0]?.url)}
                alt={product.name}
                fill
                priority
                sizes="(min-width: 1024px) 44vw, 100vw"
                className="object-cover"
              />
              {images.length > 1 ? (
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {images.map((_, i) => (
                    <span key={i} className={`h-0.5 w-6 transition-colors ${i === activeImage ? "bg-background" : "bg-background/40"}`} />
                  ))}
                </div>
              ) : null}
            </motion.div>
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="eyebrow">{product.brand ?? "BLA"}</p>
          <h1 className="mt-3 text-3xl font-normal tracking-tight text-ink md:text-4xl">{product.name}</h1>
          <div className="mt-4 flex items-center gap-4">
            <p className="text-xl text-ink">{formatPrice(product.basePrice, product.currency)}</p>
            {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.basePrice) ? (
              <p className="text-base text-muted line-through">{formatPrice(product.compareAtPrice, product.currency)}</p>
            ) : null}
          </div>

          {product.shortDescription ? (
            <p className="mt-6 max-w-lg leading-relaxed text-muted">{product.shortDescription}</p>
          ) : null}

          {/* Color */}
          {colors.length > 0 ? (
            <div className="mt-8">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Color — {selectedColor ?? "Select"}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={
                      c === selectedColor
                        ? "border border-ink bg-ink px-5 py-2.5 text-xs text-background"
                        : "border border-ink/20 px-5 py-2.5 text-xs text-ink hover:border-ink"
                    }
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Size */}
          {sizes.length > 0 ? (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Size — {selectedSize ?? "Select"}</p>
                <button className="text-[11px] text-muted underline-offset-2 hover:underline">Size guide</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={
                      s === selectedSize
                        ? "border border-ink bg-ink px-5 py-2.5 text-xs text-background"
                        : "border border-ink/20 px-5 py-2.5 text-xs text-ink hover:border-ink"
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Quantity + CTAs */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <div className="flex h-14 shrink-0 items-center border border-ink/20">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex size-14 items-center justify-center hover:bg-line/60" aria-label="Decrease quantity">
                <Minus className="size-4" />
              </button>
              <span className="w-10 text-center text-sm tabular-nums">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="flex size-14 items-center justify-center hover:bg-line/60" aria-label="Increase quantity">
                <Plus className="size-4" />
              </button>
            </div>
            <Button size="lg" className="min-w-[200px] flex-1" onClick={addToCart} disabled={isUpdating || !inStock}>
              {inStock ? "Add to Bag" : "Sold Out"}
            </Button>
            <WishlistButton productId={product.id} className="size-14 shrink-0 border-ink/20" />
          </div>

          <Button variant="outline" size="lg" className="mt-3 w-full" onClick={buyNow} disabled={!inStock}>
            <Zap className="size-4" /> Buy Now
          </Button>

          {!inStock ? (
            <p className="mt-4 text-sm text-muted">This product is currently out of stock.</p>
          ) : null}

          {/* Accordions */}
          <div className="mt-12">
            <Accordion type="single" collapsible>
              <AccordionItem value="details">
                <AccordionTrigger>Details</AccordionTrigger>
                <AccordionContent>
                  {product.longDescription ?? product.shortDescription ?? "Details coming soon."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="materials">
                <AccordionTrigger>Materials & Care</AccordionTrigger>
                <AccordionContent>
                  {product.materials ? <p className="mb-3">{product.materials}</p> : <p className="mb-3">Premium fabrics selected for longevity.</p>}
                  {product.careInstructions ? <p>{product.careInstructions}</p> : null}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger>Shipping & Returns</AccordionTrigger>
                <AccordionContent>
                  Free domestic shipping on orders over ₦150,000. Orders are dispatched within 24 hours and
                  typically arrive in 1–5 business days. Returns accepted within 14 days in original condition.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Related */}
      {related && related.length > 0 ? (
        <section className="mt-24">
          <p className="eyebrow">You may also like</p>
          <h2 className="editorial-title mt-3 text-ink">Complete the look</h2>
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Fullscreen image */}
      <AnimatePresence>
        {fullscreen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-6"
            onClick={() => setFullscreen(false)}
          >
            <Image
              src={productImageUrl(images[activeImage]?.url ?? product.images?.[0]?.url)}
              alt={product.name}
              fill
              sizes="100vw"
              className="object-contain"
            />
            <button
              onClick={() => setFullscreen(false)}
              className="absolute right-6 top-6 flex size-11 items-center justify-center border border-background/40 text-background"
              aria-label="Close fullscreen"
            >
              <Plus className="size-5 rotate-45" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function uniqueOf<T extends { color?: string | null; size?: string | null }>(variants: T[], key: "color" | "size"): string[] {
  const set = new Set<string>();
  for (const v of variants) {
    const value = v[key];
    if (value) set.add(value);
  }
  return Array.from(set);
}
