import type { Metadata } from "next";
import { ProductEditor } from "@/features/admin/products/product-editor";

export const metadata: Metadata = { title: "Edit product" };

export default function EditProductPage() {
  return <ProductEditor />;
}
