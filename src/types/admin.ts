import type { ProductStatus } from "@/types/product";
import type { OrderStatus } from "@/types/order";
import type { Role } from "@/types/user";

export type { Role };

// ---- Dashboard overview ----

export interface DashboardKpis {
  revenue: number;
  revenueDelta: number;
  orders: number;
  ordersDelta: number;
  customers: number;
  newCustomers: number;
  returningCustomers: number;
  averageOrderValue: number;
  totalProducts: number;
  pendingReviews: number;
}

export interface DashboardInventory {
  lowStock: number;
  inStock: number;
  outOfStock: number;
}

export interface DashboardActionItems {
  pendingOrders: number;
  lowStockAlerts: number;
  pendingReviews: number;
}

export interface BestSeller {
  id: string;
  name: string;
  slug: string;
  totalSold: number;
  revenue: number;
  imageUrl?: string | null;
}

export interface RevenuePoint {
  date: string;
  value: number;
}

export interface DashboardRecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  status: OrderStatus;
  grandTotal: string;
  placedAt: string;
}

export interface DashboardOverview {
  kpis: DashboardKpis;
  inventory: DashboardInventory;
  actionItems: DashboardActionItems;
  bestSellers: BestSeller[];
  revenueSeries: RevenuePoint[];
  recentOrders: DashboardRecentOrder[];
}

// ---- Products (admin detail shape from mapDetail) ----

export interface AdminProductImage {
  id: string;
  url: string;
  thumbUrl?: string | null;
  zoomUrl?: string | null;
  videoUrl?: string | null;
  altText?: string | null;
  kind?: string;
  isThumbnail: boolean;
  sortOrder: number;
}

export interface AdminProductVariant {
  id: string;
  sku?: string | null;
  color?: string | null;
  size?: string | null;
  price: string;
  compareAtPrice?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  isDefault: boolean;
  inventory?: {
    quantity: number;
    reserved?: number;
    available?: number;
    status?: string;
  } | null;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  longDescription?: string | null;
  brand?: string | null;
  gender?: "MEN" | "WOMEN" | "UNISEX" | "KIDS" | null;
  materials?: string | null;
  careInstructions?: string | null;
  fit?: string | null;
  tags?: string[] | null;
  sku?: string | null;
  status: ProductStatus;
  basePrice: string;
  compareAtPrice?: string | null;
  currency: string;
  rating: string;
  reviewCount: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  isLimitedEdition: boolean;
  categories: { id: string; name: string; slug: string }[];
  collections: { id: string; name: string; slug: string }[];
  images: AdminProductImage[];
  variants: AdminProductVariant[];
  availableSizes?: string[];
  availableColors?: string[];
  totalStock?: number;
  inStock?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminProductList {
  data: AdminProduct[];
  total: number;
  nextCursor?: string | null;
  page?: number;
  perPage?: number;
}

export interface ProductFlagsInput {
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
  isNewArrival?: boolean;
  isLimitedEdition?: boolean;
}

export interface AdminProductQuery {
  page?: number;
  perPage?: number;
  status?: ProductStatus | "";
  q?: string;
  sort?: string;
}

// ---- Orders ----

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  email?: string;
  customer?: string;
  items?: Array<{ productName: string; quantity: number }>;
  itemCount?: number;
  grandTotal: string;
  subtotal?: string;
  shippingTotal?: string;
  taxTotal?: string;
  discountTotal?: string;
  currency: string;
  placedAt: string;
}

