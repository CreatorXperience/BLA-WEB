"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/wishlist", label: "Wishlist" },
];

export function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const clearWishlist = useWishlistStore((s) => s.clearLocal);

  const onSignOut = async () => {
    await logout();
    clearWishlist();
    toast.success("Signed out");
    router.replace("/");
  };

  return (
    <div className="container-lux py-12 md:py-16">
      <header className="border-b border-line pb-8">
        <p className="eyebrow">Members</p>
        <h1 className="editorial-title mt-3 text-ink">
          {user ? `${user.firstName ?? "Hello"}, welcome back` : "Your account"}
        </h1>
        {user?.email ? <p className="mt-2 text-sm text-muted">{user.email}</p> : null}
      </header>

      <div className="mt-8 flex flex-col gap-10 lg:flex-row">
        <nav className="flex flex-wrap gap-2 lg:w-56 lg:shrink-0 lg:flex-col lg:gap-1" aria-label="Account navigation">
          {NAV.map((item) => {
            const active = item.href === "/account" ? pathname === "/account" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "border px-4 py-3 text-sm transition-colors lg:border-0 lg:border-l-2 lg:px-4 lg:py-2.5",
                  active
                    ? "border-ink bg-ink text-background lg:border-ink lg:bg-transparent lg:text-ink"
                    : "border-line text-muted hover:border-ink hover:text-ink lg:border-transparent",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={() => void onSignOut()}
            className="border border-line px-4 py-3 text-left text-sm text-muted transition-colors hover:border-ink hover:text-ink lg:border-0 lg:border-l-2 lg:border-transparent lg:px-4 lg:py-2.5"
          >
            Sign out
          </button>
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
