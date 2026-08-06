/** CMS homepage content — rendered dynamically, never hardcoded. */

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

export interface Look {
  season: string;
  title: string;
  image: string;
  caption?: string;
}

export interface LookbookContent {
  eyebrow: string;
  title: string;
  intro: string;
  looks: Look[];
}

export interface JournalArticle {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  minutes: number;
  body?: string[];
}

export interface JournalContent {
  eyebrow: string;
  title: string;
  intro: string;
  articles: JournalArticle[];
}

export interface AboutValue {
  title: string;
  text: string;
}

export interface AboutContent {
  heroImage: string;
  heroEyebrow: string;
  heroTitle: string;
  manifestoEyebrow: string;
  manifesto: string;
  values: AboutValue[];
  bandEyebrow: string;
  bandImage: string;
  bandTitle: string;
  bandText: string;
}
