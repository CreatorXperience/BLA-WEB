"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ErrorText } from "@/components/shared/form-utils";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type Values = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    try {
      await authService.forgotPassword(values.email);
      setSent(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not send reset email";
      toast.error(msg);
    }
  };

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm leading-relaxed text-muted">
          If an account exists for that email, we have sent a link to reset your password. Check your inbox.
        </p>
        <Button variant="outline" size="lg" asChild className="w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="fp-email">Email</Label>
        <Input id="fp-email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
        {errors.email ? <ErrorText>{errors.email.message}</ErrorText> : null}
      </div>
      <Button type="submit" size="lg" className="w-full">
        Send reset link
      </Button>
    </form>
  );
}
