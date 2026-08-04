import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout } from "@/components/shared/auth-layout";
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Reset your BLA account password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      eyebrow="Recovery"
      title="Forgot password"
      subtitle="Enter the email associated with your account and we will send a reset link."
      footer={
        <Link href="/login" className="font-medium text-ink underline-offset-2 hover:underline">
          Back to sign in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
