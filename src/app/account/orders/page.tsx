import type { Metadata } from "next";
import { RequireAuth } from "@/components/shared/require-auth";
import { AccountLayout } from "@/components/shared/account-layout";
import { OrdersList } from "@/features/account/orders-list";

export const metadata: Metadata = {
  title: "Your orders",
  description: "Review your BLA order history.",
};

export default function OrdersPage() {
  return (
    <RequireAuth>
      <AccountLayout>
        <OrdersList />
      </AccountLayout>
    </RequireAuth>
  );
}
