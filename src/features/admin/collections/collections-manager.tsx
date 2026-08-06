"use client";

import { useState } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useAdminCollections, useAdminCollectionMutations } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorText } from "@/components/shared/form-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageHeader, StatusBadge } from "@/features/admin/shared";
import { ImageInput } from "@/features/admin/shared/media-input";
import type { Collection } from "@/types/catalog";
import { cn } from "@/lib/utils";

const collectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, hyphenated (e.g. noir-drop-001)")
    .optional()
    .or(z.literal("")),
  description: z.string().trim().max(1000).optional(),
  bannerUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  metaTitle: z.string().trim().max(70).optional(),
  metaDescription: z.string().trim().max(200).optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  badge: z.string().trim().max(50).optional(),
});

type CollectionValues = z.input<typeof collectionSchema>;

export function CollectionsManager() {
  const { data: collections, isLoading } = useAdminCollections();
  const mutations = useAdminCollectionMutations();
  const [editing, setEditing] = useState<Collection | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const form = useForm<CollectionValues, unknown, z.output<typeof collectionSchema>>({
    resolver: zodResolver(collectionSchema),
    defaultValues: { name: "", slug: "", description: "", bannerUrl: "", metaTitle: "", metaDescription: "", sortOrder: 0, isActive: true, isFeatured: false, badge: "" },
  });

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    form.reset({ name: "", slug: "", description: "", bannerUrl: "", metaTitle: "", metaDescription: "", sortOrder: 0, isActive: true, isFeatured: false, badge: "" });
  };

  const openEdit = (c: Collection) => {
    setEditing(c);
    setCreating(false);
    form.reset({
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      bannerUrl: c.bannerUrl ?? c.imageUrl ?? "",
      metaTitle: c.metaTitle ?? "",
      metaDescription: c.metaDescription ?? "",
      sortOrder: c.sortOrder ?? 0,
      isActive: c.isActive ?? true,
      isFeatured: c.isFeatured ?? false,
      badge: c.badge ?? "",
    });
  };

  const onSubmit = async (values: CollectionValues) => {
    setBusy(true);
    const payload = {
      name: values.name,
      slug: values.slug || undefined,
      description: values.description || undefined,
      bannerUrl: values.bannerUrl || undefined,
      metaTitle: values.metaTitle || undefined,
      metaDescription: values.metaDescription || undefined,
      sortOrder: Number(values.sortOrder),
      isActive: values.isActive,
      isFeatured: values.isFeatured,
      badge: values.badge || undefined,
    };
    try {
      if (editing) {
        await mutations.update.mutateAsync({ id: editing.id, input: payload });
        toast.success("Collection updated");
      } else {
        await mutations.create.mutateAsync(payload);
        toast.success("Collection created");
      }
      setEditing(null);
      setCreating(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save collection");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (c: Collection) => {
    if (!confirm(`Delete collection "${c.name}"?`)) return;
    try {
      await mutations.remove.mutateAsync(c.id);
      toast.success("Collection deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete collection");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Collections"
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1 size-4" /> New collection
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {(collections ?? []).map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-4 border border-line bg-paper px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                {c.imageUrl ?? c.bannerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.imageUrl ?? c.bannerUrl ?? ""} alt="" className="size-12 shrink-0 border border-line bg-mist object-cover" />
                ) : null}
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium text-ink">
                    <span>{c.name}</span>
                    {c.isFeatured ? <StatusBadge status="ACTIVE" /> : null}
                    {c.isActive === false ? <StatusBadge status="INACTIVE" /> : null}
                  </p>
                  <p className="truncate text-xs text-muted">
                    /collections/{c.slug}
                    {c.productCount != null ? ` · ${c.productCount} products` : ""}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="iconSm" onClick={() => openEdit(c)}>
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" size="iconSm" className="text-red-600" onClick={() => void onDelete(c)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
          {!collections || collections.length === 0 ? <p className="border border-line p-10 text-center text-sm text-muted">No collections yet.</p> : null}
        </div>
      )}

      {creating || editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={() => (setCreating(false), setEditing(null))}>
          <form
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto border border-line bg-paper p-6"
            onClick={(e) => e.stopPropagation()}
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <h2 className="mb-4 text-lg font-semibold text-ink">{creating ? "New collection" : `Edit ${editing?.name}`}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="col-name">Name</Label>
                  <Input id="col-name" {...form.register("name")} />
                  {form.formState.errors.name ? <ErrorText>{form.formState.errors.name.message}</ErrorText> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="col-slug">Slug</Label>
                  <Input id="col-slug" placeholder="noir-drop-001" className="font-mono" {...form.register("slug")} />
                  {form.formState.errors.slug ? <ErrorText>{form.formState.errors.slug.message}</ErrorText> : null}
                </div>
              </div>

              <ImageInput label="Banner / cover image" aspect="wide" value={form.watch("bannerUrl")} onChange={(url) => form.setValue("bannerUrl", url)} />

              <div className="space-y-2">
                <Label htmlFor="col-desc">Description</Label>
                <Textarea id="col-desc" rows={3} {...form.register("description")} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="col-order">Sort order</Label>
                  <Input id="col-order" type="number" {...form.register("sortOrder")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="col-badge">Badge</Label>
                  <Input id="col-badge" placeholder="New drop" {...form.register("badge")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="col-meta-title">Meta title</Label>
                  <Input id="col-meta-title" {...form.register("metaTitle")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="col-meta-desc">Meta description</Label>
                  <Input id="col-meta-desc" {...form.register("metaDescription")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className={cn("flex items-center justify-between border border-line px-3 py-2.5 text-sm")}>
                  <span className="text-muted">Active</span>
                  <input type="checkbox" className="accent-ink" {...form.register("isActive")} />
                </label>
                <label className="flex items-center justify-between border border-line px-3 py-2.5 text-sm">
                  <span className="text-muted">Featured</span>
                  <input type="checkbox" className="accent-ink" {...form.register("isFeatured")} />
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1" disabled={busy}>
                  {busy ? <Loader2 className="mr-1 size-4 animate-spin" /> : null}
                  {busy ? "Saving…" : editing ? "Save changes" : "Create collection"}
                </Button>
                <Button type="button" variant="outline" onClick={() => (setCreating(false), setEditing(null))}>
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
