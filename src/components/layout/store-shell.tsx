"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SearchModal } from "@/components/search/search-modal";
import { QuickView } from "@/components/product/quick-view";

export function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <SearchModal />
      <QuickView />
      <MobileNav />
    </div>
  );
}
