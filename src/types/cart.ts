import type { ProductVariant } from "./product";

export interface CartItem {
  id: string;
  quantity: number;
  productId?: string;
  variantId?: string | null;
  product?: {
    id: string;
    name: string;
    slug: string;
    brand?: string | null;
    imageUrl?: string | null;
  } | null;
  variant?: ProductVariant | null;
  name?: string;
  slug?: string;
  image?: string | null;
  color?: string | null;
  size?: string | null;
  unitPrice?: number;
  price?: number;
  compareAtPrice?: number | null;
  stockStatus?: string;
}

export interface ShippingEstimate {
  methodId?: string;
  name?: string;
  rate?: number;
  currency?: string;
  estimatedDaysMin?: number | null;
  estimatedDaysMax?: number | null;
}

export interface Cart {
  id: string;
  token: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  shippingEstimate?: ShippingEstimate | null;
  shippingRate?: number;
  shippingMethodId?: string | null;
  tax?: number;
  total: number;
  currency: string;
  coupon?: { code: string; discount?: number } | null;
}
