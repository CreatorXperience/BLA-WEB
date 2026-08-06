"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  Layers,
  Package,
  ScrollText,
  Settings,
  ShoppingBag,
  Store,
  Tag,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/collections", label: "Collections", icon: Layers },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/cms", label: "CMS", icon: Settings },
  { href: "/admin/audit-logs", label: "Audit logs", icon: ScrollText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const onLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <div className="flex min-h-screen bg-mist/40">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-paper lg:flex">
        <Link href="/admin" className="flex items-center gap-2 border-b border-line px-6 py-5">
          <span className="text-nav font-semibold uppercase tracking-[0.2em]">BLA Admin</span>
        </Link>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-none px-3 py-2.5 text-sm transition-colors",
                  active ? "bg-ink text-paper" : "text-muted hover:bg-mist hover:text-ink",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line p-4">
          <div className="mb-3 px-1 text-xs text-muted">
            {user?.firstName ?? ""} {user?.lastName ?? ""}
            <span className="block text-[10px] uppercase tracking-widest text-economy">{user?.role}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href="/" target="_blank">
                <Store className="mr-1 size-3.5" /> View store
              </Link>
            </Button>
            <Button variant="quiet" size="sm" onClick={onLogout}>
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-paper px-5 py-3 lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="text-sm font-semibold uppercase tracking-[0.2em]">BLA Admin</span>
          </div>
          <div className="hidden text-xs text-muted lg:block">{pathname}</div>
          <nav className="flex items-center gap-1 overflow-x-auto lg:hidden">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap px-3 py-1.5 text-xs uppercase tracking-wider",
                  pathname.startsWith(item.href) ? "bg-ink text-paper" : "text-muted",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
