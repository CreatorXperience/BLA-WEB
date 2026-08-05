import type { Metadata } from "next";
import { OverviewDashboard } from "@/features/admin/overview/overview-dashboard";

export const metadata: Metadata = { title: "Admin overview" };

export default function AdminPage() {
  return <OverviewDashboard />;
}
