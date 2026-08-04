"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { IMAGERY } from "@/constants/imagery";
import { SITE } from "@/constants/site";

export function InstagramGallery() {
  return (
    <section className="border-t border-line py-24 md:py-32">
      <div className="container-lux">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Follow Along</p>
            <h2 className="editorial-title mt-4 text-ink">
              <span className="editorial-serif">@</span>{SITE.name.toLowerCase()}
            </h2>
          </div>
          <a
            href={SITE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="link-quiet text-xs uppercase tracking-[0.2em] text-ink"
          >
            Follow us
          </a>
        </div>
      </div>
      <div className="mt-12 grid grid-cols-3 gap-1 md:grid-cols-6">
        {IMAGERY.instagram.map((src, i) => (
          <motion.a
            key={i}
            href={SITE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8, delay: i * 0.05 }}
            className="image-reveal relative aspect-square overflow-hidden bg-mist"
            aria-label="View on Instagram"
          >
            <Image src={src} alt="" fill sizes="(min-width: 1024px) 16vw, 33vw" className="object-cover" />
          </motion.a>
        ))}
      </div>
    </section>
  );
}
