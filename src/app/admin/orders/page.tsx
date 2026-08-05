import type { Metadata } from "next";
import { OrdersManager } from "@/features/admin/orders/orders-manager";

export const metadata: Metadata = { title: "Orders" };

export default function AdminOrdersPage() {
  return <OrdersManager />;
}
