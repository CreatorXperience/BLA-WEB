import { RequireAdmin } from "@/components/shared/require-admin";
import { AdminLayout } from "@/features/admin/admin-layout";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdmin>
      <AdminLayout>{children}</AdminLayout>
    </RequireAdmin>
  );
}
