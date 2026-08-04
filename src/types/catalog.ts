export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  bannerUrl?: string | null;
  parentId?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  children?: Category[];
  productCount?: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  bannerUrl?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  productCount?: number;
  products?: { id: string; name: string; slug: string; basePrice: number; compareAtPrice?: number | null; images: { url: string; altText?: string | null; isThumbnail: boolean }[] }[];
}
