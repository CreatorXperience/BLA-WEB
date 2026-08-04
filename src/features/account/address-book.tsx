"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useAddresses, useCreateAddress, useDeleteAddress, useUpdateAddress } from "@/hooks/use-account";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ErrorText } from "@/components/shared/form-utils";
import type { Address, AddressInput } from "@/types/address";

const schema = z.object({
  label: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  line1: z.string().min(1, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().optional(),
  country: z.string().min(1, "Country is required"),
});

type Values = z.infer<typeof schema>;

const defaultValues: Values = {
  firstName: "",
  lastName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Nigeria",
};

export function AddressBook() {
  const { data: addresses, isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  const [editing, setEditing] = useState<Address | null>(null);
  const [open, setOpen] = useState(false);

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues });

  const startEdit = (address: Address) => {
    setEditing(address);
    form.reset({
      label: address.label ?? "",
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone ?? "",
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode ?? "",
      country: address.country,
    });
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditing(null);
    form.reset(defaultValues);
  };

  const onSubmit = async (values: Values) => {
    const input: AddressInput = {
      label: values.label || undefined,
      type: "SHIPPING",
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone || undefined,
      line1: values.line1,
      line2: values.line2 || undefined,
      city: values.city,
      state: values.state,
      postalCode: values.postalCode || undefined,
      country: values.country,
    };
    try {
      if (editing) {
        await updateAddress.mutateAsync({ id: editing.id, input });
        toast.success("Address updated");
      } else {
        await createAddress.mutateAsync(input);
        toast.success("Address added");
      }
      close();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save address");
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("Remove this address?")) return;
    try {
      await deleteAddress.mutateAsync(id);
      toast.success("Address removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove address");
    }
  };

  return (
    <div>
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Addresses</p>
          <h2 className="editorial-title mt-2 text-ink">Address book</h2>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); form.reset(defaultValues); setOpen(true); }}>
          <Plus className="size-4" /> Add address
        </Button>
      </header>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : !addresses || addresses.length === 0 ? (
        <div className="border border-line p-14 text-center">
          <MapPin className="mx-auto size-8 text-line" />
          <p className="mt-4 text-sm text-muted">No saved addresses yet.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <li key={address.id} className="border border-line p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {address.label ?? "Address"}
                    {address.isDefault ? <span className="ml-2 text-[10px] uppercase tracking-[0.16em] text-muted">Default</span> : null}
                  </p>
                  <address className="mt-3 text-sm not-italic leading-relaxed text-muted">
                    <p>
                      {address.firstName} {address.lastName}
                    </p>
                    <p>{address.line1}</p>
                    {address.line2 ? <p>{address.line2}</p> : null}
                    <p>
                      {address.city}, {address.state} {address.postalCode ?? ""}
                    </p>
                    <p>{address.country}</p>
                    {address.phone ? <p className="pt-1">{address.phone}</p> : null}
                  </address>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(address)} className="p-2 text-muted hover:text-ink" aria-label="Edit address">
                    <Pencil className="size-4" />
                  </button>
                  <button onClick={() => void onDelete(address.id)} className="p-2 text-muted hover:text-ink" aria-label="Delete address">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Form */}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 sm:items-center" onClick={close}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto bg-background p-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg text-ink">{editing ? "Edit address" : "Add address"}</h3>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="addr-first">First name</Label>
                  <Input id="addr-first" {...form.register("firstName")} />
                  {form.formState.errors.firstName ? <ErrorText>{form.formState.errors.firstName.message}</ErrorText> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addr-last">Last name</Label>
                  <Input id="addr-last" {...form.register("lastName")} />
                  {form.formState.errors.lastName ? <ErrorText>{form.formState.errors.lastName.message}</ErrorText> : null}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="addr-line1">Address</Label>
                <Input id="addr-line1" placeholder="Street address" {...form.register("line1")} />
                {form.formState.errors.line1 ? <ErrorText>{form.formState.errors.line1.message}</ErrorText> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="addr-line2">Apartment, suite (optional)</Label>
                <Input id="addr-line2" {...form.register("line2")} />
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="addr-city">City</Label>
                  <Input id="addr-city" {...form.register("city")} />
                  {form.formState.errors.city ? <ErrorText>{form.formState.errors.city.message}</ErrorText> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addr-state">State</Label>
                  <Input id="addr-state" {...form.register("state")} />
                  {form.formState.errors.state ? <ErrorText>{form.formState.errors.state.message}</ErrorText> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addr-postal">Postal code</Label>
                  <Input id="addr-postal" {...form.register("postalCode")} />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="addr-country">Country</Label>
                  <Input id="addr-country" {...form.register("country")} />
                  {form.formState.errors.country ? <ErrorText>{form.formState.errors.country.message}</ErrorText> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addr-phone">Phone</Label>
                  <Input id="addr-phone" type="tel" {...form.register("phone")} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAddress.isPending || updateAddress.isPending}>
                  {editing ? "Save changes" : "Add address"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
