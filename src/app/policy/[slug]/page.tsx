import { notFound } from "next/navigation";
import { getPolicy } from "@/constants/policies";
import { slugToTitle } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = getPolicy(slug);
  return { title: policy ? policy.title : slugToTitle(slug) };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) notFound();

  return (
    <div className="container-lux max-w-3xl py-16 md:py-24">
      <header className="border-b border-line pb-8">
        <p className="eyebrow">Legal</p>
        <h1 className="editorial-title mt-3 text-ink">{policy.title}</h1>
        <p className="mt-3 text-xs text-muted">{policy.updated}</p>
      </header>
      <div className="mt-10 space-y-10">
        {policy.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-medium text-ink">{section.heading}</h2>
            <div className="mt-3 space-y-3">
              {section.body.map((paragraph, i) => (
                <p key={i} className="text-sm leading-relaxed text-muted">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
