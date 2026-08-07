"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_NAV } from "@/constants/nav";
import { useUIStore } from "@/store/ui-store";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { AccountMenu } from "@/components/layout/account-menu";

export function Navbar() {
  const pathname = usePathname();
  const openSearch = useUIStore((s) => s.openSearch);
  const openMobileNav = useUIStore((s) => s.openMobileNav);
  const openCart = useUIStore((s) => s.openCart);
  const count = useCartStore((s) => s.cart?.itemCount ?? 0);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = useMemo(() => scrolled || pathname !== "/", [scrolled, pathname]);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-40 transition-all duration-500 ease-[var(--ease-lux)]",
        solid ? "border-b border-line bg-background/95 backdrop-blur" : "bg-transparent",
      )}
    >
      <div className="container-lux flex h-[72px] items-center justify-between gap-4">
        {/* Left — search + mobile menu */}
        <div className="flex flex-1 items-center gap-2 sm:gap-6">
          <button
            onClick={openMobileNav}
            aria-label="Open menu"
            className="flex size-10 items-center justify-center lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <button
            onClick={openSearch}
            aria-label="Search"
            className="hidden items-center gap-2 text-sm tracking-wide transition-opacity hover:opacity-60 sm:flex"
          >
            <Search className="size-4" />
            <span className="hidden md:inline">Search</span>
          </button>
        </div>

        {/* Center — logo */}
        <Link href="/" aria-label="BLA — home" className="flex shrink-0 select-none items-center">
          <Image
            src="/BLA.png"
            alt="BLA"
            width={1536}
            height={1024}
            priority
            className="h-10 w-auto md:h-12"
            sizes="(min-width: 768px) 192px, 160px"
          />
        </Link>

        {/* Right — account, wishlist(drawer handles), cart */}
        <div className="flex flex-1 items-center justify-end gap-1 sm:gap-5">
          <div className="hidden lg:block">
            {isAuthenticated ? (
              <AccountMenu />
            ) : (
              <Link
                href="/login"
                aria-label="Account"
                className="flex items-center gap-2 text-sm tracking-wide transition-opacity hover:opacity-60"
              >
                <User className="size-4" />
                <span className="hidden xl:inline">Account</span>
              </Link>
            )}
          </div>
          <button
            onClick={openCart}
            aria-label="Shopping bag"
            className="relative flex size-10 items-center justify-center transition-opacity hover:opacity-60"
          >
            <ShoppingBag className="size-5" />
            {count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-ink text-[9px] font-medium text-background">
                {count}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {/* Desktop nav — secondary row */}
      <nav
        aria-label="Main"
        className={cn(
          "hidden border-t border-line/60 transition-opacity duration-500 lg:block",
          solid ? "opacity-100" : "opacity-90",
        )}
      >
        <div className="container-lux flex h-12 items-center justify-center gap-9">
          {DEFAULT_NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="link-quiet text-nav text-[13px] tracking-[0.14em] text-ink"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </motion.header>
  );
}