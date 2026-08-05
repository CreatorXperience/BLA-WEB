import type { Metadata } from "next";
import { ProductEditor } from "@/features/admin/products/product-editor";

export const metadata: Metadata = { title: "New product" };

export default function NewProductPage() {
  return <ProductEditor />;
}
