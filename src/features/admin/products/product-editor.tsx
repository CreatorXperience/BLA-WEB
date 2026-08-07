"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Plus, Save, Trash2, Upload } from "lucide-react";
import { useAdminCollections, useAdminProduct, useAdminProductMutations } from "@/hooks/use-admin";
import { mediaService } from "@/services/media";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorText } from "@/components/shared/form-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageHeader } from "@/features/admin/shared";
import type { AdminProductVariant } from "@/types/admin";

const GENDERS = ["MEN", "WOMEN", "UNISEX", "KIDS"];
const STATUSES = ["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"];

const schema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z.string().optional(),
  sku: z.string().optional(),
  brand: z.string().optional(),
  gender: z.string().optional(),
  status: z.string().default("DRAFT"),
  currency: z.string().length(3).default("NGN"),
  basePrice: z.coerce.number().positive("Base price must be positive"),
  compareAtPrice: z.coerce.number().positive().optional(),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  materials: z.string().optional(),
  careInstructions: z.string().optional(),
  fit: z.string().optional(),
  tags: z.string().optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(200).optional(),
  metaKeywords: z.string().optional(),
  isFeatured: z.boolean(),
  isBestSeller: z.boolean(),
  isTrending: z.boolean(),
  isNewArrival: z.boolean(),
  isLimitedEdition: z.boolean(),
});

type Values = z.infer<typeof schema>;

interface VariantRow {
  id?: string;
  sku: string;
  color: string;
  size: string;
  price: string;
  compareAtPrice: string;
  quantity: string;
  allowBackorder: boolean;
  isActive: boolean;
  isDefault: boolean;
}

interface ImageRow {
  id?: string;
  url: string;
  altText: string;
  isThumbnail: boolean;
}

const emptyVariant: VariantRow = { sku: "", color: "", size: "", price: "", compareAtPrice: "", quantity: "0", allowBackorder: false, isActive: true, isDefault: false };

const defaultValues: Values = {
  name: "",
  slug: "",
  sku: "",
  brand: "",
  gender: "",
  status: "DRAFT",
  currency: "NGN",
  basePrice: 0,
  compareAtPrice: undefined,
  shortDescription: "",
  longDescription: "",
  materials: "",
  careInstructions: "",
  fit: "",
  tags: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  isFeatured: false,
  isBestSeller: false,
  isTrending: false,
  isNewArrival: false,
  isLimitedEdition: false,
};

function toVariantRow(v: AdminProductVariant): VariantRow {
  return {
    id: v.id,
    sku: v.sku ?? "",
    color: v.color ?? "",
    size: v.size ?? "",
    price: String(Number(v.price) || ""),
    compareAtPrice: v.compareAtPrice ? String(Number(v.compareAtPrice)) : "",
    quantity: String(v.inventory?.quantity ?? 0),
    allowBackorder: v.inventory?.status === "BACKORDER",
    isActive: v.isActive,
    isDefault: v.isDefault,
  };
}

