export const DEFAULT_NAV = [
  { label: "Shop", href: "/shop" },
  { label: "New Arrivals", href: "/shop?sort=newest" },
  { label: "Collections", href: "/collections" },
  { label: "Lookbook", href: "/lookbook" },
  { label: "Journal", href: "/journal" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const FOOTER_LINKS = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "New Arrivals", href: "/shop?sort=newest" },
      { label: "Best Sellers", href: "/shop?sort=best-selling" },
      { label: "Featured", href: "/shop?sort=featured" },
    ],
  },
  {
    title: "Collections",
    links: [
      { label: "Collections", href: "/collections" },
      { label: "Lookbook", href: "/lookbook" },
      { label: "Journal", href: "/journal" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "My Account", href: "/account" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/policy/privacy" },
      { label: "Terms of Service", href: "/policy/terms" },
      { label: "Shipping & Returns", href: "/policy/shipping" },
    ],
  },
] as const;