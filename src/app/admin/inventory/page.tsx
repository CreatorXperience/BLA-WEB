import type { Metadata } from "next";
import { InventoryManager } from "@/features/admin/inventory/inventory-manager";

export const metadata: Metadata = { title: "Inventory" };

export default function AdminInventoryPage() {
  return <InventoryManager />;
}
