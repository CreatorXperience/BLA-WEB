"use client";

import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist-store";
import { useCartStore } from "@/store/cart-store";
import { useWishlistHydration } from "@/hooks/use-account";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { productImageUrl } from "@/constants/imagery";

export function AccountWishlist() {
  useWishlistHydration();
  const items = useWishlistStore((s) => s.items);
  const isLoading = useWishlistStore((s) => s.isLoading);
  const remove = useWishlistStore((s) => s.remove);
  const isUpdating = useWishlistStore((s) => s.isUpdating);
  const addItem = useCartStore((s) => s.addItem);

  const moveToCart = async (product: typeof items[number]["product"]) => {
    const variant = product.variants?.find((v) => v.isDefault) ?? product.variants?.[0];
    if (!variant) {
      toast.error("This product is unavailable");
      return;
    }
    try {
      await addItem({ productId: product.id, variantId: variant.id, quantity: 1 });
      toast.success("Added to bag");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add to bag");
    }
  };

  return (
    <div>
      <header className="mb-8">
        <p className="eyebrow">Wishlist</p>
        <h2 className="editorial-title mt-2 text-ink">Saved pieces</h2>
        <p className="mt-3 text-sm text-muted">{items.length > 0 ? `${items.length} item${items.length === 1 ? "" : "s"} saved` : "Pieces you save live here."}</p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="Your wishlist is empty" description="Tap the heart on any product to save it here." />
      ) : (
        <ul className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-3">
          {items.map((item) => {
            const p = item.product;
            const img = p.images?.[0];
            return (
              <li key={item.id} className="group">
                <Link href={`/products/${p.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-mist">
                  {img ? (
                    <Image src={productImageUrl(img.url)} alt={img.altText ?? p.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                  ) : null}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      void remove(p.id).catch(() => toast.error("Could not remove item"));
                    }}
                    className="absolute right-3 top-3 flex size-9 items-center justify-center bg-background/90 text-ink backdrop-blur transition-opacity opacity-100 hover:opacity-80 md:opacity-0 md:group-hover:opacity-100"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </Link>
                <div className="mt-4">
                  <Link href={`/products/${p.slug}`} className="text-sm text-ink hover:underline">
                    {p.name}
                  </Link>
                  <p className="mt-1 text-xs text-muted">{p.brand ?? "BLA"}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-ink">{formatPrice(p.basePrice, p.currency)}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void moveToCart(p)}
                      disabled={isUpdating}
                      className="px-3 py-1 text-[11px]"
                    >
                      Add to bag
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
