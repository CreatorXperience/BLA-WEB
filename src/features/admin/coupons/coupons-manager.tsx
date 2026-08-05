"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useAdminCoupons, useAdminCouponMutations } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorText } from "@/components/shared/form-utils";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageHeader, StatusBadge } from "@/features/admin/shared";
import { formatPrice } from "@/lib/utils";
import type { Coupon } from "@/types/admin";

const schema = z.object({
  code: z.string().min(1, "Code is required").max(50),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  value: z.coerce.number().positive("Value must be positive"),
  minPurchaseAmount: z.coerce.number().positive().optional(),
  maxDiscountAmount: z.coerce.number().positive().optional(),
  usageLimit: z.coerce.number().int().min(1).optional(),
  perUserLimit: z.coerce.number().int().min(1).default(1),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
});

type Values = z.infer<typeof schema>;

const defaultValues: Values = {
  code: "",
  type: "PERCENTAGE",
  value: 0,
  minPurchaseAmount: undefined,
  maxDiscountAmount: undefined,
  usageLimit: undefined,
  perUserLimit: 1,
  expiresAt: "",
  isActive: true,
};

export function CouponsManager() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading, isError, error } = useAdminCoupons({ page, perPage: 20, q: debouncedQ || undefined });
  const mutations = useAdminCouponMutations();
  const form = useForm<z.input<typeof schema>, unknown, Values>({ resolver: zodResolver(schema), defaultValues });

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const openCreate = () => {
    setEditing(null);
    form.reset(defaultValues);
    setShowForm(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditing(coupon);
    form.reset({
      code: coupon.code,
      type: coupon.type as Values["type"],
      value: Number(coupon.value),
      minPurchaseAmount: coupon.minPurchaseAmount ? Number(coupon.minPurchaseAmount) : undefined,
      maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : undefined,
      usageLimit: coupon.usageLimit ?? undefined,
      perUserLimit: coupon.perUserLimit,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 16) : "",
      isActive: coupon.isActive,
    });
    setShowForm(true);
  };

  const onSubmit = async (values: Values) => {
    try {
      const input = {
        code: values.code.toUpperCase(),
        type: values.type,
        value: Number(values.value),
        minPurchaseAmount: values.minPurchaseAmount ? Number(values.minPurchaseAmount) : undefined,
        maxDiscountAmount: values.maxDiscountAmount ? Number(values.maxDiscountAmount) : undefined,
        usageLimit: values.usageLimit,
        perUserLimit: values.perUserLimit,
        expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : null,
        isActive: values.isActive,
      };
      if (editing) {
        await mutations.update.mutateAsync({ id: editing.id, input });
        toast.success("Coupon updated");
      } else {
        await mutations.create.mutateAsync(input);
        toast.success("Coupon created");
      }
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save coupon");
    }
  };

  const onRemove = async (coupon: Coupon) => {
    if (!confirm(`Delete coupon ${coupon.code}?`)) return;
    try {
      await mutations.remove.mutateAsync(coupon.id);
      toast.success("Coupon deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete coupon");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Coupons"
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1 size-4" /> New coupon
          </Button>
        }
      />

      <div className="mb-4 relative sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input className="pl-9" placeholder="Search by code…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="overflow-x-auto border border-line bg-paper">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : isError ? (
          <p className="p-6 text-sm text-red-600">{error instanceof Error ? error.message : "Could not load coupons."}</p>
        ) : !data || data.items.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">No coupons found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted">
              <tr className="border-b border-line">
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Min purchase</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.items.map((c) => (
                <tr key={c.id} className="hover:bg-mist/40">
                  <td className="px-4 py-3 font-mono font-medium text-ink">{c.code}</td>
                  <td className="px-4 py-3 text-muted">{c.type.toLowerCase()}</td>
                  <td className="px-4 py-3">
                    {c.type === "PERCENTAGE" ? `${c.value}%` : formatPrice(Number(c.value))}
                    {c.maxDiscountAmount ? <span className="ml-1 text-xs text-economy">cap {formatPrice(Number(c.maxDiscountAmount))}</span> : null}
                  </td>
                  <td className="px-4 py-3 text-muted">{c.minPurchaseAmount ? formatPrice(Number(c.minPurchaseAmount)) : "—"}</td>
                  <td className="px-4 py-3 text-muted">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.isActive ? "ACTIVE" : "INACTIVE"} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="iconSm" onClick={() => openEdit(c)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="iconSm" className="text-red-600" onClick={() => void onRemove(c)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4">
        {data && data.total > 20 ? <Pagination page={page} total={data.total} perPage={20} onChange={setPage} /> : null}
      </div>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={() => setShowForm(false)}>
          <form
            className="max-h-[90vh] w-full max-w-md overflow-y-auto border border-line bg-paper p-6"
            onClick={(e) => e.stopPropagation()}
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <h2 className="mb-4 text-lg font-semibold text-ink">{editing ? `Edit ${editing.code}` : "New coupon"}</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="c-code">Code</Label>
                <Input id="c-code" placeholder="WELCOME10" className="uppercase" {...form.register("code")} />
                {form.formState.errors.code ? <ErrorText>{form.formState.errors.code.message}</ErrorText> : null}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="c-type">Type</Label>
                  <select id="c-type" className="w-full border border-line bg-paper px-3 py-2 text-sm focus:border-ink focus:outline-none" {...form.register("type")}>
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED_AMOUNT">Fixed amount</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-value">Value</Label>
                  <Input id="c-value" type="number" step="0.01" {...form.register("value")} />
                  {form.formState.errors.value ? <ErrorText>{form.formState.errors.value.message}</ErrorText> : null}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="c-min">Min purchase</Label>
                  <Input id="c-min" type="number" step="0.01" placeholder="Optional" {...form.register("minPurchaseAmount")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-max">Max discount</Label>
                  <Input id="c-max" type="number" step="0.01" placeholder="Optional" {...form.register("maxDiscountAmount")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="c-limit">Usage limit</Label>
                  <Input id="c-limit" type="number" placeholder="Unlimited" {...form.register("usageLimit")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-expires">Expires</Label>
                  <Input id="c-expires" type="datetime-local" {...form.register("expiresAt")} />
                </div>
              </div>
              <label className="flex items-center justify-between border border-line px-3 py-2.5 text-sm">
                <span className="text-muted">Active</span>
                <input type="checkbox" className="accent-ink" {...form.register("isActive")} />
              </label>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">
                  {editing ? "Save changes" : "Create coupon"}
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
