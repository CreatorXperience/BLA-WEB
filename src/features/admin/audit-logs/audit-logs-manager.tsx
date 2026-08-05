"use client";

import { useState } from "react";
import { useAdminAuditLogs } from "@/hooks/use-admin";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageHeader } from "@/features/admin/shared";
import type { AuditLogEntry } from "@/types/admin";

export function AuditLogsManager() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminAuditLogs({ page, perPage: 20 });

  return (
    <div>
      <AdminPageHeader title="Audit logs" />
      <div className="overflow-x-auto border border-line bg-paper">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : !data || data.data.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">No audit logs yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted">
              <tr className="border-b border-line">
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Entity</th>
                <th className="px-4 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.data.map((log: AuditLogEntry) => (
                <tr key={log.id} className="hover:bg-mist/40">
                  <td className="px-4 py-3 text-xs text-muted">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{log.actor?.email ?? "system"}</td>
                  <td className="px-4 py-3">
                    <span className="border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wider">{log.action}</span>
                  </td>
                  <td className="px-4 py-3">
                    {log.entity}
                    {log.entityId ? <span className="ml-1 text-xs text-muted">#{log.entityId.slice(0, 8)}</span> : null}
                  </td>
                  <td className="px-4 py-3">
                    <span className="block max-w-[320px] truncate font-mono text-xs text-muted">{JSON.stringify(log.metadata ?? {})}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="mt-4">
        {data && data.total > 20 ? <Pagination page={page} total={data.total} perPage={20} onChange={setPage} /> : null}
      </div>
    </div>
  );
}
