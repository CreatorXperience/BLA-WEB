import { create } from "zustand";
import { wishlistService } from "@/services/account";
import type { WishlistItem } from "@/types/misc";

interface WishlistState {
  items: WishlistItem[];
  ids: Set<string>;
  isLoading: boolean;
  isUpdating: boolean;
  hydrated: boolean;
  fetch: () => Promise<void>;
  toggle: (productId: string) => Promise<boolean>;
  remove: (productId: string) => Promise<void>;
  clear: () => void;
  clearLocal: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  ids: new Set<string>(),
  isLoading: false,
  isUpdating: false,
  hydrated: false,

  fetch: async () => {
    set({ isLoading: true });
    try {
      const items = await wishlistService.list();
      set({ items, ids: new Set(items.map((i) => i.productId)), hydrated: true });
    } catch {
      set({ hydrated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  toggle: async (productId) => {
    const { ids } = get();
    const exists = ids.has(productId);
    set({ isUpdating: true });
    try {
      if (exists) {
        await wishlistService.remove(productId);
        const items = get().items.filter((i) => i.productId !== productId);
        set({ items, ids: new Set(items.map((i) => i.productId)) });
      } else {
        await wishlistService.add(productId);
        await get().fetch();
      }
      return !exists;
    } catch (err) {
      console.error("Wishlist toggle failed", err);
      throw err;
    } finally {
      set({ isUpdating: false });
    }
  },

  remove: async (productId) => {
    await wishlistService.remove(productId);
    const items = get().items.filter((i) => i.productId !== productId);
    set({ items, ids: new Set(items.map((i) => i.productId)) });
  },

  clear: () => set({ items: [], ids: new Set<string>() }),

  clearLocal: () => {
    const wasHydrated = get().hydrated;
    set({ items: [], ids: new Set<string>(), hydrated: wasHydrated });
  },
}));
