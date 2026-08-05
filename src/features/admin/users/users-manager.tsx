"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { useAdminUsers, useAdminUserMutations } from "@/hooks/use-admin";
import { useAuthStore } from "@/store/auth-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageHeader, StatusBadge } from "@/features/admin/shared";
import type { Role } from "@/types/admin";

const ROLES = ["CUSTOMER", "EDITOR", "MANAGER", "ADMIN", "SUPER_ADMIN"];

export function UsersManager() {
  const currentUser = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState<Role | "">("");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const { data, isLoading, isError, error } = useAdminUsers({ page, perPage: 20, role: role || undefined, q: debouncedQ || undefined });
  const mutations = useAdminUserMutations();

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const changeRole = async (id: string, nextRole: Role) => {
    if (id === currentUser?.id && nextRole !== currentUser.role) {
      toast.error("You cannot change your own role");
      return;
    }
    try {
      await mutations.updateRole.mutateAsync({ id, role: nextRole });
      toast.success("Role updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update role");
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    if (id === currentUser?.id) {
      toast.error("You cannot suspend your own account");
      return;
    }
    try {
      await mutations.updateStatus.mutateAsync({ id, isActive });
      toast.success(isActive ? "User re-activated" : "User suspended");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update user");
    }
  };

  return (
    <div>
      <AdminPageHeader title="Users" />

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input className="pl-9" placeholder="Search by name or email…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Label className="sr-only" htmlFor="user-role">
          Role
        </Label>
        <select
          id="user-role"
          value={role}
          onChange={(e) => {
            setRole(e.target.value as Role | "");
            setPage(1);
          }}
          className="border border-line bg-paper px-3 py-2 text-sm focus:border-ink focus:outline-none"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto border border-line bg-paper">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : isError ? (
          <p className="p-6 text-sm text-red-600">{error instanceof Error ? error.message : "Could not load users."}</p>
        ) : !data || data.data.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">No users found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted">
              <tr className="border-b border-line">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Verified</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.data.map((u) => (
                <tr key={u.id} className="hover:bg-mist/40">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">
                      {(u.firstName ?? "") + " " + (u.lastName ?? "") || "—"}
                      {u.id === currentUser?.id ? <span className="ml-2 text-[10px] uppercase tracking-wider text-muted">you</span> : null}
                    </p>
                    <p className="text-xs text-muted">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={u.isEmailVerified ? "verified" : "unverified"} />
                  </td>
                  <td className="px-4 py-3 text-muted">{u._count?.orders ?? 0}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={u.id === currentUser?.id}
                      onChange={(e) => void changeRole(u.id, e.target.value as Role)}
                      className="border border-line bg-paper px-2 py-1 text-xs uppercase disabled:opacity-50 focus:border-ink focus:outline-none"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r.toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={u.id === currentUser?.id}
                      onClick={() => void toggleActive(u.id, !u.isActive)}
                      className="text-xs uppercase tracking-wider underline-offset-2 disabled:opacity-40"
                    >
                      {u.isActive ? <span className="text-emerald-700 hover:underline">active</span> : <span className="text-red-600 hover:underline">suspended</span>}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
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
