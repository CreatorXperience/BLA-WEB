import type { Metadata } from "next";
import { CmsManager } from "@/features/admin/cms/cms-manager";

export const metadata: Metadata = { title: "CMS" };

export default function AdminCmsPage() {
  return <CmsManager />;
}
