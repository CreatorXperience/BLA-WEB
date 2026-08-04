export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface OrderTimelineEntry {
  id?: string;
  status: OrderStatus | string;
  note?: string | null;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId?: string | null;
  productName: string;
  productSlug?: string | null;
  variantId?: string | null;
  sku?: string | null;
  color?: string | null;
  size?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  imageUrl?: string | null;
}

export interface OrderAddress {
  firstName: string;
  lastName: string;
  phone?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode?: string | null;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingRate: number;
  tax: number;
  total: number;
  currency: string;
  shippingAddress?: OrderAddress | null;
  billingAddress?: OrderAddress | null;
  paymentStatus?: string;
  trackingNumber?: string | null;
  timeline?: OrderTimelineEntry[];
  couponCode?: string | null;
  paymentMethod?: string | null;
  createdAt: string;
}

export interface OrderPaged {
  data: Order[];
  total: number;
  page: number;
  perPage: number;
}
