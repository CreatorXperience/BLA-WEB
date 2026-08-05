"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import { useAdminOrder, useAdminOrderMutations } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageHeader, StatusBadge } from "@/features/admin/shared";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

const STATUSES: OrderStatus[] = ["PENDING", "PAID", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export function OrderDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const router = useRouter();
  const { data: order, isLoading, isError } = useAdminOrder(id);
  const mutations = useAdminOrderMutations();

  const [status, setStatus] = useState<OrderStatus>(order?.status ?? "PENDING");
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber ?? "");
  const [courier, setCourier] = useState(order?.courier ?? "");
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [updating, setUpdating] = useState(false);

  if (isLoading || !order) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-red-600">Could not load order.</p>;
  }

  const onUpdateStatus = async () => {
    setUpdating(true);
    try {
      await mutations.updateStatus.mutateAsync({
        id,
        input: {
          status,
          reason: status === "CANCELLED" ? reason : undefined,
          trackingNumber: trackingNumber || undefined,
          courier: courier || undefined,
          notifyCustomer: true,
        },
      });
      toast.success(`Order marked ${status.toLowerCase()}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update status");
    } finally {
      setUpdating(false);
    }
  };

  const onAddNote = async () => {
    if (!note.trim()) return;
    try {
      await mutations.addNote.mutateAsync({ id, note: note.trim() });
      setNote("");
      toast.success("Note added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add note");
    }
  };

  const shipTo = order.shippingAddress;

  return (
    <div>
      <AdminPageHeader
        title={`#${order.orderNumber}`}
        eyebrow={`Placed ${new Date(order.placedAt).toLocaleString()}`}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/orders")}>
            <ArrowLeft className="mr-1 size-3.5" /> Back
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={order.status} />
        {order.isGuest ? <span className="text-xs uppercase tracking-wider text-muted">Guest</span> : null}
        <span className="text-sm text-muted">
          {order.user ? `${order.user.firstName ?? ""} ${order.user.lastName ?? ""}`.trim() : "No account"}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="border border-line bg-paper">
            <div className="border-b border-line px-6 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">Items</h2>
            </div>
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-line">
                {order.items.map((it) => (
                  <tr key={it.id}>
                    <td className="px-6 py-3">
                      {it.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.imageUrl} alt="" className="size-12 border border-line bg-mist object-cover" />
                      ) : (
                        <div className="size-12 border border-line bg-mist" />
                      )}
                    </td>
                    <td className="px-2 py-3">
                      <p className="font-medium text-ink">{it.productName}</p>
                      <p className="text-xs text-muted">
                        {[it.sku, it.color, it.size].filter(Boolean).join(" · ") || "—"} × {it.quantity}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-ink">{formatPrice(Number(it.totalPrice), order.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="space-y-1.5 border-t border-line px-6 py-4 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>{formatPrice(Number(order.subtotal), order.currency)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span>{formatPrice(Number(order.shippingTotal), order.currency)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Tax</span>
                <span>{formatPrice(Number(order.taxTotal), order.currency)}</span>
              </div>
              {Number(order.discountTotal) > 0 ? (
                <div className="flex justify-between text-muted">
                  <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                  <span>-{formatPrice(Number(order.discountTotal), order.currency)}</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-line pt-2 text-base font-semibold text-ink">
                <span>Total</span>
                <span>{formatPrice(Number(order.grandTotal), order.currency)}</span>
              </div>
            </div>
          </section>

          {order.customerNote ? (
            <section className="border border-line bg-paper p-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-ink">Customer note</h2>
              <p className="text-sm text-muted">{order.customerNote}</p>
            </section>
          ) : null}

          {order.adminNote ? (
            <section className="border border-line bg-paper p-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-ink">Admin note</h2>
              <p className="text-sm text-muted">{order.adminNote}</p>
            </section>
          ) : null}

          <section className="border border-line bg-paper p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-ink">Timeline</h2>
            {order.timeline && order.timeline.length > 0 ? (
              <ol className="space-y-3">
                {order.timeline.map((entry) => (
                  <li key={entry.id} className="flex gap-3 text-sm">
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-ink" />
                    <div>
                      <p className="font-medium text-ink">{entry.status.replace("_", " ").toLowerCase()}</p>
                      {entry.note ? <p className="text-muted">{entry.note}</p> : null}
                      <p className="text-xs text-economy">{new Date(entry.createdAt).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted">No timeline entries.</p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-line bg-paper p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-ink">Customer</h2>
            <div className="space-y-2 text-sm text-muted">
              <p className="flex items-center gap-2">
                <Mail className="size-3.5" /> {order.email}
              </p>
              {order.phone ? (
                <p className="flex items-center gap-2">
                  <Phone className="size-3.5" /> {order.phone}
                </p>
              ) : null}
              {shipTo ? (
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-3.5" />
                  <span>
                    {shipTo.line1} {shipTo.line2}
                    <br />
                    {shipTo.city}, {shipTo.state} {shipTo.postalCode}
                    <br />
                    {shipTo.country}
                  </span>
                </p>
              ) : null}
            </div>
          </section>

          <section className="border border-line bg-paper p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-ink">Payments</h2>
            {order.payments && order.payments.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {order.payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between border border-line px-3 py-2">
                    <div>
                      <p className="font-medium text-ink">{p.provider ?? "payment"}</p>
                      <p className="text-xs text-muted">{p.reference}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatPrice(Number(p.amount ?? 0), order.currency)}</p>
                      <StatusBadge status={p.status ?? "UNKNOWN"} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No payments recorded.</p>
            )}
          </section>

          <section className="border border-line bg-paper p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-ink">Update status</h2>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="o-status">Status</Label>
                <select
                  id="o-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="w-full border border-line bg-paper px-3 py-2 text-sm focus:border-ink focus:outline-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="o-tracking">Tracking #</Label>
                  <Input id="o-tracking" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="o-courier">Courier</Label>
                  <Input id="o-courier" value={courier} onChange={(e) => setCourier(e.target.value)} />
                </div>
              </div>
              {status === "CANCELLED" ? (
                <div className="space-y-2">
                  <Label htmlFor="o-reason">Reason</Label>
                  <Input id="o-reason" value={reason} onChange={(e) => setReason(e.target.value)} />
                </div>
              ) : null}
              <Button className="w-full" onClick={onUpdateStatus} disabled={updating}>
                {updating ? "Saving…" : `Mark ${status.toLowerCase()}`}
              </Button>
            </div>
          </section>

          <section className="border border-line bg-paper p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-ink">Add note</h2>
            <div className="space-y-3">
              <Textarea rows={3} placeholder="Internal note…" value={note} onChange={(e) => setNote(e.target.value)} />
              <Button variant="outline" className="w-full" onClick={onAddNote} disabled={!note.trim()}>
                Add note
              </Button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
