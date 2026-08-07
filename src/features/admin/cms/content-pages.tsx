"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useCmsSettings, useCmsMutations } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageInput } from "@/features/admin/shared/media-input";
import { AdminCard } from "@/features/admin/shared";
import type { AboutContent, JournalArticle, JournalContent, LookbookContent } from "@/types/cms";

const CONTENT_KEYS = ["lookbook", "journal", "about"] as const;
type ContentKey = (typeof CONTENT_KEYS)[number];

const DEFAULTS: Record<ContentKey, Record<string, unknown>> = {
  lookbook: { eyebrow: "Lookbook", title: "Seasonal editorial", intro: "", looks: [] },
  journal: { eyebrow: "Journal", title: "The house journal", intro: "", articles: [] },
  about: {
    heroImage: "",
    heroEyebrow: "Our story",
    heroTitle: "Made with intent.",
    manifestoEyebrow: "The house",
    manifesto: "",
    values: [],
    bandEyebrow: "Atelier, in practice",
    bandImage: "",
    bandTitle: "Small runs. No repeats.",
    bandText: "",
  },
};

function useStoredContent(key: ContentKey) {
  const { data, isLoading } = useCmsSettings("content");
  const setting = data?.find((s) => s.key === key);
  const raw = setting && setting.value && typeof setting.value === "object" ? (setting.value as Record<string, unknown>) : DEFAULTS[key];
  return { data, isLoading, raw };
}

// ---- Lookbook ----

function LookbookEditor({ value, onChange }: { value: LookbookContent; onChange: (v: LookbookContent) => void }) {
  const set = (patch: Partial<LookbookContent>) => onChange({ ...value, ...patch });
  const updateLook = (i: number, patch: Partial<LookbookContent["looks"][number]>) =>
    set({ looks: value.looks.map((l, idx) => (idx === i ? { ...l, ...patch } : l)) });

  return (
    <AdminCard title="Lookbook">
      <div className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Eyebrow">
            <Input value={value.eyebrow} onChange={(e) => set({ eyebrow: e.target.value })} />
          </Field>
          <Field label="Title">
            <Input value={value.title} onChange={(e) => set({ title: e.target.value })} />
          </Field>
        </div>
        <Field label="Intro">
          <Textarea rows={2} value={value.intro} onChange={(e) => set({ intro: e.target.value })} />
        </Field>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">Looks</p>
            <Button type="button" size="sm" variant="outline" onClick={() => set({ looks: [...value.looks, { season: "AW26", title: "New look", image: "", caption: "" }] })}>
              <Plus className="mr-1 size-3.5" /> Add look
            </Button>
          </div>
          {value.looks.map((look, i) => (
            <div key={i} className="border border-line p-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Season">
                  <Input value={look.season} onChange={(e) => updateLook(i, { season: e.target.value })} />
                </Field>
                <Field label="Title">
                  <Input value={look.title} onChange={(e) => updateLook(i, { title: e.target.value })} />
                </Field>
              </div>
              <div className="mt-3">
                <ImageInput label="Image" aspect="portrait" value={look.image} onChange={(image) => updateLook(i, { image })} />
              </div>
              <div className="mt-3">
                <Field label="Caption">
                  <Textarea rows={2} value={look.caption ?? ""} onChange={(e) => updateLook(i, { caption: e.target.value })} />
                </Field>
              </div>
              <div className="mt-3 flex justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => set({ looks: value.looks.filter((_, idx) => idx !== i) })}>
                  <Trash2 className="mr-1 size-3.5 text-red-600" /> Remove
                </Button>
              </div>
            </div>
          ))}
          {value.looks.length === 0 ? <p className="text-sm text-muted">No looks yet.</p> : null}
        </div>
      </div>
    </AdminCard>
  );
}

// ---- Journal ----

