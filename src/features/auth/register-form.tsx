"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ErrorText } from "@/components/shared/form-utils";

const schema = z
  .object({
    firstName: z.string().min(1, "Enter your first name"),
    lastName: z.string().min(1, "Enter your last name"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be at most 72 characters")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

type Values = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const registerUser = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    try {
      await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      });
      toast.success("Account created — welcome");
      router.replace("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not create account";
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="reg-first">First name</Label>
          <Input id="reg-first" autoComplete="given-name" {...register("firstName")} />
          {errors.firstName ? <ErrorText>{errors.firstName.message}</ErrorText> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-last">Last name</Label>
          <Input id="reg-last" autoComplete="family-name" {...register("lastName")} />
          {errors.lastName ? <ErrorText>{errors.lastName.message}</ErrorText> : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input id="reg-email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
        {errors.email ? <ErrorText>{errors.email.message}</ErrorText> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-password">Password</Label>
        <Input id="reg-password" type="password" autoComplete="new-password" {...register("password")} />
        {errors.password ? <ErrorText>{errors.password.message}</ErrorText> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-confirm">Confirm password</Label>
        <Input id="reg-confirm" type="password" autoComplete="new-password" {...register("confirm")} />
        {errors.confirm ? <ErrorText>{errors.confirm.message}</ErrorText> : null}
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-center text-xs text-muted">
        By creating an account you agree to our{" "}
        <Link href="/policies/terms" className="underline underline-offset-2">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/policies/privacy" className="underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
