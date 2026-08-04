import type { Metadata } from "next";
import { RequireAuth } from "@/components/shared/require-auth";
import { AccountLayout } from "@/components/shared/account-layout";
import { OrderDetail } from "@/features/account/order-detail";

export const metadata: Metadata = {
  title: "Order",
  description: "Review your order details.",
};

export default function OrderDetailPage() {
  return (
    <RequireAuth>
      <AccountLayout>
        <OrderDetail />
      </AccountLayout>
    </RequireAuth>
  );
}
