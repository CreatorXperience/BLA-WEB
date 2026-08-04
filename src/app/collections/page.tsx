import type { Metadata } from "next";
import { CollectionsClient } from "@/features/collections/collections-client";

export const metadata: Metadata = {
  title: "Collections",
  description: "Explore limited-edition BLA collections.",
};

export default function CollectionsPage() {
  return <CollectionsClient />;
}
