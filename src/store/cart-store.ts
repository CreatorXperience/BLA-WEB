import { create } from "zustand";
import { cartService, type AddToCartInput } from "@/services/cart";
import { CART_TOKEN_KEY } from "@/constants/site";
import type { Cart } from "@/types/cart";

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  lastUpdated: number | null;
  hydrate: () => void;
  fetchCart: () => Promise<void>;
  addItem: (input: AddToCartInput) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: () => void;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  setShipping: (methodId: string, country: string) => Promise<void>;
  mergeGuestCart: (userId: string) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  isUpdating: false,
  error: null,
  lastUpdated: null,

  hydrate: () => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(CART_TOKEN_KEY)) {
      window.localStorage.setItem(
        CART_TOKEN_KEY,
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `guest-${Date.now()}`,
      );
    }
    void get().fetchCart();
  },

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.get();
      set({ cart, lastUpdated: Date.now() });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load cart" });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (input) => {
    set({ isUpdating: true, error: null });
    try {
      const cart = await cartService.addItem(input);
      set({ cart, lastUpdated: Date.now() });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Could not add item" });
      throw err;
    } finally {
      set({ isUpdating: false });
    }
  },

  updateItem: async (itemId, quantity) => {
    set({ isUpdating: true, error: null });
    try {
      const cart = await cartService.updateItem(itemId, { quantity });
      set({ cart, lastUpdated: Date.now() });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Could not update item" });
    } finally {
      set({ isUpdating: false });
    }
  },

  removeItem: async (itemId) => {
    set({ isUpdating: true, error: null });
    try {
      const cart = await cartService.removeItem(itemId);
      set({ cart, lastUpdated: Date.now() });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Could not remove item" });
    } finally {
      set({ isUpdating: false });
    }
  },

  clear: () => {
    set({ cart: { ...(get().cart as Cart), items: [], itemCount: 0, subtotal: 0, total: 0 } as Cart });
    void cartService.clear().then((cart) => set({ cart, lastUpdated: Date.now() })).catch(() => undefined);
  },

  applyCoupon: async (code) => {
    set({ isUpdating: true, error: null });
    try {
      const cart = await cartService.applyCoupon(code);
      set({ cart, lastUpdated: Date.now() });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Invalid coupon" });
      throw err;
    } finally {
      set({ isUpdating: false });
    }
  },

  removeCoupon: async () => {
    set({ isUpdating: true, error: null });
    try {
      const cart = await cartService.removeCoupon();
      set({ cart, lastUpdated: Date.now() });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Could not remove coupon" });
    } finally {
      set({ isUpdating: false });
    }
  },

  setShipping: async (methodId, country) => {
    set({ isUpdating: true, error: null });
    try {
      const cart = await cartService.setShipping(methodId, country);
      set({ cart, lastUpdated: Date.now() });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Could not update shipping" });
    } finally {
      set({ isUpdating: false });
    }
  },

  mergeGuestCart: async () => {
    /* Server merges guest cart when an authenticated cart request is made. */
    await get().fetchCart();
  },
}));
