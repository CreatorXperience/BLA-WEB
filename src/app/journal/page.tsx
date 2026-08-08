import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { prefetchContentPages } from "@/lib/cms-prefetch";
import { JournalContent } from "@/features/journal/journal-content";

export const metadata: Metadata = {
  title: "Journal",
  description: "Stories, craftsmanship and culture from the BLA house.",
};

export default async function JournalPage() {
  const { state } = await prefetchContentPages("journal");
  return (
    <HydrationBoundary state={state}>
      <JournalContent />
    </HydrationBoundary>
  );
}