"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { SITE } from "@/constants/site";

export function BrandStory() {
  return (
    <section className="container-lux grid items-center gap-12 py-24 md:grid-cols-2 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="eyebrow">Our Story</p>
        <h2 className="editorial-title mt-5 text-ink">
          Built around <span className="editorial-serif">quiet confidence</span>.
        </h2>
        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-muted">
          <p>
            {SITE.name} was founded on a simple conviction: luxury should feel effortless. We design
            limited-edition streetwear for people who let the work speak for itself.
          </p>
          <p>
            Heavyweight fabrics. Precise silhouettes. Nothing louder than it needs to be. Each piece is
            produced in small batches in our partner studios and finished to outlast seasons.
          </p>
        </div>
        <Link
          href="/about"
          className="mt-10 inline-block border-b border-ink/30 pb-1 text-xs uppercase tracking-[0.22em] text-ink transition-colors hover:border-ink"
        >
          About {SITE.name}
        </Link>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="image-reveal relative aspect-[3/4] overflow-hidden bg-mist"
        >
          <Image src="/our-story1.jpg" alt="Atelier craftsmanship" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="image-reveal relative mt-8 aspect-[3/4] overflow-hidden bg-mist"
        >
          <Image src="/our-story2.jpg" alt="Fabrics and finishes" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
        </motion.div>
      </div>
    </section>
  );
}
