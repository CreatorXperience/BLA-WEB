import type { Metadata } from "next";
import { UsersManager } from "@/features/admin/users/users-manager";

export const metadata: Metadata = { title: "Users" };

export default function AdminUsersPage() {
  return <UsersManager />;
}
