import { create } from "zustand";
import { RECENT_SEARCHES_KEY, RECENTLY_VIEWED_KEY } from "@/constants/site";
import type { Product } from "@/types/product";

interface UiState {
  cartOpen: boolean;
  searchOpen: boolean;
  mobileNavOpen: boolean;
  quickView: { product: Product } | null;
  openCart: () => void;
  closeCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
}

export const useUIStore = create<UiState>((set) => ({
  cartOpen: false,
  searchOpen: false,
  mobileNavOpen: false,
  quickView: null,
  openCart: () => set({ cartOpen: true, mobileNavOpen: false }),
  closeCart: () => set({ cartOpen: false }),
  openSearch: () => set({ searchOpen: true, mobileNavOpen: false }),
  closeSearch: () => set({ searchOpen: false }),
  openMobileNav: () => set({ mobileNavOpen: true, cartOpen: false }),
  closeMobileNav: () => set({ mobileNavOpen: false }),
  openQuickView: (product) => set({ quickView: { product } }),
  closeQuickView: () => set({ quickView: null }),
}));

interface SearchState {
  query: string;
  recent: string[];
  hydrated: boolean;
  setQuery: (q: string) => void;
  addRecent: (q: string) => void;
  clearRecent: () => void;
  hydrate: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  recent: [],
  hydrated: false,
  setQuery: (q) => set({ query: q }),
  addRecent: async (q) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const recent = [trimmed, ...get().recent.filter((r) => r.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
    set({ recent });
  },
  clearRecent: () => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify([]));
    set({ recent: [] });
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
      const recent = raw ? (JSON.parse(raw) as string[]) : [];
      set({ recent, hydrated: true });
    } catch {
      set({ recent: [], hydrated: true });
    }
  },
}));

interface RecentlyViewedState {
  ids: string[];
  hydrate: () => void;
  record: (productId: string) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>((set, get) => ({
  ids: [],
  hydrate: () => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
      set({ ids: raw ? (JSON.parse(raw) as string[]) : [] });
    } catch {
      set({ ids: [] });
    }
  },
  record: (productId) => {
    const ids = [productId, ...get().ids.filter((id) => id !== productId)].slice(0, 8);
    window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(ids));
    set({ ids });
  },
}));