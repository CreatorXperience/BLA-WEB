"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ErrorText } from "@/components/shared/form-utils";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

type Values = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    try {
      await login(values);
      toast.success("Welcome back");
      const user = useAuthStore.getState().user;
      const isAdmin = user ? ["ADMIN", "EDITOR", "MANAGER", "SUPER_ADMIN"].includes(user.role) : false;
      router.replace(isAdmin && redirect === "/" ? "/admin" : redirect);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not sign in";
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
        {errors.email ? <ErrorText>{errors.email.message}</ErrorText> : null}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
          <Link href="/forgot-password" className="text-xs text-muted underline-offset-2 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Input id="login-password" type="password" autoComplete="current-password" {...register("password")} />
        {errors.password ? <ErrorText>{errors.password.message}</ErrorText> : null}
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
