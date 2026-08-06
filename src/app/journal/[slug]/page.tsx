import type { Metadata } from "next";
import { JournalArticleClient } from "@/features/journal/article-client";

export const metadata: Metadata = {
  title: "Journal",
  description: "Stories, craftsmanship and culture from the BLA house.",
};

export default function JournalArticlePage() {
  return <JournalArticleClient />;
}