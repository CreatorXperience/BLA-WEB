"use client";

import { useState } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Pencil, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { useCmsAnnouncements, useCmsMutations, useCmsNav, useCmsPages, useCmsSections, useCmsSettings } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorText } from "@/components/shared/form-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageHeader, StatusBadge } from "@/features/admin/shared";
import { ImageInput } from "@/features/admin/shared/media-input";
import { ContentPagesTab } from "@/features/admin/cms/content-pages";

export function CmsManager() {
  return (
    <div>
      <AdminPageHeader title="CMS" />
      <Tabs defaultValue="sections">
        <TabsList>
          <TabsTrigger value="sections">Homepage</TabsTrigger>
          <TabsTrigger value="content">Content pages</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="sections">
          <HomepageSectionsTab />
        </TabsContent>
        <TabsContent value="content">
          <ContentPagesTab />
        </TabsContent>
        <TabsContent value="announcements">
          <AnnouncementsTab />
        </TabsContent>
        <TabsContent value="navigation">
          <NavigationTab />
        </TabsContent>
        <TabsContent value="pages">
          <PagesTab />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---- Homepage sections ----

const SECTION_TYPES = [
  "HERO_BANNER",
  "ANNOUNCEMENT_BAR",
  "FEATURED_COLLECTIONS",
  "FEATURED_PRODUCTS",
  "NEW_ARRIVALS",
  "EDITORIAL",
  "INSTAGRAM_GALLERY",
  "TESTIMONIALS",
  "NEWSLETTER",
  "PROMOTIONAL_BANNER",
  "FOOTER_LINK",
  "NAVIGATION",
];

const sectionSchema = z.object({
  sectionKey: z.string().min(1, "Key is required"),
  sectionType: z.enum(SECTION_TYPES as [string, ...string[]]),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT"]),
  sortOrder: z.coerce.number().int().min(0),
  mediaUrl: z.string().optional(),
  ctaText: z.string().optional(),
  ctaUrl: z.string().optional(),
  extraJson: z.string().optional(),
});

type SectionValues = z.infer<typeof sectionSchema>;

const IMAGE_SECTION_TYPES = new Set(["HERO_BANNER", "EDITORIAL", "PROMOTIONAL_BANNER"]);

function HomepageSectionsTab() {
  const { data: sections, isLoading } = useCmsSections();
  const mutations = useCmsMutations();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sectionImages, setSectionImages] = useState<string[]>([]);
  const form = useForm<z.input<typeof sectionSchema>, unknown, SectionValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      sectionKey: "",
      sectionType: "HERO_BANNER",
      title: "",
      subtitle: "",
      status: "ACTIVE",
      sortOrder: 0,
      mediaUrl: "",
      ctaText: "",
      ctaUrl: "",
      extraJson: "{}",
    },
  });
  const watchedType = form.watch("sectionType");

  const openEdit = (key: string) => {
    const s = sections?.find((x) => x.sectionKey === key);
    if (!s) return;
    setEditingKey(key);
    setCreating(false);
    const { mediaUrl, ctaText, ctaUrl, images, ...rest } = (s.content ?? {}) as Record<string, unknown>;
    form.reset({
      sectionKey: s.sectionKey,
      sectionType: s.sectionType,
      title: s.title ?? "",
      subtitle: s.subtitle ?? "",
      status: s.status,
      sortOrder: s.sortOrder,
      mediaUrl: typeof mediaUrl === "string" ? mediaUrl : "",
      ctaText: typeof ctaText === "string" ? ctaText : "",
      ctaUrl: typeof ctaUrl === "string" ? ctaUrl : "",
      extraJson: JSON.stringify(rest, null, 2),
    });
    setSectionImages(Array.isArray(images) ? images.filter((u): u is string => typeof u === "string") : []);
    setShowAdvanced(false);
  };

  const openCreate = () => {
    setCreating(true);
    setEditingKey(null);
    form.reset({ sectionKey: "", sectionType: "HERO_BANNER", title: "", subtitle: "", status: "DRAFT", sortOrder: 0, mediaUrl: "", ctaText: "", ctaUrl: "", extraJson: "{}" });
    setSectionImages([]);
    setShowAdvanced(false);
  };

  const onSubmit = async (values: SectionValues) => {
    const content: Record<string, unknown> = {};
    if (values.mediaUrl) content.mediaUrl = values.mediaUrl;
    if ((watchedType === "HERO_BANNER" || watchedType === "INSTAGRAM_GALLERY") && sectionImages.length > 0) {
      content.images = sectionImages.filter((u) => u.trim());
    }
    if (values.ctaText) content.ctaText = values.ctaText;
    if (values.ctaUrl) content.ctaUrl = values.ctaUrl;
    if (values.extraJson && values.extraJson.trim()) {
      try {
        const parsed = JSON.parse(values.extraJson) as Record<string, unknown>;
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          Object.assign(content, parsed);
        } else {
          toast.error("Advanced content must be a JSON object");
          return;
        }
      } catch {
        toast.error("Advanced content must be valid JSON");
        return;
      }
    }
    try {
      await mutations.upsertSection.mutateAsync({
        sectionKey: values.sectionKey,
        input: {
          sectionType: values.sectionType,
          title: values.title || undefined,
          subtitle: values.subtitle || undefined,
          status: values.status,
          sortOrder: Number(values.sortOrder),
          content,
        },
      });
      toast.success("Section saved");
      setEditingKey(null);
      setCreating(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save section");
    }
  };

  const onDelete = async (key: string) => {
    if (!confirm(`Delete homepage section "${key}"?`)) return;
    try {
      await mutations.deleteSection.mutateAsync(key);
      toast.success("Section deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete section");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1 size-4" /> New section
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {sections?.map((s) => (
            <div key={s.sectionKey} className="flex items-center justify-between gap-4 border border-line bg-paper px-4 py-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-medium text-ink">
                  <span className="font-mono">{s.sectionKey}</span>
                  <StatusBadge status={s.status} />
                </p>
                <p className="text-xs text-muted">
                  {s.sectionType.toLowerCase()} · order {s.sortOrder}
                  {s.title ? ` · ${s.title}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="iconSm" onClick={() => openEdit(s.sectionKey)}>
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" size="iconSm" className="text-red-600" onClick={() => void onDelete(s.sectionKey)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
          {!sections || sections.length === 0 ? <p className="border border-line p-10 text-center text-sm text-muted">No sections yet.</p> : null}
        </div>
      )}

      {editingKey || creating ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={() => (setEditingKey(null), setCreating(false))}>
          <form
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto border border-line bg-paper p-6"
            onClick={(e) => e.stopPropagation()}
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <h2 className="mb-4 text-lg font-semibold text-ink">{creating ? "New homepage section" : `Edit ${editingKey}`}</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hs-key">Section key</Label>
                <Input id="hs-key" placeholder="hero_banner" className="font-mono" disabled={Boolean(editingKey)} {...form.register("sectionKey")} />
                {form.formState.errors.sectionKey ? <ErrorText>{form.formState.errors.sectionKey.message}</ErrorText> : null}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="hs-type">Section type</Label>
                  <select id="hs-type" className="w-full border border-line bg-paper px-3 py-2 text-sm focus:border-ink focus:outline-none" {...form.register("sectionType")}>
                    {SECTION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hs-status">Status</Label>
                  <select id="hs-status" className="w-full border border-line bg-paper px-3 py-2 text-sm focus:border-ink focus:outline-none" {...form.register("status")}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="hs-title">Title / Headline</Label>
                  <Input id="hs-title" placeholder={watchedType === "HERO_BANNER" ? "Slide headline" : "Title"} {...form.register("title")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hs-order">Sort order</Label>
                  <Input id="hs-order" type="number" {...form.register("sortOrder")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hs-subtitle">Subtitle</Label>
                <Input id="hs-subtitle" {...form.register("subtitle")} />
              </div>

              {IMAGE_SECTION_TYPES.has(watchedType) ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="hs-mediaurl">{watchedType === "HERO_BANNER" ? "Slide image" : "Image"}</Label>
                      {watchedType === "HERO_BANNER" ? (
                        <span className="text-[11px] text-muted">Add extra images below to make this a multi-slide hero</span>
                      ) : watchedType === "INSTAGRAM_GALLERY" ? (
                        <span className="text-[11px] text-muted">Add images below for the gallery tiles</span>
                      ) : null}
                    </div>
                    <ImageInput label={watchedType === "HERO_BANNER" ? "Primary image" : "Image"} value={form.watch("mediaUrl")} onChange={(url) => form.setValue("mediaUrl", url)} />
                  </div>

                  {watchedType === "HERO_BANNER" || watchedType === "INSTAGRAM_GALLERY" ? (
                    <div className="space-y-2 rounded border border-dashed border-line p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted">
                          {watchedType === "INSTAGRAM_GALLERY" ? `Gallery tiles (${sectionImages.length})` : `Additional slides (${sectionImages.length})`}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSectionImages((prev) => [...prev, ""])}
                        >
                          <Plus className="mr-1 size-3.5" /> Add image
                        </Button>
                      </div>
                      {sectionImages.length === 0 ? (
                        <p className="text-xs text-muted">
                          {watchedType === "INSTAGRAM_GALLERY"
                            ? "No gallery images yet. Add images below to show them on the homepage."
                            : "No additional slides. Use the primary image for a single-slide hero, or add more below."}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {sectionImages.map((url, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <ImageInput label={watchedType === "INSTAGRAM_GALLERY" ? `Image ${i + 1}` : `Slide ${i + 2}`} value={url} onChange={(next) => setSectionImages((prev) => prev.map((u, idx) => (idx === i ? next : u)))} />
                              <div className="flex shrink-0 flex-col gap-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="iconSm"
                                  disabled={i === 0}
                                  onClick={() => setSectionImages((prev) => { const copy = [...prev]; [copy[i - 1], copy[i]] = [copy[i], copy[i - 1]]; return copy; })}
                                >
                                  <ChevronUp className="size-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="iconSm"
                                  disabled={i === sectionImages.length - 1}
                                  onClick={() => setSectionImages((prev) => { const copy = [...prev]; [copy[i + 1], copy[i]] = [copy[i], copy[i + 1]]; return copy; })}
                                >
                                  <ChevronDown className="size-3.5" />
                                </Button>
                                <Button type="button" variant="ghost" size="iconSm" className="text-red-600" onClick={() => setSectionImages((prev) => prev.filter((_, idx) => idx !== i))}>
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="hs-cta">Button text</Label>
                      <Input id="hs-cta" placeholder="Shop the drop" {...form.register("ctaText")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hs-ctaurl">Button link</Label>
                      <Input id="hs-ctaurl" placeholder="/shop" {...form.register("ctaUrl")} />
                    </div>
                  </div>
                </>
              ) : null}

              <div className="space-y-2">
                <button
                  type="button"
                  className="text-xs font-medium uppercase tracking-wider text-muted underline-offset-2 hover:underline"
                  onClick={() => setShowAdvanced((v) => !v)}
                >
                  {showAdvanced ? "Hide" : "Show"} advanced content (JSON)
                </button>
                {showAdvanced ? (
                  <Textarea id="hs-content" rows={6} className="font-mono text-xs" {...form.register("extraJson")} />
                ) : null}
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">
                  Save section
                </Button>
                <Button type="button" variant="outline" onClick={() => (setEditingKey(null), setCreating(false))}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

// ---- Announcements ----

const announcementSchema = z.object({
  message: z.string().min(1, "Message is required").max(500),
  link: z.string().optional(),
  isActive: z.boolean(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
});

type AnnouncementValues = z.infer<typeof announcementSchema>;

function AnnouncementsTab() {
  const { data, isLoading } = useCmsAnnouncements();
  const mutations = useCmsMutations();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const form = useForm<z.input<typeof announcementSchema>, unknown, AnnouncementValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { message: "", link: "", isActive: true, startsAt: "", endsAt: "" },
  });

  const openCreate = () => {
    setEditingId(null);
    form.reset({ message: "", link: "", isActive: true, startsAt: "", endsAt: "" });
    setShowForm(true);
  };

  const openEdit = (id: string) => {
    const a = data?.find((x) => x.id === id);
    if (!a) return;
    setEditingId(id);
    form.reset({
      message: a.message,
      link: a.link ?? "",
      isActive: a.isActive,
      startsAt: a.startsAt ? a.startsAt.slice(0, 16) : "",
      endsAt: a.endsAt ? a.endsAt.slice(0, 16) : "",
    });
    setShowForm(true);
  };

  const onSubmit = async (values: AnnouncementValues) => {
    try {
      await mutations.upsertAnnouncement.mutateAsync({
        id: editingId ?? undefined,
        input: {
          message: values.message,
          link: values.link || undefined,
          isActive: values.isActive,
          startsAt: values.startsAt ? new Date(values.startsAt).toISOString() : null,
          endsAt: values.endsAt ? new Date(values.endsAt).toISOString() : null,
        },
      });
      toast.success(editingId ? "Announcement updated" : "Announcement created");
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save announcement");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await mutations.deleteAnnouncement.mutateAsync(id);
      toast.success("Announcement deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete announcement");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1 size-4" /> New announcement
        </Button>
      </div>
      {isLoading ? (
        <Skeleton className="h-20" />
      ) : (
        <div className="space-y-2">
          {data?.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-4 border border-line bg-paper px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{a.message}</p>
                {a.link ? <p className="truncate text-xs text-muted">{a.link}</p> : null}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <StatusBadge status={a.isActive ? "ACTIVE" : "INACTIVE"} />
                <Button variant="ghost" size="iconSm" onClick={() => openEdit(a.id)}>
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" size="iconSm" className="text-red-600" onClick={() => void onDelete(a.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
          {!data || data.length === 0 ? <p className="border border-line p-10 text-center text-sm text-muted">No announcements.</p> : null}
        </div>
      )}

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={() => setShowForm(false)}>
          <form
            className="max-h-[90vh] w-full max-w-md overflow-y-auto border border-line bg-paper p-6"
            onClick={(e) => e.stopPropagation()}
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <h2 className="mb-4 text-lg font-semibold text-ink">{editingId ? "Edit announcement" : "New announcement"}</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="an-message">Message</Label>
                <Input id="an-message" {...form.register("message")} />
                {form.formState.errors.message ? <ErrorText>{form.formState.errors.message.message}</ErrorText> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="an-link">Link</Label>
                <Input id="an-link" placeholder="https://…" {...form.register("link")} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="an-starts">Starts</Label>
                  <Input id="an-starts" type="datetime-local" {...form.register("startsAt")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="an-ends">Ends</Label>
                  <Input id="an-ends" type="datetime-local" {...form.register("endsAt")} />
                </div>
              </div>
              <label className="flex items-center justify-between border border-line px-3 py-2.5 text-sm">
                <span className="text-muted">Active</span>
                <input type="checkbox" className="accent-ink" {...form.register("isActive")} />
              </label>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">
                  Save announcement
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

// ---- Navigation ----

const navSchema = z.object({
  label: z.string().min(1, "Label is required").max(100),
  url: z.string().optional(),
  type: z.enum(["CUSTOM", "CATEGORY", "COLLECTION", "PRODUCT", "PAGE"]),
  refId: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

type NavValues = z.infer<typeof navSchema>;

function NavigationTab() {
  const { data, isLoading } = useCmsNav();
  const mutations = useCmsMutations();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const form = useForm<z.input<typeof navSchema>, unknown, NavValues>({
    resolver: zodResolver(navSchema),
    defaultValues: { label: "", url: "", type: "CUSTOM", refId: "", sortOrder: 0, isActive: true },
  });

  const openCreate = () => {
    setEditingId(null);
    form.reset({ label: "", url: "", type: "CUSTOM", refId: "", sortOrder: data?.length ?? 0, isActive: true });
    setShowForm(true);
  };

  const openEdit = (id: string) => {
    const item = data?.find((x) => x.id === id);
    if (!item) return;
    setEditingId(id);
    form.reset({
      label: item.label,
      url: item.url ?? "",
      type: item.type as NavValues["type"],
      refId: item.refId ?? "",
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setShowForm(true);
  };

  const onSubmit = async (values: NavValues) => {
    try {
      await mutations.upsertNavItem.mutateAsync({
        id: editingId ?? undefined,
        input: {
          label: values.label,
          url: values.url || undefined,
          type: values.type,
          refId: values.refId || undefined,
          sortOrder: Number(values.sortOrder),
          isActive: values.isActive,
        },
      });
      toast.success(editingId ? "Nav item updated" : "Nav item created");
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save nav item");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this nav item?")) return;
    try {
      await mutations.deleteNavItem.mutateAsync(id);
      toast.success("Nav item deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete nav item");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1 size-4" /> New nav item
        </Button>
      </div>
      {isLoading ? (
        <Skeleton className="h-20" />
      ) : (
        <div className="space-y-2">
          {data?.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 border border-line bg-paper px-4 py-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-medium text-ink">
                  {item.label} <StatusBadge status={item.isActive ? "ACTIVE" : "INACTIVE"} />
                </p>
                <p className="text-xs text-muted">
                  {item.type.toLowerCase()} · order {item.sortOrder}
                  {item.url ? ` · ${item.url}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="iconSm" onClick={() => openEdit(item.id)}>
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" size="iconSm" className="text-red-600" onClick={() => void onDelete(item.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
          {!data || data.length === 0 ? <p className="border border-line p-10 text-center text-sm text-muted">No nav items.</p> : null}
        </div>
      )}

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={() => setShowForm(false)}>
          <form
            className="max-h-[90vh] w-full max-w-md overflow-y-auto border border-line bg-paper p-6"
            onClick={(e) => e.stopPropagation()}
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <h2 className="mb-4 text-lg font-semibold text-ink">{editingId ? "Edit nav item" : "New nav item"}</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nv-label">Label</Label>
                <Input id="nv-label" {...form.register("label")} />
                {form.formState.errors.label ? <ErrorText>{form.formState.errors.label.message}</ErrorText> : null}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="nv-type">Type</Label>
                  <select id="nv-type" className="w-full border border-line bg-paper px-3 py-2 text-sm focus:border-ink focus:outline-none" {...form.register("type")}>
                    <option value="CUSTOM">Custom</option>
                    <option value="CATEGORY">Category</option>
                    <option value="COLLECTION">Collection</option>
                    <option value="PRODUCT">Product</option>
                    <option value="PAGE">Page</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nv-order">Sort order</Label>
                  <Input id="nv-order" type="number" {...form.register("sortOrder")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nv-url">URL</Label>
                <Input id="nv-url" placeholder="/shop" {...form.register("url")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nv-ref">Ref ID (for type)</Label>
                <Input id="nv-ref" {...form.register("refId")} />
              </div>
              <label className="flex items-center justify-between border border-line px-3 py-2.5 text-sm">
                <span className="text-muted">Active</span>
                <input type="checkbox" className="accent-ink" {...form.register("isActive")} />
              </label>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">
                  Save nav item
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

// ---- Pages ----

const pageSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().min(1, "Slug is required").max(200),
  body: z.string().min(1, "Body is required"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isPublished: z.boolean(),
});

type PageValues = z.infer<typeof pageSchema>;

function PagesTab() {
  const { data, isLoading } = useCmsPages();
  const mutations = useCmsMutations();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const form = useForm<z.input<typeof pageSchema>, unknown, PageValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: { title: "", slug: "", body: "", metaTitle: "", metaDescription: "", isPublished: false },
  });

  const openCreate = () => {
    setEditingId(null);
    form.reset({ title: "", slug: "", body: "", metaTitle: "", metaDescription: "", isPublished: false });
    setShowForm(true);
  };

  const openEdit = (id: string) => {
    const p = data?.find((x) => x.id === id);
    if (!p) return;
    setEditingId(id);
    form.reset({
      title: p.title,
      slug: p.slug,
      body: p.body,
      metaTitle: p.metaTitle ?? "",
      metaDescription: p.metaDescription ?? "",
      isPublished: p.isPublished,
    });
    setShowForm(true);
  };

  const onSubmit = async (values: PageValues) => {
    try {
      await mutations.upsertPage.mutateAsync({
        id: editingId ?? undefined,
        input: {
          title: values.title,
          slug: values.slug,
          body: values.body,
          metaTitle: values.metaTitle || undefined,
          metaDescription: values.metaDescription || undefined,
          isPublished: values.isPublished,
        },
      });
      toast.success(editingId ? "Page updated" : "Page created");
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save page");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this page?")) return;
    try {
      await mutations.deletePage.mutateAsync(id);
      toast.success("Page deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete page");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1 size-4" /> New page
        </Button>
      </div>
      {isLoading ? (
        <Skeleton className="h-20" />
      ) : (
        <div className="space-y-2">
          {data?.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 border border-line bg-paper px-4 py-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-medium text-ink">
                  {p.title} <StatusBadge status={p.isPublished ? "PUBLISHED" : "DRAFT"} />
                </p>
                <p className="text-xs text-muted">/{p.slug}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="iconSm" onClick={() => openEdit(p.id)}>
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" size="iconSm" className="text-red-600" onClick={() => void onDelete(p.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
          {!data || data.length === 0 ? <p className="border border-line p-10 text-center text-sm text-muted">No pages yet.</p> : null}
        </div>
      )}

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={() => setShowForm(false)}>
          <form
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-line bg-paper p-6"
            onClick={(e) => e.stopPropagation()}
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <h2 className="mb-4 text-lg font-semibold text-ink">{editingId ? "Edit page" : "New page"}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="pg-title">Title</Label>
                  <Input id="pg-title" {...form.register("title")} />
                  {form.formState.errors.title ? <ErrorText>{form.formState.errors.title.message}</ErrorText> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pg-slug">Slug</Label>
                  <Input id="pg-slug" placeholder="about" {...form.register("slug")} />
                  {form.formState.errors.slug ? <ErrorText>{form.formState.errors.slug.message}</ErrorText> : null}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pg-body">Body</Label>
                <Textarea id="pg-body" rows={10} {...form.register("body")} />
                {form.formState.errors.body ? <ErrorText>{form.formState.errors.body.message}</ErrorText> : null}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="pg-metatitle">Meta title</Label>
                  <Input id="pg-metatitle" {...form.register("metaTitle")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pg-metadesc">Meta description</Label>
                  <Input id="pg-metadesc" {...form.register("metaDescription")} />
                </div>
              </div>
              <label className="flex items-center justify-between border border-line px-3 py-2.5 text-sm">
                <span className="text-muted">Published</span>
                <input type="checkbox" className="accent-ink" {...form.register("isPublished")} />
              </label>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">
                  Save page
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

// ---- Settings ----

const settingSchema = z.object({
  key: z.string().min(1, "Key is required").max(100),
  group: z.string().max(50).default("general"),
  description: z.string().max(500).optional(),
  value: z.string(),
  isSecret: z.boolean(),
});

type SettingValues = z.infer<typeof settingSchema>;

const SETTING_GROUPS = ["general", "store", "payments", "shipping", "taxes", "branding", "email"];

function SettingsTab() {
  const [group, setGroup] = useState<string>("general");
  const { data, isLoading } = useCmsSettings(group);
  const mutations = useCmsMutations();
  const [showForm, setShowForm] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const form = useForm<z.input<typeof settingSchema>, unknown, SettingValues>({
    resolver: zodResolver(settingSchema),
    defaultValues: { key: "", group: "general", description: "", value: "", isSecret: false },
  });

  const openCreate = () => {
    setEditingKey(null);
    form.reset({ key: "", group, description: "", value: "", isSecret: false });
    setShowForm(true);
  };

  const openEdit = (key: string) => {
    const s = data?.find((x) => x.key === key);
    if (!s) return;
    setEditingKey(key);
    form.reset({
      key: s.key,
      group: s.group,
      description: s.description ?? "",
      value: s.isSecret ? "••••••" : JSON.stringify(s.value ?? ""),
      isSecret: s.isSecret,
    });
    setShowForm(true);
  };

  const onSubmit = async (values: SettingValues) => {
    let parsed: unknown = values.value;
    if (!values.isSecret) {
      try {
        parsed = JSON.parse(values.value);
      } catch {
        parsed = values.value;
      }
    }
    try {
      await mutations.setSetting.mutateAsync({
        key: values.key,
        group: values.group || "general",
        description: values.description || undefined,
        isSecret: values.isSecret,
        value: values.isSecret ? values.value : parsed,
      });
      toast.success("Setting saved");
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save setting");
    }
  };

  const onDelete = async (key: string) => {
    if (!confirm(`Delete setting "${key}"?`)) return;
    try {
      await mutations.deleteSetting.mutateAsync(key);
      toast.success("Setting deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete setting");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select value={group} onChange={(e) => setGroup(e.target.value)} className="border border-line bg-paper px-3 py-2 text-sm focus:border-ink focus:outline-none">
          {SETTING_GROUPS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1 size-4" /> New setting
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-20" />
      ) : (
        <div className="space-y-2">
          {data?.map((s) => (
            <div key={s.key} className="flex items-center justify-between gap-4 border border-line bg-paper px-4 py-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-medium text-ink">
                  <span className="font-mono">{s.key}</span>
                  {s.isSecret ? <span className="text-[10px] uppercase tracking-wider text-economy">secret</span> : null}
                </p>
                {s.description ? <p className="text-xs text-muted">{s.description}</p> : null}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="iconSm" onClick={() => openEdit(s.key)}>
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" size="iconSm" className="text-red-600" onClick={() => void onDelete(s.key)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
          {!data || data.length === 0 ? <p className="border border-line p-10 text-center text-sm text-muted">No settings in this group.</p> : null}
        </div>
      )}

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={() => setShowForm(false)}>
          <form
            className="max-h-[90vh] w-full max-w-md overflow-y-auto border border-line bg-paper p-6"
            onClick={(e) => e.stopPropagation()}
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <h2 className="mb-4 text-lg font-semibold text-ink">{editingKey ? `Edit ${editingKey}` : "New setting"}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="st-key">Key</Label>
                  <Input id="st-key" className="font-mono" disabled={Boolean(editingKey)} {...form.register("key")} />
                  {form.formState.errors.key ? <ErrorText>{form.formState.errors.key.message}</ErrorText> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="st-group">Group</Label>
                  <Input id="st-group" {...form.register("group")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="st-value">Value</Label>
                <Textarea id="st-value" rows={3} className="font-mono text-xs" {...form.register("value")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="st-desc">Description</Label>
                <Input id="st-desc" {...form.register("description")} />
              </div>
              <label className="flex items-center justify-between border border-line px-3 py-2.5 text-sm">
                <span className="text-muted">Secret (e.g. API key)</span>
                <input type="checkbox" className="accent-ink" {...form.register("isSecret")} />
              </label>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">
                  Save setting
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
