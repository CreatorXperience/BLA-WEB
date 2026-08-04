"use client";

import { motion } from "framer-motion";
import { useAnnouncement } from "@/hooks/use-catalog";

export function AnnouncementBar() {
  const { data } = useAnnouncement();
  const message = data?.message ?? "Free nationwide shipping on orders over ₦150,000";

  return (
    <div className="bg-ink text-background">
      <motion.p
        key={message}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="container-lux truncate py-2 text-center text-[11px] uppercase tracking-[0.22em]"
      >
        {message}
      </motion.p>
    </div>
  );
}