export function ProductEditor() {
  const params = useParams<{ id?: string }>();
  const id = params?.id;
  const editing = Boolean(id);
  const router = useRouter();
  const { data: product, isLoading } = useAdminProduct(id ?? "");
  const mutations = useAdminProductMutations();
  const { data: collections = [] } = useAdminCollections();
  const [variants, setVariants] = useState<VariantRow[]>([emptyVariant]);
  const [images, setImages] = useState<ImageRow[]>([]);
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const form = useForm<z.input<typeof schema>, unknown, Values>({ resolver: zodResolver(schema), defaultValues });

  useEffect(() => {
    if (editing && product) {
      form.reset({
        name: product.name,
        slug: product.slug,
        sku: product.sku ?? "",
        brand: product.brand ?? "",
        gender: product.gender ?? "",
        status: product.status,
        currency: product.currency,
        basePrice: Number(product.basePrice),
        compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
        shortDescription: product.shortDescription ?? "",
        longDescription: product.longDescription ?? "",
        materials: product.materials ?? "",
        careInstructions: product.careInstructions ?? "",
        fit: product.fit ?? "",
        tags: (product.tags ?? []).join(", "),
        metaTitle: product.metaTitle ?? "",
        metaDescription: product.metaDescription ?? "",
        metaKeywords: product.metaKeywords ?? "",
        isFeatured: product.isFeatured,
        isBestSeller: product.isBestSeller,
        isTrending: product.isTrending,
        isNewArrival: product.isNewArrival,
        isLimitedEdition: product.isLimitedEdition,
      });
      setVariants((product.variants ?? []).map(toVariantRow));
      setCollectionIds((product.collections ?? []).map((c) => c.id));
      setImages(
        (product.images ?? []).map((img) => ({
          id: img.id,
          url: img.url,
          altText: img.altText ?? "",
          isThumbnail: img.isThumbnail,
        })),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, product]);

  const updateVariant = (index: number, patch: Partial<VariantRow>) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };

  const onSubmit = async (values: Values) => {
    const validVariants = variants.filter((v) => v.sku || v.color || v.size || v.price);
    if (validVariants.length === 0) {
      toast.error("Add at least one variant with a price");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: values.name,
        slug: values.slug || undefined,
        sku: values.sku || undefined,
        brand: values.brand || undefined,
        gender: values.gender || undefined,
        status: values.status,
        currency: values.currency,
        basePrice: Number(values.basePrice),
        compareAtPrice: values.compareAtPrice ? Number(values.compareAtPrice) : undefined,
        shortDescription: values.shortDescription || undefined,
        longDescription: values.longDescription || undefined,
        materials: values.materials || undefined,
        careInstructions: values.careInstructions || undefined,
        fit: values.fit || undefined,
        tags: values.tags ? values.tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 30) : undefined,
        metaTitle: values.metaTitle || undefined,
        metaDescription: values.metaDescription || undefined,
        metaKeywords: values.metaKeywords || undefined,
        isFeatured: values.isFeatured,
        isBestSeller: values.isBestSeller,
        isTrending: values.isTrending,
        isNewArrival: values.isNewArrival,
        isLimitedEdition: values.isLimitedEdition,
        collectionIds: collectionIds.map((collectionId, idx) => ({ collectionId, sortOrder: idx })),
        images: images.filter((i) => i.url.trim()).map((i, idx) => ({
          id: i.id,
          url: i.url.trim(),
          altText: i.altText || undefined,
          isThumbnail: i.isThumbnail || images.filter((x) => x.url.trim()).length === 1,
          sortOrder: idx,
        })),
        variants: validVariants.map((v) => ({
          id: v.id,
          sku: v.sku || undefined,
          color: v.color || undefined,
          size: v.size || undefined,
          price: Number(v.price),
          compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
          isDefault: v.isDefault,
          isActive: v.isActive,
          inventory: {
            quantity: Number(v.quantity) || 0,
            allowBackorder: v.allowBackorder,
            lowStockThreshold: 5,
          },
        })),
      };

      if (editing && id) {
        const saved = await mutations.update.mutateAsync({ id, input: payload });
        toast.success("Product updated");
        router.push(`/admin/products/${saved.id}`);
      } else {
        const created = await mutations.create.mutateAsync(payload);
        toast.success("Product created");
        router.push(`/admin/products/${created.id}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save product");
    } finally {
      setSaving(false);
    }
  };

  if (editing && isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title={editing ? (product?.name ?? "Product") : "New product"}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/products")}>
            <ArrowLeft className="mr-1 size-3.5" /> Back
          </Button>
        }
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* Core */}
            <section className="border border-line bg-paper p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-ink">Details</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="p-name">Name</Label>
                  <Input id="p-name" {...form.register("name")} />
                  {form.formState.errors.name ? <ErrorText>{form.formState.errors.name.message}</ErrorText> : null}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="p-slug">Slug</Label>
                    <Input id="p-slug" placeholder="auto-generated" {...form.register("slug")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-sku">SKU</Label>
                    <Input id="p-sku" {...form.register("sku")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-brand">Brand</Label>
                    <Input id="p-brand" {...form.register("brand")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-gender">Gender</Label>
                    <select id="p-gender" className="w-full border border-line bg-paper px-3 py-2 text-sm focus:border-ink focus:outline-none" {...form.register("gender")}>
                      <option value="">None</option>
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>
                          {g.toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-price">Base price</Label>
                    <Input id="p-price" type="number" step="0.01" {...form.register("basePrice")} />
                    {form.formState.errors.basePrice ? <ErrorText>{form.formState.errors.basePrice.message}</ErrorText> : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-compare">Compare-at price</Label>
                    <Input id="p-compare" type="number" step="0.01" {...form.register("compareAtPrice")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-currency">Currency</Label>
                    <Input id="p-currency" className="uppercase" maxLength={3} {...form.register("currency")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-status">Status</Label>
                    <select id="p-status" className="w-full border border-line bg-paper px-3 py-2 text-sm focus:border-ink focus:outline-none" {...form.register("status")}>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-short">Short description</Label>
                  <Textarea id="p-short" rows={2} {...form.register("shortDescription")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-long">Long description</Label>
                  <Textarea id="p-long" rows={5} {...form.register("longDescription")} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="p-materials">Materials</Label>
                    <Input id="p-materials" {...form.register("materials")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-care">Care</Label>
                    <Input id="p-care" {...form.register("careInstructions")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-fit">Fit</Label>
                    <Input id="p-fit" {...form.register("fit")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-tags">Tags (comma-separated)</Label>
                  <Input id="p-tags" placeholder="cotton, limited, core" {...form.register("tags")} />
                </div>
              </div>
            </section>

            {/* Variants */}
            <section className="border border-line bg-paper p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">Variants</h2>
                <Button type="button" variant="outline" size="sm" onClick={() => setVariants((prev) => [...prev, { ...emptyVariant }])}>
                  <Plus className="mr-1 size-3.5" /> Add variant
                </Button>
              </div>
              <div className="space-y-3">
                {variants.map((v, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2 border border-line p-3 sm:grid-cols-[1fr_1fr_1fr_90px_90px_auto]">
                    <Input placeholder="SKU" value={v.sku} onChange={(e) => updateVariant(i, { sku: e.target.value })} />
                    <Input placeholder="Color" value={v.color} onChange={(e) => updateVariant(i, { color: e.target.value })} />
                    <Input placeholder="Size" value={v.size} onChange={(e) => updateVariant(i, { size: e.target.value })} />
                    <Input placeholder="Price" type="number" step="0.01" value={v.price} onChange={(e) => updateVariant(i, { price: e.target.value })} />
                    <Input placeholder="Qty" type="number" value={v.quantity} onChange={(e) => updateVariant(i, { quantity: e.target.value })} />
                    <div className="col-span-2 flex flex-wrap items-center gap-3 sm:col-span-1">
                      <label className="flex items-center gap-1 text-xs text-muted">
                        <input type="checkbox" checked={v.isDefault} onChange={(e) => updateVariant(i, { isDefault: e.target.checked })} className="accent-ink" />
                        Default
                      </label>
                      <label className="flex items-center gap-1 text-xs text-muted">
                        <input type="checkbox" checked={v.allowBackorder} onChange={(e) => updateVariant(i, { allowBackorder: e.target.checked })} className="accent-ink" />
                        Backorder
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="iconSm"
                        className="text-red-600"
                        onClick={() => setVariants((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Images */}
            <section className="border border-line bg-paper p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">Images</h2>
                <Button type="button" variant="outline" size="sm" onClick={() => setImages((prev) => [...prev, { url: "", altText: "", isThumbnail: false }])}>
                  <Plus className="mr-1 size-3.5" /> Add image
                </Button>
              </div>
              <div className="space-y-3">
                {images.length === 0 ? <p className="text-sm text-muted">No images yet.</p> : null}
                {images.map((img, i) => (
                  <ImageRow
                    key={i}
                    img={img}
                    onUrl={(url) => setImages((prev) => prev.map((x, idx) => (idx === i ? { ...x, url } : x)))}
                    onAltText={(altText) => setImages((prev) => prev.map((x, idx) => (idx === i ? { ...x, altText } : x)))}
                    onThumb={() => setImages((prev) => prev.map((x, idx) => ({ ...x, isThumbnail: idx === i })))}
                    onRemove={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  />
                ))}
              </div>
            </section>

            {/* Collections */}
            <section className="border border-line bg-paper p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">Collections</h2>
                <span className="text-xs text-muted">{collectionIds.length} selected</span>
              </div>
              {collections.length === 0 ? (
                <p className="text-sm text-muted">No collections yet. Create one from the Collections page first.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {collections.map((c) => {
                    const checked = collectionIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() =>
                          setCollectionIds((prev) => (checked ? prev.filter((id) => id !== c.id) : [...prev, c.id]))
                        }
                        className={`border px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors ${
                          checked ? "border-ink bg-ink text-background" : "border-ink/20 text-ink hover:border-ink"
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* SEO */}
            <section className="border border-line bg-paper p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-ink">SEO</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="p-metatitle">Meta title</Label>
                  <Input id="p-metatitle" {...form.register("metaTitle")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-metadesc">Meta description</Label>
                  <Textarea id="p-metadesc" rows={2} {...form.register("metaDescription")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-metakeywords">Meta keywords</Label>
                  <Input id="p-metakeywords" {...form.register("metaKeywords")} />
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="border border-line bg-paper p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-ink">Flags</h2>
              <div className="space-y-3">
                {(
                  [
                    ["isFeatured", "Featured"],
                    ["isBestSeller", "Best seller"],
                    ["isNewArrival", "New arrival"],
                    ["isTrending", "Trending"],
                    ["isLimitedEdition", "Limited edition"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between border border-line px-3 py-2.5 text-sm">
                    <span className="text-muted">{label}</span>
                    <input type="checkbox" className="accent-ink" {...form.register(key)} />
                  </label>
                ))}
              </div>
            </section>

            <div className="sticky top-24 space-y-3">
              <Button type="submit" className="w-full" disabled={saving}>
                <Save className="mr-1 size-4" />
                {saving ? "Saving…" : editing ? "Save changes" : "Create product"}
              </Button>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}

function ImageRow({
  img,
  onUrl,
  onAltText,
  onThumb,
  onRemove,
}: {
  img: ImageRow;
  onUrl: (url: string) => void;
  onAltText: (altText: string) => void;
  onThumb: () => void;
  onRemove: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const asset = await mediaService.upload(file, file.name, "products");
      onUrl(asset.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2 border border-line p-3 sm:flex-row sm:items-center">
      {img.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img.url} alt="" className="size-12 shrink-0 border border-line bg-mist object-cover" />
      ) : null}
      <Input
        placeholder="Image URL"
        value={img.url}
        onChange={(e) => onUrl(e.target.value)}
      />
      <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => fileRef.current?.click()}>
        {busy ? "Uploading…" : <Upload className="mr-1 size-3.5" />}
        {busy ? "" : "Upload"}
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      <Input
        placeholder="Alt text"
        value={img.altText}
        onChange={(e) => onAltText(e.target.value)}
      />
      <label className="flex shrink-0 items-center gap-1 text-xs text-muted">
        <input
          type="radio"
          name="img-thumb"
          checked={img.isThumbnail}
          onChange={onThumb}
          className="accent-ink"
        />
        Thumb
      </label>
      <Button
        type="button"
        variant="ghost"
        size="iconSm"
        className="text-red-600"
        onClick={onRemove}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
