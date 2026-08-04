export const SITE = {
  name: "BLA",
  tagline: "Best Life Ahead — luxury streetwear, quietly considered.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1",
  email: "care@bla.example",
  phone: "+234 800 000 0000",
  address: "12 Admiralty Way, Lekki, Lagos, Nigeria",
  currency: "NGN",
  country: "NG",
  instagram: "https://instagram.com",
} as const;

export const CART_TOKEN_KEY = "bla_cart_token";
export const ACCESS_TOKEN_KEY = "bla_access";
export const REFRESH_TOKEN_KEY = "bla_refresh";
export const RECENT_SEARCHES_KEY = "bla_recent_searches";
export const RECENTLY_VIEWED_KEY = "bla_recently_viewed";
