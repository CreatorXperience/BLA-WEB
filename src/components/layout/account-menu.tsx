"use client";

import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Package, ShoppingBag, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/auth-store";
import { useWishlistStore } from "@/store/wishlist-store";

export function AccountMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const clearWishlist = useWishlistStore((s) => s.clear);
  const isAdmin = user ? ["ADMIN", "EDITOR", "MANAGER", "SUPER_ADMIN"].includes(user.role) : false;

  const handleLogout = async () => {
    await logout();
    clearWishlist();
    if (pathname.startsWith("/account")) router.push("/");
    else router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="flex items-center gap-2 text-sm tracking-wide transition-opacity hover:opacity-60 focus-visible:outline-1 focus-visible:outline-black"
      >
        <UserIcon className="size-4" />
        <span className="hidden max-w-[9rem] truncate xl:inline">{user?.firstName ?? "Account"}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/account/orders")}>
          <Package className="size-4" /> Order History
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/account/addresses")}>
          <ShoppingBag className="size-4" /> Saved Addresses
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/account/wishlist")}>
          <ShoppingBag className="size-4" /> Wishlist
        </DropdownMenuItem>
        {isAdmin ? (
          <DropdownMenuItem onSelect={() => router.push("/admin")}>
            <LayoutDashboard className="size-4" /> Admin
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout}>
          <LogOut className="size-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
