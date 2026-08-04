"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useCollections } from "@/hooks/use-catalog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { IMAGERY } from "@/constants/imagery";

export function CollectionsClient() {
  const { data: collections, isLoading } = useCollections();

  if (isLoading) {
    return (
      <div className="container-lux grid gap-6 py-12 sm:grid-cols-2 md:py-16 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] w-full" />
        ))}
      </div>
    );
  }

  if (!collections || collections.length === 0) {
    return (
      <div className="container-lux py-20">
        <EmptyState title="No collections yet" description="Our first drop is on its way." />
      </div>
    );
  }

  return (
    <div className="container-lux py-12 md:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow">Collections</p>
        <h1 className="editorial-title mt-3 text-ink">The House Edit</h1>
        <p className="mt-5 text-muted">
          Limited-edition capsules, each designed as a complete story — fabrics, silhouettes and finishing considered together.
        </p>
      </header>
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection, i) => (
          <motion.div
            key={collection.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href={`/collections/${collection.slug}`} className="group block">
              <div className="image-reveal relative aspect-[3/4] overflow-hidden bg-mist">
                <Image
                  src={collection.imageUrl ?? collection.bannerUrl ?? IMAGERY.collection[i % IMAGERY.collection.length] ?? IMAGERY.productFallback}
                  alt={collection.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-end p-6">
                  <div className="bg-background/90 px-5 py-3 backdrop-blur">
                    <h2 className="text-lg font-normal tracking-tight text-ink">{collection.name}</h2>
                    {collection.productCount ? (
                      <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-muted">
                        {collection.productCount} pieces
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
