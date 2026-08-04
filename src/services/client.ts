import { SITE } from "@/constants/site";
import { CART_TOKEN_KEY } from "@/constants/site";
import { ApiError, type ApiResponse } from "@/types/api";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
  cartToken?: boolean;
  /** skip automatic token refresh + retry */
  skipRetry?: boolean;
}

let accessToken: string | null = null;
let refreshToken: string | null = null;

/** Token accessors, wired from the auth store (client side). */
export function setTokens(access: string | null, refresh: string | null): void {
  accessToken = access;
  refreshToken = refresh;
}

export function getAccessToken(): string | null {
  return accessToken;
}

function cartTokenHeader(): Record<string, string> {
  const token =
    typeof window === "undefined" ? undefined : window.localStorage.getItem(CART_TOKEN_KEY);
  return token ? { "x-cart-token": token } : {};
}

async function parseError(response: Response): Promise<ApiError> {
  let message = response.statusText || "Request failed";
  let code: string | undefined;
  let details: unknown;
  try {
    const body = (await response.json()) as {
      message?: string;
      error?: {
        code?: string;
        details?: unknown;
        name?: string;
        issues?: Array<{ message?: string; path?: Array<string | number> }>;
      };
    };
    if (body.message) {
      message = body.message;
    } else if (Array.isArray(body.error?.issues) && body.error.issues.length > 0) {
      // zod-validator failure shape: { success:false, error:{ issues:[{message,path}] } }
      message = body.error.issues.map((issue) => issue.message).filter(Boolean).join("; ");
    } else {
      const fieldErrors = (body.error?.details as { fieldErrors?: Record<string, string[] | undefined> } | undefined)
        ?.fieldErrors;
      if (fieldErrors) {
        const parts = Object.values(fieldErrors).flat().filter(Boolean);
        if (parts.length > 0) message = parts.join("; ");
      }
    }
    code = body.error?.code;
    details = body.error?.details;
  } catch {
    /* non-JSON error body */
  }
  return new ApiError(message, response.status, code, details);
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${SITE.apiUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const body = (await res.json()) as ApiResponse<{ accessToken: string; refreshToken: string }>;
    setTokens(body.data.accessToken, body.data.refreshToken);
    refreshToken = body.data.refreshToken;
    return true;
  } catch {
    return false;
  }
}

export async function apiClient<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, auth = false, cartToken = false, skipRetry = false, headers, ...rest } = options;

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string> | undefined),
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (auth && accessToken) {
    requestHeaders.Authorization = `Bearer ${accessToken}`;
  }

  if (cartToken) {
    Object.assign(requestHeaders, cartTokenHeader());
  }

  const response = await fetch(`${SITE.apiUrl}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401 && auth && !skipRetry && (await refreshAccessToken())) {
      return apiClient<T>(path, { ...options, skipRetry: true });
    }
    throw await parseError(response);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }
  return (await response.text()) as unknown as T;
}

export function unwrap<T>(response: ApiResponse<T>): T {
  return response.data;
}
