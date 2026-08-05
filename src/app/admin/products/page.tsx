import type { Metadata } from "next";
import { ProductsManager } from "@/features/admin/products/products-manager";

export const metadata: Metadata = { title: "Products" };

export default function AdminProductsPage() {
  return <ProductsManager />;
}
