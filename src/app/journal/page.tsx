import type { Metadata } from "next";
import { JournalContent } from "@/features/journal/journal-content";

export const metadata: Metadata = {
  title: "Journal",
  description: "Stories, craftsmanship and culture from the BLA house.",
};

export default function JournalPage() {
  return <JournalContent />;
}