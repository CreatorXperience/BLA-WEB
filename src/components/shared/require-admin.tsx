"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Spinner } from "@/components/ui/skeleton";

const ADMIN_ROLES = ["ADMIN", "EDITOR", "MANAGER", "SUPER_ADMIN"];

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, hydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/login?redirect=/admin");
      return;
    }
    if (user && !ADMIN_ROLES.includes(user.role)) {
      router.replace("/");
    }
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated || !isAuthenticated || !user || !ADMIN_ROLES.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  return <>{children}</>;
}
