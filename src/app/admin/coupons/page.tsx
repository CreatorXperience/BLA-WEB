import type { Metadata } from "next";
import { CouponsManager } from "@/features/admin/coupons/coupons-manager";

export const metadata: Metadata = { title: "Coupons" };

export default function AdminCouponsPage() {
  return <CouponsManager />;
}
