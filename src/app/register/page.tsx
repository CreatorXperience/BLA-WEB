import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthLayout } from "@/components/shared/auth-layout";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a BLA account.",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      eyebrow="Join the house"
      title="Create account"
      subtitle="Save your details, track orders and unlock members-only drops."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-ink underline-offset-2 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
}
