import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IMAGERY } from "@/constants/imagery";

export const metadata: Metadata = {
  title: "Lookbook",
  description: "The BLA lookbook — seasonal editorial.",
};

const LOOKS = [
  { season: "SS26", title: "The First Light", image: IMAGERY.editorial[0] },
  { season: "AW25", title: "Nocturne", image: IMAGERY.hero[1] },
  { season: "SS25", title: "Terracotta", image: IMAGERY.editorial[1] },
  { season: "AW24", title: "Archive", image: IMAGERY.hero[2] },
];

export default function LookbookPage() {
  return (
    <div className="container-lux py-12 md:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow">Lookbook</p>
        <h1 className="editorial-title mt-3 text-ink">Seasonal editorial</h1>
        <p className="mt-5 text-muted">
          A visual index of recent seasons — the mood, the fabric and the silhouettes that defined each drop.
        </p>
      </header>
      <div className="mt-12 space-y-20">
        {LOOKS.map((look, i) => (
          <section key={look.title} className={`grid items-center gap-8 md:grid-cols-2 md:gap-16 ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}>
            <div className="relative aspect-[4/5] overflow-hidden bg-mist">
              <Image src={look.image} alt={look.title} fill sizes="50vw" className="object-cover" />
            </div>
            <div>
              <p className="eyebrow">{look.season}</p>
              <h2 className="editorial-title mt-4 text-ink">{look.title}</h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
                Photography from the {look.season} campaign. Every image was captured in-studio with natural
                light to honour the texture of the fabrics.
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
