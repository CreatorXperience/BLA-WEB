export type Role = "CUSTOMER" | "ADMIN" | "EDITOR" | "MANAGER" | "SUPER_ADMIN";

export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role: Role;
  isEmailVerified: boolean;
  locale?: string | null;
  currency?: string | null;
  marketingOptIn: boolean;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: User;
}
