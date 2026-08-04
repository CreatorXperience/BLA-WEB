"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/shared/section-heading";
import { useCollections } from "@/hooks/use-catalog";
import { IMAGERY } from "@/constants/imagery";

export function FeaturedCollections() {
  const { data: collections, isLoading } = useCollections();

  const items = (collections ?? [])
    .filter((c) => c.isFeatured !== false)
    .slice(0, 4);

  const display = items.length > 0 ? items : [];

  return (
    <section className="container-lux py-24 md:py-32">
      <SectionHeading
        eyebrow="Curated"
        title="Featured Collections"
        action={<Link href="/collections" className="link-quiet text-xs uppercase tracking-[0.2em] text-ink">View all</Link>}
      />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? [0, 1, 2, 3].map((i) => <div key={i} className="aspect-[3/4] animate-pulse bg-line" />)
          : display.map((collection, i) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link href={`/collections/${collection.slug}`} className="group block">
                  <div className="image-reveal relative aspect-[3/4] overflow-hidden bg-mist">
                    <Image
                      src={collection.imageUrl ?? collection.bannerUrl ?? IMAGERY.collection[i % IMAGERY.collection.length] ?? IMAGERY.productFallback}
                      alt={collection.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-ink/0 transition-colors duration-700 group-hover:bg-ink/15" />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <h3 className="text-lg font-normal tracking-tight text-ink">{collection.name}</h3>
                    <span className="text-[11px] uppercase tracking-[0.18em] text-muted transition-transform duration-300 group-hover:translate-x-1">
                      Explore
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
      </div>
    </section>
  );
}