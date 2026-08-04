import { create } from "zustand";
import { setTokens } from "@/services/client";
import { authService, type LoginInput, type RegisterInput } from "@/services/auth";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/site";
import type { User } from "@/types/user";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hydrated: boolean;
  setSession: (access: string, refresh: string, user: User) => void;
  setUser: (user: User | null) => void;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => void;
}

function readTokens(): { access: string | null; refresh: string | null } {
  if (typeof window === "undefined") return { access: null, refresh: null };
  return {
    access: window.localStorage.getItem(ACCESS_TOKEN_KEY),
    refresh: window.localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  hydrated: false,

  setSession: (access, refresh, user) => {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, access);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    setTokens(access, refresh);
    set({ accessToken: access, refreshToken: refresh, user, isAuthenticated: true });
  },

  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),

  login: async (input) => {
    set({ isLoading: true });
    try {
      const session = await authService.login(input);
      get().setSession(session.accessToken, session.refreshToken, session.user);
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (input) => {
    set({ isLoading: true });
    try {
      const session = await authService.register(input);
      get().setSession(session.accessToken, session.refreshToken, session.user);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    const { refreshToken } = get();
    await authService.logout(refreshToken ?? undefined);
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    setTokens(null, null);
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  hydrate: () => {
    const { access, refresh } = readTokens();
    if (access) setTokens(access, refresh);
    set({ accessToken: access, refreshToken: refresh, isAuthenticated: Boolean(access), hydrated: true });
  },
}));
