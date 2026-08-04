import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthLayout } from "@/components/shared/auth-layout";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your BLA account.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      eyebrow="Members"
      title="Welcome back"
      subtitle="Sign in to view orders, manage addresses and check out faster."
      footer={
        <>
          New to BLA?{" "}
          <Link href="/register" className="font-medium text-ink underline-offset-2 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
