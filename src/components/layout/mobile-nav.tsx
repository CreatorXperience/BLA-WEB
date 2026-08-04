"use client";

import Link from "next/link";
import { Search, ShoppingBag, User } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetCloseX } from "@/components/ui/sheet";
import { DEFAULT_NAV } from "@/constants/nav";
import { useUIStore } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";

export function MobileNav() {
  const open = useUIStore((s) => s.mobileNavOpen);
  const close = useUIStore((s) => s.closeMobileNav);
  const openSearch = useUIStore((s) => s.openSearch);
  const openCart = useUIStore((s) => s.openCart);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const count = useCartStore((s) => s.cart?.itemCount ?? 0);

  return (
    <Sheet open={open} onOpenChange={(o) => (o ? null : close())}>
      <SheetContent side="left" className="w-full max-w-sm p-0">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetCloseX />
        </SheetHeader>
        <div className="flex flex-col overflow-y-auto">
          <nav className="flex flex-col py-2" aria-label="Mobile">
            {DEFAULT_NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={close}
                className="border-b border-line px-6 py-4 text-base tracking-wide"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-3 border-t border-line p-6">
            <div className="flex gap-3">
              <Link
                href={isAuthenticated ? "/account" : "/login"}
                onClick={close}
                className="flex flex-1 items-center justify-center gap-2 border border-ink/20 py-3 text-xs uppercase tracking-[0.18em]"
              >
                <User className="size-4" /> {isAuthenticated ? "Account" : "Sign in"}
              </Link>
              <button
                onClick={() => {
                  close();
                  openCart();
                }}
                className="relative flex flex-1 items-center justify-center gap-2 bg-ink py-3 text-xs uppercase tracking-[0.18em] text-background"
              >
                <ShoppingBag className="size-4" /> Bag
                {count > 0 ? <span className="text-[10px] opacity-70">({count})</span> : null}
              </button>
            </div>
            <button
              onClick={() => {
                close();
                openSearch();
              }}
              className="flex w-full items-center justify-center gap-2 border border-ink/20 py-3 text-xs uppercase tracking-[0.18em]"
            >
              <Search className="size-4" /> Search
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}