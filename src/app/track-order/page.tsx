import type { Metadata } from "next";
import { TrackOrderClient } from "@/features/checkout/track-order-client";

export const metadata: Metadata = {
  title: "Track order",
  description: "Track your BLA order.",
};

export default function TrackOrderPage() {
  return <TrackOrderClient />;
}
