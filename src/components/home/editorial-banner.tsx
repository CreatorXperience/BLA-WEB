"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { IMAGERY } from "@/constants/imagery";
import { useHomepage } from "@/hooks/use-catalog";

export function EditorialBanner() {
  const { data } = useHomepage();
  const editorial = (data?.sections ?? []).find((s) => s.sectionType === "EDITORIAL");

  const image = (editorial?.content?.mediaUrl as string) ?? IMAGERY.editorial[0];
  const title = editorial?.title ?? "Considered by design.";
  const subtitle = editorial?.subtitle ?? "Every piece is designed in-house, cut in limited batches, and finished to last.";
  const ctaUrl = (editorial?.content?.ctaUrl as string) ?? "/about";
  const ctaText = (editorial?.content?.ctaText as string) ?? "Our story";

  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-ink">
      <motion.div
        initial={{ scale: 1.06 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <Image src={image} alt={title} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-ink/40" />
      </motion.div>
      <div className="container-lux relative z-10 flex min-h-[70vh] items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl text-background"
        >
          <p className="eyebrow mb-4 text-background/60">The Atelier</p>
          <h2 className="editorial-title text-background">{title}</h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-background/80">{subtitle}</p>
          <Link
            href={ctaUrl}
            className="mt-10 inline-flex items-center gap-3 border-b border-background/60 pb-2 text-xs uppercase tracking-[0.22em] text-background transition-colors hover:border-background"
          >
            {ctaText}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
