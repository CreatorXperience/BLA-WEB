import type { Metadata } from "next";
import { RequireAuth } from "@/components/shared/require-auth";
import { AccountLayout } from "@/components/shared/account-layout";
import { AccountWishlist } from "@/features/account/account-wishlist";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "View your saved pieces.",
};

export default function AccountWishlistPage() {
  return (
    <RequireAuth>
      <AccountLayout>
        <AccountWishlist />
      </AccountLayout>
    </RequireAuth>
  );
}
