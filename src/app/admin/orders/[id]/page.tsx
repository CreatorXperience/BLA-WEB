import type { Metadata } from "next";
import { OrderDetail } from "@/features/admin/orders/order-detail";

export const metadata: Metadata = { title: "Order" };

export default function AdminOrderDetailPage() {
  return <OrderDetail />;
}
