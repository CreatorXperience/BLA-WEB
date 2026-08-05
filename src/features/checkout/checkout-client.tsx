"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Lock, MapPin, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { checkoutService, paymentsService } from "@/services/checkout";
import { addressesService } from "@/services/account";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ErrorText } from "@/components/shared/form-utils";
import { formatPrice } from "@/lib/utils";
import { productImageUrl } from "@/constants/imagery";
import { countryToCode } from "@/lib/countries";
import type { Address } from "@/types/address";
import type { CheckoutPayload, PaymentProvider, ShippingOption } from "@/types/checkout";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  line1: z.string().min(1, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  shippingMethodId: z.string().min(1, "Select a shipping method"),
  note: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export function CheckoutClient() {
  const router = useRouter();
  const cart = useCartStore((s) => s.cart);
  const clearCart = useCartStore((s) => s.clear);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[] | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>("paystack");
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>();

  const { data: savedAddresses } = useQuery({
    queryKey: ["me", "addresses"],
    queryFn: addressesService.list,
    enabled: Boolean(user),
    retry: 1,
  });

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: user?.email ?? "",
      country: "Nigeria",
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
    },
  });

  const country = form.watch("country");
  const shippingMethodId = form.watch("shippingMethodId");

  useEffect(() => {
    if (country) {
      setLoadingOptions(true);
      setShippingOptions(null);
      checkoutService
        .shippingOptions(country)
        .then((options) => {
          setShippingOptions(options);
          const preferred = options.find((o) => !o.isPickup) ?? options[0];
          if (preferred) form.setValue("shippingMethodId", preferred.id);
        })
        .catch(() => setShippingOptions([]))
        .finally(() => setLoadingOptions(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  const applyAddress = (address: Address) => {
    setSelectedAddressId(address.id);
    form.setValue("firstName", address.firstName);
    form.setValue("lastName", address.lastName);
    form.setValue("phone", address.phone ?? "");
    form.setValue("line1", address.line1);
    form.setValue("line2", address.line2 ?? "");
    form.setValue("city", address.city);
    form.setValue("state", address.state);
    form.setValue("postalCode", address.postalCode ?? "");
    form.setValue("country", address.country === "NG" ? "Nigeria" : address.country);
  };

  const buildPayload = (values: Values): CheckoutPayload | null => {
    if (!cart || cart.items.length === 0) return null;
    return {
      shippingAddress: {
        addressId: selectedAddressId,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone?.trim() || undefined,
        line1: values.line1,
        line2: values.line2?.trim() || undefined,
        city: values.city,
        state: values.state,
        postalCode: values.postalCode?.trim() || undefined,
        country: countryToCode(values.country),
      },
      email: values.email,
      shippingMethodId: values.shippingMethodId,
      customerNote: values.note,
    };
  };

  const onSubmit = async (values: Values) => {
    const payload = buildPayload(values);
    if (!payload) return;
    setPlacing(true);
    try {
      const placed = await checkoutService.placeOrder(payload);
      const orderId = placed.order.id;
      clearCart();
      try {
        const init = await paymentsService.initialize(orderId, paymentProvider);
        if (init.authorizationUrl) {
          window.location.href = init.authorizationUrl;
          return;
        }
      } catch {
        // fall through to confirmation page
      }
      router.replace(`/checkout/success?order=${placed.order.orderNumber}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container-lux flex min-h-[50vh] flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="eyebrow">Checkout</p>
        <h1 className="editorial-title mt-2 text-ink">Your bag is empty</h1>
        <Button variant="outline" size="sm" asChild className="mt-2">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  if (hydrated && !isAuthenticated) {
    return (
      <div className="container-lux flex min-h-[50vh] flex-col items-center justify-center gap-5 py-20 text-center">
        <p className="eyebrow">Sign in to continue</p>
        <h1 className="editorial-title mt-2 max-w-md text-ink">Your bag is ready</h1>
        <p className="max-w-md text-muted">
          Create an account or sign in to place your order. Your bag is saved and will be right here
          when you come back.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/login?redirect=/checkout">Sign in</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/register?redirect=/checkout">Create an account</Link>
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = cart.subtotal ?? cart.items.reduce((sum, i) => sum + (i.unitPrice ?? i.price ?? 0) * i.quantity, 0);

  return (
    <div className="container-lux py-12 md:py-16">
      <header className="border-b border-line pb-8">
        <p className="eyebrow">Checkout</p>
        <h1 className="editorial-title mt-3 text-ink">Secure checkout</h1>
        <p className="mt-3 flex items-center gap-2 text-sm text-muted">
          <Lock className="size-3.5" /> Payments are encrypted and processed securely.
        </p>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_400px]">
        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10" noValidate>
          <section>
            <h2 className="text-sm uppercase tracking-[0.2em] text-muted">Contact</h2>
            <div className="mt-4 space-y-2">
              <Label htmlFor="co-email">Email</Label>
              <Input id="co-email" type="email" autoComplete="email" placeholder="you@example.com" {...form.register("email")} />
              {form.formState.errors.email ? <ErrorText>{form.formState.errors.email.message}</ErrorText> : null}
            </div>
          </section>

          {user && savedAddresses && savedAddresses.length > 0 ? (
            <section>
              <h2 className="text-sm uppercase tracking-[0.2em] text-muted">Saved addresses</h2>
              <div className="mt-4 space-y-3">
                {savedAddresses.map((address) => (
                  <label
                    key={address.id}
                    className={`flex cursor-pointer items-start gap-4 border p-5 transition-colors ${
                      selectedAddressId === address.id ? "border-ink" : "border-line hover:border-ink/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="saved-address"
                      className="mt-1 size-4 accent-ink"
                      checked={selectedAddressId === address.id}
                      onChange={() => applyAddress(address)}
                    />
                    <div className="text-sm">
                      <p className="text-ink">
                        {address.label ? <span className="mr-2 text-xs uppercase tracking-wider text-muted">{address.label}</span> : null}
                        {address.firstName} {address.lastName}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {[address.line1, address.line2, address.city, address.state, address.postalCode, address.country]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </label>
                ))}
                <p className="flex items-center gap-2 text-xs text-muted">
                  <MapPin className="size-3.5" /> Select an address to reuse it, or enter a new one below.
                </p>
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="text-sm uppercase tracking-[0.2em] text-muted">Shipping address</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="co-first">First name</Label>
                <Input id="co-first" autoComplete="given-name" {...form.register("firstName")} />
                {form.formState.errors.firstName ? <ErrorText>{form.formState.errors.firstName.message}</ErrorText> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="co-last">Last name</Label>
                <Input id="co-last" autoComplete="family-name" {...form.register("lastName")} />
                {form.formState.errors.lastName ? <ErrorText>{form.formState.errors.lastName.message}</ErrorText> : null}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="co-address">Address</Label>
                <Input id="co-address" autoComplete="street-address" placeholder="Street address" {...form.register("line1")} />
                {form.formState.errors.line1 ? <ErrorText>{form.formState.errors.line1.message}</ErrorText> : null}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="co-address2">Apartment, suite (optional)</Label>
                <Input id="co-address2" {...form.register("line2")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="co-city">City</Label>
                <Input id="co-city" autoComplete="address-level2" {...form.register("city")} />
                {form.formState.errors.city ? <ErrorText>{form.formState.errors.city.message}</ErrorText> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="co-state">State</Label>
                <Input id="co-state" autoComplete="address-level1" {...form.register("state")} />
                {form.formState.errors.state ? <ErrorText>{form.formState.errors.state.message}</ErrorText> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="co-postal">Postal code</Label>
                <Input id="co-postal" autoComplete="postal-code" {...form.register("postalCode")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="co-country">Country</Label>
                <Input id="co-country" autoComplete="country-name" defaultValue="Nigeria" {...form.register("country")} />
                {form.formState.errors.country ? <ErrorText>{form.formState.errors.country.message}</ErrorText> : null}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="co-phone">Phone</Label>
                <Input id="co-phone" type="tel" autoComplete="tel" {...form.register("phone")} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm uppercase tracking-[0.2em] text-muted">Delivery method</h2>
            {loadingOptions ? (
              <p className="mt-4 text-sm text-muted">Loading shipping options…</p>
            ) : shippingOptions && shippingOptions.length > 0 ? (
              <div className="mt-4 space-y-3">
                {shippingOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-center justify-between gap-4 border p-5 transition-colors ${
                      shippingMethodId === option.id ? "border-ink" : "border-line hover:border-ink/40"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        className="size-4 accent-ink"
                        checked={shippingMethodId === option.id}
                        onChange={() => form.setValue("shippingMethodId", option.id)}
                      />
                      <div>
                        <p className="text-sm text-ink">{option.name}</p>
                        {option.estimatedDaysMin ? (
                          <p className="mt-0.5 text-xs text-muted">
                            {option.estimatedDaysMin}–{option.estimatedDaysMax ?? option.estimatedDaysMin} business days
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <p className="text-sm text-ink">
                      {option.freeAbove && subtotal >= option.freeAbove ? "Free" : formatPrice(option.baseRate, cart.currency)}
                    </p>
                  </label>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">We could not load shipping options for this country.</p>
            )}
            {form.formState.errors.shippingMethodId ? <ErrorText>{form.formState.errors.shippingMethodId.message}</ErrorText> : null}
          </section>

          <section>
            <h2 className="text-sm uppercase tracking-[0.2em] text-muted">Payment method</h2>
            <div className="mt-4 space-y-3">
              {(["paystack", "flutterwave"] as PaymentProvider[]).map((provider) => (
                <label
                  key={provider}
                  className={`flex cursor-pointer items-center gap-4 border p-5 transition-colors ${
                    paymentProvider === provider ? "border-ink" : "border-line hover:border-ink/40"
                  }`}
                >
                  <input
                    type="radio"
                    className="size-4 accent-ink"
                    checked={paymentProvider === provider}
                    onChange={() => setPaymentProvider(provider)}
                  />
                  <span className="text-sm capitalize text-ink">{provider}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm uppercase tracking-[0.2em] text-muted">Order note (optional)</h2>
            <textarea
              className="mt-4 w-full min-h-[90px] border border-line bg-transparent px-4 py-3 text-sm text-foreground focus-visible:border-ink focus-visible:outline-none"
              placeholder="Gift message, delivery instructions…"
              {...form.register("note")}
            />
          </section>
        </form>

        {/* Summary */}
        <aside>
          <div className="lg:sticky lg:top-28">
            <h2 className="text-sm uppercase tracking-[0.2em] text-muted">Order summary</h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {cart.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4">
                  <div className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden bg-mist">
                    {item.image ?? item.product?.imageUrl ? (
                      <Image src={productImageUrl(item.image ?? item.product?.imageUrl ?? "")} alt={item.name ?? "Product"} fill sizes="56px" className="object-cover" />
                    ) : null}
                    <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center bg-ink text-[10px] text-background">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink">{item.name ?? item.product?.name}</p>
                    <p className="mt-0.5 text-xs text-muted">{[item.color, item.size].filter(Boolean).join(" · ")}</p>
                  </div>
                  <p className="text-sm text-ink">{formatPrice((item.unitPrice ?? item.price ?? 0) * item.quantity, cart.currency)}</p>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="text-ink">{formatPrice(subtotal, cart.currency)}</dd>
              </div>
              {cart.discount > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-muted">Discount{ cart.coupon ? ` (${cart.coupon.code})` : ""}</dt>
                  <dd className="text-ink">−{formatPrice(cart.discount, cart.currency)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className="text-ink">{cart.shippingRate != null && cart.shippingRate > 0 ? formatPrice(cart.shippingRate, cart.currency) : "Calculated at next step"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Tax</dt>
                <dd className="text-ink">{cart.tax != null && cart.tax > 0 ? formatPrice(cart.tax, cart.currency) : "Included"}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-4">
                <dt className="font-medium text-ink">Total</dt>
                <dd className="font-medium text-ink">{formatPrice(cart.total ?? subtotal, cart.currency)}</dd>
              </div>
            </dl>

            <Button
              size="lg"
              className="mt-8 w-full"
              onClick={() => void form.handleSubmit(onSubmit)()}
              disabled={placing || loadingOptions || !shippingMethodId}
            >
              {placing ? "Placing order…" : "Place order"}
            </Button>

            <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted">
              <ShieldCheck className="size-3.5" /> Secured by Paystack & Flutterwave
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
