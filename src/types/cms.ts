/** CMS homepage content — rendered dynamically, never hardcoded. */

export type HomepageSectionType =
  | "HERO_BANNER"
  | "ANNOUNCEMENT_BAR"
  | "FEATURED_COLLECTIONS"
  | "FEATURED_PRODUCTS"
  | "EDITORIAL_BANNER"
  | "BEST_SELLERS"
  | "NEW_ARRIVALS"
  | "BRAND_STORY"
  | "INSTAGRAM"
  | "NEWSLETTER";

export interface HomepageSection {
  id: string;
  sectionKey: string;
  sectionType: HomepageSectionType;
  title?: string | null;
  subtitle?: string | null;
  content: Record<string, unknown>;
  sortOrder: number;
  status?: string;
}

export interface HomepageContent {
  hero: HomepageSection[];
  sections: HomepageSection[];
}

export interface Announcement {
  id: string;
  message: string;
  isActive: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  type: string;
  refId?: string | null;
  url: string;
  sortOrder: number;
  children?: NavItem[];
}

export interface StoreSetting {
  key: string;
  value: string;
  group?: string;
  description?: string | null;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  body: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  publishedAt?: string | null;
}
