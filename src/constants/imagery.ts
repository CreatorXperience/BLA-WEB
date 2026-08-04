/**
 * Editorial photography. These are graceful fallbacks used while the CMS is
 * unseeded or unavailable — live content always comes from the API.
 */
export const IMAGERY = {
  hero: [
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2000&auto=format&fit=crop",
  ],
  editorial: [
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=1800&auto=format&fit=crop",
  ],
  collection: [
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1467043237213-65f2da53396f?q=80&w=1600&auto=format&fit=crop",
  ],
  product: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=1200&auto=format&fit=crop",
  ],
  journal: [
    "https://images.unsplash.com/photo-1495121553079-4c61bece8e3f?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519897831810-a9a01acebcc8?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop",
  ],
  about: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2000&auto=format&fit=crop",
  instagram: [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop",
  ],
  productFallback: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop",
} as const;

export function fallbackImage(index = 0): string {
  return IMAGERY.product[index % IMAGERY.product.length] ?? IMAGERY.productFallback;
}

export function productImageUrl(url?: string | null, index = 0): string {
  return url || fallbackImage(index);
}
