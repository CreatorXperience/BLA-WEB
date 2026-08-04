"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";

export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrated = useAuthStore((s) => s.hydrated);

  if (!hydrated) {
    return <div className="container-lux py-32 text-center text-sm text-muted">Checking session…</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="container-lux flex min-h-[60vh] flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="eyebrow">Members</p>
        <h1 className="editorial-title mt-2 text-ink">Sign in required</h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted">
          Sign in to view your orders, addresses and wishlist.
        </p>
        <div className="mt-4 flex gap-3">
          <Button asChild>
            <Link href="/login?redirect=/account">Sign in</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/register">Create account</Link>
          </Button>
        </div>
        <button onClick={() => router.back()} className="mt-2 text-xs text-muted underline-offset-2 hover:underline">
          Go back
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
