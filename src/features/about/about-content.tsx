"use client";

import Image from "next/image";
import { IMAGERY } from "@/constants/imagery";
import { useContentPage } from "@/hooks/use-catalog";
import type { AboutContent } from "@/types/cms";

const FALLBACK: AboutContent = {
  heroImage: IMAGERY.hero[0],
  heroEyebrow: "Our story",
  heroTitle: "Made with intent.",
  manifestoEyebrow: "The house",
  manifesto:
    "BLA — Best Life Ahead — was founded on a simple belief: streetwear can be considered design. We take time with proportions, source exceptional fabrics and finish every garment by hand — so each piece feels as good as it looks, season after season.",
  values: [
    { title: "Craft", text: "Every piece is produced in small runs with a focus on construction, fabric and finish — never compromise." },
    { title: "Rarity", text: "Limited quantities mean a piece you buy today may never be made again. Wear something nobody else has." },
    { title: "Integrity", text: "Honest pricing, ethical production partners and a standing behind every garment we release." },
  ],
  bandEyebrow: "Atelier, in practice",
  bandImage: IMAGERY.editorial[1],
  bandTitle: "Small runs. No repeats.",
  bandText:
    "We produce in limited numbers, sourced from partners we visit and trust. When a run sells out, it is gone — a deliberate choice that keeps every piece special and reduces waste.",
};

export function AboutContent() {
  const { data } = useContentPage<AboutContent>("about", FALLBACK);
  const content = data ?? FALLBACK;

  return (
    <div>
      <section className="relative flex min-h-[70vh] items-end overflow-hidden bg-ink">
        <Image src={content.heroImage} alt="BLA studio" fill priority sizes="100vw" className="object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
        <div className="container-lux relative z-10 pb-16">
          <p className="eyebrow text-background/70">{content.heroEyebrow}</p>
          <h1 className="editorial-hero mt-4 text-background">{content.heroTitle}</h1>
        </div>
      </section>

      <section className="container-lux py-20 md:py-28">
        <div className="max-w-3xl">
          <p className="eyebrow">{content.manifestoEyebrow}</p>
          <p className="mt-6 text-2xl leading-relaxed text-ink md:text-3xl">{content.manifesto}</p>
        </div>
      </section>

      <section className="border-y border-line bg-mist/40">
        <div className="container-lux grid gap-px py-16 md:grid-cols-3">
          {content.values.map((value) => (
            <div key={value.title} className="py-8 pr-8">
              <h2 className="text-sm uppercase tracking-[0.2em] text-ink">{value.title}</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">{value.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-lux grid gap-6 py-20 md:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden bg-mist">
          <Image src={content.bandImage} alt="Atelier production" fill sizes="50vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center py-8">
          <p className="eyebrow">{content.bandEyebrow}</p>
          <h2 className="editorial-title mt-4 text-ink">{content.bandTitle}</h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">{content.bandText}</p>
        </div>
      </section>
    </div>
  );
}