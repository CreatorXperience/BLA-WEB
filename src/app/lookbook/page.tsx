import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { prefetchContentPages } from "@/lib/cms-prefetch";
import { LookbookContent } from "@/features/lookbook/lookbook-content";

export const metadata: Metadata = {
  title: "Lookbook",
  description: "Seasonal editorials from the BLA house.",
};

export default async function LookbookPage() {
  const { state } = await prefetchContentPages("lookbook");
  return (
    <HydrationBoundary state={state}>
      <LookbookContent />
    </HydrationBoundary>
  );
}