export interface AdminOrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  email: string;
  phone?: string | null;
  currency: string;
  subtotal: string;
  discountTotal: string;
  shippingTotal: string;
  taxTotal: string;
  grandTotal: string;
  amountPaid: string;
  couponCode?: string | null;
  couponDiscount?: string;
  trackingNumber?: string | null;
  courier?: string | null;
  customerNote?: string | null;
  adminNote?: string | null;
  isGuest: boolean;
  placedAt: string;
  paidAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  user?: { id: string; firstName?: string | null; lastName?: string | null; email: string } | null;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    variantLabel?: string | null;
    sku: string;
    imageUrl?: string | null;
    unitPrice: string;
    quantity: number;
    discount: string;
    totalPrice: string;
    color?: string | null;
    size?: string | null;
  }>;
  shippingAddress?: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postalCode?: string | null;
    country: string;
  } | null;
  shippingAddressSnapshot?: unknown;
  timeline?: Array<{ id: string; status: string; note?: string | null; createdAt: string }>;
  payments?: Array<{
    id: string;
    reference: string;
    provider?: string;
    amount?: string;
    status?: string;
    paidAt?: string | null;
  }>;
  shippingMethod?: { id: string; name: string } | null;
  createdAt: string;
}

export interface AdminOrderQuery {
  page?: number;
  perPage?: number;
  status?: OrderStatus | "";
  q?: string;
  sort?: string;
  from?: string;
  to?: string;
}

export interface AdminOrderPaged {
  data: AdminOrderListItem[];
  total: number;
  page: number;
  perPage: number;
}

// ---- Users ----

export interface AdminUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  _count?: { orders: number; reviews: number; wishlistItems: number };
}

export interface AdminUserPaged {
  data: AdminUser[];
  total: number;
  page: number;
  perPage: number;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  actor?: { id: string; email: string } | null;
  createdAt: string;
}

export interface AdminUserQuery {
  page?: number;
  perPage?: number;
  q?: string;
  role?: Role | "";
  isActive?: string;
  sort?: "createdAt" | "lastLoginAt";
  order?: "asc" | "desc";
}

export interface AuditLogQuery {
  page?: number;
  perPage?: number;
  entity?: string;
  action?: string;
}

// ---- Coupons ----

export interface Coupon {
  id: string;
  code: string;
  type: string;
  value: string;
  maxDiscountAmount?: string | null;
  minPurchaseAmount?: string | null;
  freeShippingOnly: boolean;
  isActive: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  perUserLimit: number;
  appliesTo?: string;
  applicableIds?: string[];
  isSingleUse?: boolean;
  isStackable?: boolean;
  customerEmails?: string[];
  createdAt: string;
}

export interface CouponInput {
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  maxDiscountAmount?: number;
  minPurchaseAmount?: number;
  freeShippingOnly?: boolean;
  isActive?: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
  usageLimit?: number;
  perUserLimit?: number;
  appliesTo?: "ALL" | "CATEGORY" | "COLLECTION" | "PRODUCT";
  applicableIds?: string[];
  isSingleUse?: boolean;
  isStackable?: boolean;
  customerEmails?: string[];
}

export interface CouponPaged {
  data: Coupon[];
  total: number;
  page: number;
  perPage: number;
}

// ---- CMS ----

export type HomepageSectionType =
  | "HERO_BANNER"
  | "ANNOUNCEMENT_BAR"
  | "FEATURED_COLLECTIONS"
  | "FEATURED_PRODUCTS"
  | "NEW_ARRIVALS"
  | "EDITORIAL"
  | "INSTAGRAM_GALLERY"
  | "TESTIMONIALS"
  | "NEWSLETTER"
  | "PROMOTIONAL_BANNER"
  | "FOOTER_LINK"
  | "NAVIGATION";

export interface HomepageSectionAdmin {
  id: string;
  sectionKey: string;
  sectionType: HomepageSectionType;
  title?: string | null;
  subtitle?: string | null;
  content?: Record<string, unknown> | null;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  sortOrder: number;
  publishedAt?: string | null;
}

export interface StoreSettingAdmin {
  id: string;
  key: string;
  value: unknown;
  group: string;
  isSecret: boolean;
  description?: string | null;
}

export interface AnnouncementAdmin {
  id: string;
  message: string;
  link?: string | null;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt: string;
}

export interface NavItemAdmin {
  id: string;
  label: string;
  url?: string | null;
  type: string;
  refId?: string | null;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
  children?: NavItemAdmin[];
}

export interface CmsPageAdmin {
  id: string;
  title: string;
  slug: string;
  body: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt: string;
}
