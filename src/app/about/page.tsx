import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { prefetchContentPages } from "@/lib/cms-prefetch";
import { AboutContent } from "@/features/about/about-content";

export const metadata: Metadata = {
  title: "About",
  description: "The story behind BLA.",
};

export default async function AboutPage() {
  const { state } = await prefetchContentPages("about");
  return (
    <HydrationBoundary state={state}>
      <AboutContent />
    </HydrationBoundary>
  );
}