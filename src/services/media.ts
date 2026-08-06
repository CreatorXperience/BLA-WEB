import { apiClient, unwrap, getAccessToken } from "./client";
import { SITE } from "@/constants/site";
import type { ApiResponse } from "@/types/api";

export interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  kind: "IMAGE" | "VIDEO" | "DOCUMENT";
  url: string;
  thumbUrl?: string | null;
  cloudKey: string;
  bucket: string;
  altText?: string | null;
  folder?: string;
  isOptimized?: boolean;
  createdAt: string;
}

export interface MediaQuery {
  page?: number;
  perPage?: number;
  kind?: "IMAGE" | "VIDEO" | "DOCUMENT";
  folder?: string;
  q?: string;
}

export interface PresignedUpload {
  key: string;
  uploadUrl: string;
  publicUrl: string;
}

const auth = { auth: true } as const;

export const mediaService = {
  async list(query: MediaQuery = {}): Promise<MediaAsset[]> {
    const qs = new URLSearchParams();
    if (query.page) qs.set("page", String(query.page));
    if (query.perPage) qs.set("perPage", String(query.perPage));
    if (query.kind) qs.set("kind", query.kind);
    if (query.folder) qs.set("folder", query.folder);
    if (query.q) qs.set("q", query.q);
    const res = await apiClient<ApiResponse<MediaAsset[]>>(`/media?${qs.toString()}`, auth);
    const data = unwrap(res);
    return Array.isArray(data) ? data : [];
  },

  async remove(id: string): Promise<void> {
    await apiClient(`/media/${id}`, { ...auth, method: "DELETE" });
  },

  /**
   * Upload a binary file directly through the API multipart endpoint. Returns the
   * created media asset (its `url` is what you store on a model/content field).
   */
  async upload(file: Blob, filename: string, folder = "uploads"): Promise<MediaAsset> {
    const form = new FormData();
    form.append("file", file, filename);
    form.append("folder", folder);
    const token = getAccessToken();
    const res = await fetch(`${SITE.apiUrl}/media/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
      cache: "no-store",
    });
    if (!res.ok) {
      let message = `Upload failed (${res.status})`;
      try {
        const body = (await res.json()) as { message?: string };
        if (body.message) message = body.message;
      } catch {
        /* ignore */
      }
      throw new Error(message);
    }
    const body = (await res.json()) as ApiResponse<MediaAsset>;
    return body.data;
  },
};