function JournalEditor({ value, onChange }: { value: JournalContent; onChange: (v: JournalContent) => void }) {
  const set = (patch: Partial<JournalContent>) => onChange({ ...value, ...patch });
  const updateArticle = (i: number, patch: Partial<JournalArticle>) =>
    set({ articles: value.articles.map((a, idx) => (idx === i ? { ...a, ...patch } : a)) });

  return (
    <AdminCard title="Journal">
      <div className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Eyebrow">
            <Input value={value.eyebrow} onChange={(e) => set({ eyebrow: e.target.value })} />
          </Field>
          <Field label="Title">
            <Input value={value.title} onChange={(e) => set({ title: e.target.value })} />
          </Field>
        </div>
        <Field label="Intro">
          <Textarea rows={2} value={value.intro} onChange={(e) => set({ intro: e.target.value })} />
        </Field>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">Articles</p>
            <Button type="button" size="sm" variant="outline" onClick={() => set({ articles: [...value.articles, { slug: "", category: "", title: "", excerpt: "", image: "", date: "", minutes: 4, body: [] }] })}>
              <Plus className="mr-1 size-3.5" /> Add article
            </Button>
          </div>
          {value.articles.map((a, i) => (
            <div key={i} className="border border-line p-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Title">
                  <Input value={a.title} onChange={(e) => updateArticle(i, { title: e.target.value })} />
                </Field>
                <Field label="Slug">
                  <Input className="font-mono" value={a.slug} onChange={(e) => updateArticle(i, { slug: e.target.value })} />
                </Field>
                <Field label="Category">
                  <Input value={a.category} onChange={(e) => updateArticle(i, { category: e.target.value })} />
                </Field>
                <Field label="Date">
                  <Input value={a.date} onChange={(e) => updateArticle(i, { date: e.target.value })} />
                </Field>
              </div>
              <div className="mt-3">
                <ImageInput label="Image" aspect="wide" value={a.image} onChange={(image) => updateArticle(i, { image })} />
              </div>
              <div className="mt-3">
                <Field label="Excerpt">
                  <Textarea rows={2} value={a.excerpt} onChange={(e) => updateArticle(i, { excerpt: e.target.value })} />
                </Field>
              </div>
              <div className="mt-3">
                <Field label="Body (one paragraph per line)">
                  <Textarea rows={5} value={(a.body ?? []).join("\n\n")} onChange={(e) => updateArticle(i, { body: e.target.value.split(/\n{2,}/).filter(Boolean) })} />
                </Field>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <Field label="Min read" className="max-w-32">
                  <Input type="number" value={a.minutes} onChange={(e) => updateArticle(i, { minutes: Number(e.target.value) })} />
                </Field>
                <Button type="button" variant="ghost" size="sm" onClick={() => set({ articles: value.articles.filter((_, idx) => idx !== i) })}>
                  <Trash2 className="mr-1 size-3.5 text-red-600" /> Remove
                </Button>
              </div>
            </div>
          ))}
          {value.articles.length === 0 ? <p className="text-sm text-muted">No articles yet.</p> : null}
        </div>
      </div>
    </AdminCard>
  );
}

// ---- About ----

