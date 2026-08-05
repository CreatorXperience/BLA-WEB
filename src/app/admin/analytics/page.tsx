import type { Metadata } from "next";
import { AnalyticsPage } from "@/features/admin/analytics/analytics-page";

export const metadata: Metadata = { title: "Analytics" };

export default function AdminAnalyticsPage() {
  return <AnalyticsPage />;
}
