"use client";

import Image from "next/image";
import Link from "next/link";
import { IMAGERY } from "@/constants/imagery";
import { useContentPage } from "@/hooks/use-catalog";
import type { LookbookContent } from "@/types/cms";

const FALLBACK: LookbookContent = {
  eyebrow: "Lookbook",
  title: "Seasonal editorial",
  intro: "A visual index of recent seasons — the mood, the fabric and the silhouettes that defined each drop.",
  looks: [
    { season: "SS26", title: "The First Light", image: IMAGERY.editorial[0], caption: "Photography from the SS26 campaign, captured in-studio with natural light." },
    { season: "AW25", title: "Nocturne", image: IMAGERY.hero[1], caption: "Photography from the AW25 campaign, captured in-studio with natural light." },
    { season: "SS25", title: "Terracotta", image: IMAGERY.editorial[1], caption: "Photography from the SS25 campaign, captured in-studio with natural light." },
    { season: "AW24", title: "Archive", image: IMAGERY.hero[2], caption: "Photography from the AW24 campaign, captured in-studio with natural light." },
  ],
};

export default function LookbookPage() {
  const { data } = useContentPage<LookbookContent>("lookbook", FALLBACK);
  const content = data ?? FALLBACK;

  return (
    <div className="container-lux py-12 md:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow">{content.eyebrow}</p>
        <h1 className="editorial-title mt-3 text-ink">{content.title}</h1>
        <p className="mt-5 text-muted">{content.intro}</p>
      </header>
      <div className="mt-12 space-y-20">
        {content.looks.map((look, i) => (
          <section key={look.title} className={`grid items-center gap-8 md:grid-cols-2 md:gap-16 ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}>
            <div className="relative aspect-[4/5] overflow-hidden bg-mist">
              <Image src={look.image} alt={look.title} fill sizes="50vw" className="object-cover" />
            </div>
            <div>
              <p className="eyebrow">{look.season}</p>
              <h2 className="editorial-title mt-4 text-ink">{look.title}</h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
                {look.caption ?? `Photography from the ${look.season} campaign. Every image was captured in-studio with natural light to honour the texture of the fabrics.`}
              </p>
              <Link href="/shop" className="mt-6 inline-block border-b border-ink pb-0.5 text-sm text-ink">
                Shop the season
              </Link>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}