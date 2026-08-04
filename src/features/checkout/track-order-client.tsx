"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { PackageSearch } from "lucide-react";
import { ordersService } from "@/services/account";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ErrorText } from "@/components/shared/form-utils";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types/order";

const schema = z.object({
  orderNumber: z.string().min(3, "Enter your order number"),
});

type Values = z.infer<typeof schema>;

export function TrackOrderClient() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    setLoading(true);
    setOrder(null);
    try {
      const result = await ordersService.track(values.orderNumber);
      setOrder(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "We could not find that order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-lux py-16 md:py-24">
      <div className="mx-auto max-w-xl text-center">
        <PackageSearch className="mx-auto size-10 text-line" />
        <p className="eyebrow mt-6">Order tracking</p>
        <h1 className="editorial-title mt-3 text-ink">Track your order</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Enter the order number from your confirmation email to see its status.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-4 text-left" noValidate>
          <div className="space-y-2">
            <Label htmlFor="track-number">Order number</Label>
            <Input id="track-number" placeholder="e.g. ATE-10293" {...register("orderNumber")} />
            {errors.orderNumber ? <ErrorText>{errors.orderNumber.message}</ErrorText> : null}
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Looking up…" : "Track order"}
          </Button>
        </form>

        {order ? (
          <div className="mt-10 border border-line p-8 text-left">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink">{order.orderNumber}</p>
              <span className="text-xs uppercase tracking-[0.16em] text-muted">{order.status}</span>
            </div>
            <p className="mt-2 text-xs text-muted">
              Placed {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <dl className="mt-6 flex justify-between text-sm">
              <dt className="text-muted">Total</dt>
              <dd className="text-ink">{formatPrice(order.total, order.currency)}</dd>
            </dl>
            {order.trackingNumber ? (
              <p className="mt-3 text-xs text-muted">
                Tracking number <span className="text-ink">{order.trackingNumber}</span>
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
