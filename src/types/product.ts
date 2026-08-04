export type ProductStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED" | "DELETED";
export type Gender = "MEN" | "WOMEN" | "UNISEX" | "KIDS";
export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "BACKORDER";

export interface ProductImage {
  id: string;
  url: string;
  thumbUrl?: string | null;
  altText?: string | null;
  isThumbnail: boolean;
  sortOrder: number;
  kind?: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  color?: string | null;
  size?: string | null;
  price?: string | number | null;
  compareAtPrice?: string | number | null;
  isActive: boolean;
  isDefault?: boolean;
  inventory?: {
    quantity: number;
    reserved?: number;
    status: StockStatus;
    allowBackorder?: boolean;
  } | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  longDescription?: string | null;
  brand?: string | null;
  gender?: Gender | null;
  tags?: string[];
  sku?: string;
  status: ProductStatus;
  basePrice: number;
  compareAtPrice?: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  totalSold?: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  materials?: string | null;
  careInstructions?: string | null;
  fit?: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
  categories?: { category: { id: string; name: string; slug: string } }[];
  collections?: { collection: { id: string; name: string; slug: string } }[];
}

export interface ProductListResult {
  items: Product[];
  nextCursor?: string | null;
  hasMore: boolean;
  total?: number;
  filters?: {
    colors: string[];
    sizes: string[];
    minPrice: number;
    maxPrice: number;
  };
}

export type ProductSort =
  | "newest"
  | "best-selling"
  | "highest-rated"
  | "price-asc"
  | "price-desc"
  | "trending"
  | "featured";

export interface ProductQuery {
  q?: string;
  category?: string;
  collection?: string;
  brand?: string;
  gender?: Gender;
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  size?: string;
  inStock?: boolean;
  sort?: ProductSort;
  cursor?: string;
  limit?: number;
}
