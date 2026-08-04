import type { Metadata } from "next";
import { RequireAuth } from "@/components/shared/require-auth";
import { AccountLayout } from "@/components/shared/account-layout";
import { AccountOverview } from "@/features/account/account-overview";

export const metadata: Metadata = {
  title: "Your account",
  description: "Manage your BLA account.",
};

export default function AccountPage() {
  return (
    <RequireAuth>
      <AccountLayout>
        <AccountOverview />
      </AccountLayout>
    </RequireAuth>
  );
}
