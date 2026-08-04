import type { Metadata } from "next";
import { RequireAuth } from "@/components/shared/require-auth";
import { AccountLayout } from "@/components/shared/account-layout";
import { AddressBook } from "@/features/account/address-book";

export const metadata: Metadata = {
  title: "Addresses",
  description: "Manage your saved addresses.",
};

export default function AddressesPage() {
  return (
    <RequireAuth>
      <AccountLayout>
        <AddressBook />
      </AccountLayout>
    </RequireAuth>
  );
}
