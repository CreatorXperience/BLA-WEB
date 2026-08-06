import type { Metadata } from "next";
import { AboutContent } from "@/features/about/about-content";

export const metadata: Metadata = {
  title: "About",
  description: "The story behind BLA.",
};

export default function AboutPage() {
  return <AboutContent />;
}