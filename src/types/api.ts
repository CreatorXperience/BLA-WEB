/** Shared API response envelope used across the BLA backend. */

export interface ApiMeta {
  requestId?: string;
  cache?: boolean;
  pagination?: {
    page: number;
    perPage: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  error?: {
    code?: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
