import { apiClient, unwrap } from "./client";
import type { ApiResponse } from "@/types/api";
import type { AuthSession, AuthTokens, User } from "@/types/user";

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

function toSession(res: ApiResponse<AuthResponse>): AuthSession {
  const { user, tokens } = unwrap(res);
  return { user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthSession> {
    const res = await apiClient<ApiResponse<AuthResponse>>("/auth/register", {
      method: "POST",
      body: input,
    });
    return toSession(res);
  },

  async login(input: LoginInput): Promise<AuthSession> {
    const res = await apiClient<ApiResponse<AuthResponse>>("/auth/login", {
      method: "POST",
      body: input,
    });
    return toSession(res);
  },

  async logout(refreshToken?: string): Promise<void> {
    await apiClient("/auth/logout", {
      method: "POST",
      auth: true,
      body: refreshToken ? { refreshToken } : undefined,
      skipRetry: true,
    }).catch(() => undefined);
  },

  async me(): Promise<User> {
    const res = await apiClient<ApiResponse<User>>("/auth/me", { auth: true });
    return unwrap(res);
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient("/auth/forgot-password", { method: "POST", body: { email } });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient("/auth/reset-password", {
      method: "POST",
      body: { token, password },
    });
  },

  async verifyEmail(token: string): Promise<void> {
    await apiClient("/auth/verify-email", { method: "POST", body: { token } });
  },

  async resendVerification(email: string): Promise<void> {
    await apiClient("/auth/resend-verification", { method: "POST", body: { email } });
  },
};
