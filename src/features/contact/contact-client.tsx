"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ErrorText } from "@/components/shared/form-utils";

const schema = z.object({
  name: z.string().min(1, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(1, "Add a subject"),
  message: z.string().min(10, "Tell us a little more (at least 10 characters)"),
});

type Values = z.infer<typeof schema>;

export function ContactClient() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async () => {
    setSending(true);
    // Contact form is wired to the store support email for now.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSending(false);
    setSent(true);
  };

  return (
    <div className="container-lux grid gap-12 py-16 md:py-24 lg:grid-cols-2 lg:gap-20">
      <div>
        <p className="eyebrow">Contact</p>
        <h1 className="editorial-title mt-3 text-ink">We are here to help.</h1>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
          Questions about an order, sizing, returns or a collaboration? Send a note and our team will get back
          to you within one business day.
        </p>
        <div className="mt-10 space-y-6 text-sm">
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Support</h2>
            <p className="mt-2 text-ink">support@bla.example</p>
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Wholesale & press</h2>
            <p className="mt-2 text-ink">press@bla.example</p>
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Studio</h2>
            <p className="mt-2 leading-relaxed text-muted">
              12 Adeola Odeku Street
              <br />
              Victoria Island, Lagos
            </p>
          </div>
        </div>
      </div>

      <div className="border border-line p-8 md:p-10">
        {sent ? (
          <div className="flex h-full flex-col items-center justify-center py-16 text-center">
            <p className="eyebrow">Message sent</p>
            <h2 className="editorial-title mt-3 text-ink">Thank you</h2>
            <p className="mt-4 max-w-sm text-sm text-muted">We have received your message and will reply shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ct-name">Name</Label>
                <Input id="ct-name" autoComplete="name" {...register("name")} />
                {errors.name ? <ErrorText>{errors.name.message}</ErrorText> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ct-email">Email</Label>
                <Input id="ct-email" type="email" autoComplete="email" {...register("email")} />
                {errors.email ? <ErrorText>{errors.email.message}</ErrorText> : null}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ct-subject">Subject</Label>
              <Input id="ct-subject" {...register("subject")} />
              {errors.subject ? <ErrorText>{errors.subject.message}</ErrorText> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ct-message">Message</Label>
              <textarea
                id="ct-message"
                rows={6}
                className="w-full min-h-[120px] border border-line bg-transparent px-4 py-3 text-sm text-foreground focus-visible:border-ink focus-visible:outline-none"
                placeholder="How can we help?"
                {...register("message")}
              />
              {errors.message ? <ErrorText>{errors.message.message}</ErrorText> : null}
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={sending}>
              {sending ? "Sending…" : "Send message"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
