import type { Product } from "./product";

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  createdAt?: string;
}

export interface SearchResult {
  items: Product[];
  total: number;
}

export interface SearchAutocomplete {
  suggestions: string[];
  products?: Product[];
}

export interface JournalArticle {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  category?: string | null;
  author?: string | null;
  publishedAt?: string;
  body?: string;
}
