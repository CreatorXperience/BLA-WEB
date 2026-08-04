"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useRecentlyViewedStore, useSearchStore } from "@/store/ui-store";
import { authService } from "@/services/auth";

/**
 * Client-side bootstrap that restores persisted auth/cart/search/recent state
 * and refreshes the user profile + wishlist when a browser session exists.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const setUser = useAuthStore((s) => s.setUser);
  const hydrateCart = useCartStore((s) => s.hydrate);
  const hydrateSearch = useSearchStore((s) => s.hydrate);
  const hydrateRecent = useRecentlyViewedStore((s) => s.hydrate);
  const wishlistFetch = useWishlistStore((s) => s.fetch);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    hydrateAuth();
    void hydrateCart();
    hydrateSearch();
    hydrateRecent();
  }, [hydrateAuth, hydrateCart, hydrateSearch, hydrateRecent]);

  useEffect(() => {
    if (isAuthenticated) {
      authService
        .me()
        .then(setUser)
        .catch(() => undefined);
      wishlistFetch().catch(() => undefined);
    }
  }, [isAuthenticated, token, setUser, wishlistFetch]);

  return <AuthContext.Provider value={null}>{children}</AuthContext.Provider>;
}

const AuthContext = createContext<null>(null);
export function useAuthContext() {
  return useContext(AuthContext);
}