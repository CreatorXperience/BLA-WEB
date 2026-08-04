import type { Metadata } from "next";
import { CollectionClient } from "@/features/collections/collection-client";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slugToTitle(slug),
    description: `Explore the ${slugToTitle(slug)} collection at BLA.`,
  };
}

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function CollectionPage() {
  return <CollectionClient />;
}