function AboutEditor({ value, onChange }: { value: AboutContent; onChange: (v: AboutContent) => void }) {
  const set = (patch: Partial<AboutContent>) => onChange({ ...value, ...patch });
  const updateValue = (i: number, patch: Partial<AboutContent["values"][number]>) =>
    set({ values: value.values.map((v, idx) => (idx === i ? { ...v, ...patch } : v)) });

  return (
    <AdminCard title="About">
      <div className="space-y-4 p-6">
        <ImageInput label="Hero image" aspect="wide" value={value.heroImage} onChange={(heroImage) => set({ heroImage })} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Hero eyebrow">
            <Input value={value.heroEyebrow} onChange={(e) => set({ heroEyebrow: e.target.value })} />
          </Field>
          <Field label="Hero title">
            <Input value={value.heroTitle} onChange={(e) => set({ heroTitle: e.target.value })} />
          </Field>
        </div>
        <Field label="Manifesto eyebrow">
          <Input value={value.manifestoEyebrow} onChange={(e) => set({ manifestoEyebrow: e.target.value })} />
        </Field>
        <Field label="Manifesto">
          <Textarea rows={5} value={value.manifesto} onChange={(e) => set({ manifesto: e.target.value })} />
        </Field>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">Values</p>
            <Button type="button" size="sm" variant="outline" onClick={() => set({ values: [...value.values, { title: "", text: "" }] })}>
              <Plus className="mr-1 size-3.5" /> Add value
            </Button>
          </div>
          {value.values.map((v, i) => (
            <div key={i} className="border border-line p-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Title">
                  <Input value={v.title} onChange={(e) => updateValue(i, { title: e.target.value })} />
                </Field>
              </div>
              <div className="mt-3">
                <Field label="Text">
                  <Textarea rows={2} value={v.text} onChange={(e) => updateValue(i, { text: e.target.value })} />
                </Field>
              </div>
              <div className="mt-3 flex justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => set({ values: value.values.filter((_, idx) => idx !== i) })}>
                  <Trash2 className="mr-1 size-3.5 text-red-600" /> Remove
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-line pt-4">
          <ImageInput label="Band image" aspect="portrait" value={value.bandImage} onChange={(bandImage) => set({ bandImage })} />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Field label="Band eyebrow">
              <Input value={value.bandEyebrow} onChange={(e) => set({ bandEyebrow: e.target.value })} />
            </Field>
            <Field label="Band title">
              <Input value={value.bandTitle} onChange={(e) => set({ bandTitle: e.target.value })} />
            </Field>
          </div>
          <div className="mt-3">
            <Field label="Band text">
              <Textarea rows={3} value={value.bandText} onChange={(e) => set({ bandText: e.target.value })} />
            </Field>
          </div>
        </div>
      </div>
    </AdminCard>
  );
}

// ---- Wrapper / tab ----

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ContentEditor({
  activeKey,
  onBack,
}: {
  activeKey: ContentKey;
  onBack: () => void;
}) {
  const mutations = useCmsMutations();
const { raw, isLoading } = useStoredContent(activeKey);
  const [value, setValue] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    setValue(raw ?? null);
  }, [isLoading, raw, activeKey]);

  const onSave = async () => {
    if (!value) return;
    setSaving(true);
    try {
      await mutations.setSetting.mutateAsync({
        key: activeKey,
        group: "content",
        value,
        description: `Structured content for the /${activeKey} page`,
      });
      toast.success(`${activeKey} page saved`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save content");
    } finally {
      setSaving(false);
    }
  };

  const typed = value as unknown as LookbookContent | JournalContent | AboutContent;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink">Editing /{activeKey}</p>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => void onSave()} disabled={saving || !value}>
            {saving ? <Loader2 className="mr-1 size-4 animate-spin" /> : <Save className="mr-1 size-4" />}
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={onBack}>
            Back
          </Button>
        </div>
      </div>
      {isLoading || !typed ? (
        <Skeleton className="h-48" />
      ) : activeKey === "lookbook" ? (
        <LookbookEditor value={typed as LookbookContent} onChange={(v) => { setValue(v as unknown as Record<string, unknown>); }} />
      ) : activeKey === "journal" ? (
        <JournalEditor value={typed as JournalContent} onChange={(v) => { setValue(v as unknown as Record<string, unknown>); }} />
      ) : (
        <AboutEditor value={typed as AboutContent} onChange={(v) => { setValue(v as unknown as Record<string, unknown>); }} />
      )}
    </div>
  );
}

export function ContentPagesTab() {
  const [activeKey, setActiveKey] = useState<ContentKey | null>(null);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {CONTENT_KEYS.map((k) => (
          <Button key={k} size="sm" variant={activeKey === k ? "default" : "outline"} onClick={() => setActiveKey(k)}>
            {k[0].toUpperCase() + k.slice(1)}
          </Button>
        ))}
      </div>
      {activeKey ? <ContentEditor key={activeKey} activeKey={activeKey} onBack={() => setActiveKey(null)} /> : <p className="border border-line p-10 text-center text-sm text-muted">Select a page to edit its content.</p>}
    </div>
  );
}