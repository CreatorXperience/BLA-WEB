import type { Metadata } from "next";
import { AuditLogsManager } from "@/features/admin/audit-logs/audit-logs-manager";

export const metadata: Metadata = { title: "Audit logs" };

export default function AdminAuditLogsPage() {
  return <AuditLogsManager />;
}
