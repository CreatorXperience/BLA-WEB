import { QueryClient, dehydrate } from "@tanstack/react-query";
import type { HomepageContent } from "@/types/cms";

export interface HydratedQueryClient {
  client: QueryClient;
  state: ReturnType<typeof dehydrate>;
}

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

export async function prefetchHomepage(): Promise<HydratedQueryClient> {
  const client = new QueryClient();
  const data = await safe(async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1"}/cms/homepage`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: HomepageContent };
    return body.data ?? null;
  });

  if (data) {
    client.setQueryData(["cms", "homepage"], data);
  }
  return { client, state: dehydrate(client) };
}

export async function prefetchContentPages(...keys: string[]): Promise<HydratedQueryClient> {
  const client = new QueryClient();
  const settings = await safe(async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1"}/cms/settings/public`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: Record<string, unknown> };
    return body.data ?? null;
  });

  if (settings) {
    for (const key of keys) {
      const raw = settings[key];
      if (raw && typeof raw === "object") {
        client.setQueryData(["cms", "content", key], raw);
      }
    }
  }
  return { client, state: dehydrate(client) };
}