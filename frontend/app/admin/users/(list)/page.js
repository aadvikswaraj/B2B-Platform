"use client";
import { useState } from "react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  UserMinusIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import ManagementPanel from "@/components/common/ManagementPanel";
import Badge from "@/components/ui/Badge";
import { useAlert } from "@/components/ui/AlertManager";
import UserAvatar from "@/components/admin/users/UserAvatar";
import UserStatusPill from "@/components/admin/users/UserStatusPill";
import UserPreview from "@/components/admin/users/UserPreview";
import { useRouter } from "next/navigation";
import UsersAPI from "@/utils/api/admin/users";
import { useListQuery } from "@/utils/listQueryManager";

export default function UsersPage() {
  const router = useRouter();
  const pushAlert = useAlert();
  
  // Single hook - all state managed internally
  const { items: users, setItems: setUsers, totalCount, setTotalCount, loading, handlers } = useListQuery({
    apiFn: UsersAPI.list,
  });

  const columns = [
    {
      key: "user",
      header: "User",
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <UserAvatar user={u} />
          <div>
            <div className="font-medium text-gray-900">{u.name || "—"}</div>
            <div className="text-xs text-gray-500">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "flags",
      header: "Flags",
      render: (u) => (
        <div className="flex flex-wrap gap-1">
          {u.isAdmin && <Badge variant="blue">Admin</Badge>}
          {u.isSuperAdmin && <Badge variant="purple">Super</Badge>}
          {u.isSeller && <Badge variant="amber">Seller</Badge>}
          {!u.isSeller && !u.isAdmin && <Badge variant="gray">Buyer</Badge>}
          {u.adminRole?.roleName && <Badge variant="emerald">{u.adminRole.roleName}</Badge>}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (u) => (
        <UserStatusPill status={u.userSuspended ? "suspended" : "active"} />
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (u) => (
        <span className="text-xs text-gray-600">
          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    }
  ];

  const filters = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "suspended", label: "Suspended" },
      ],
    },
    {
      key: "role",
      label: "Role",
      options: [
        { value: "admin", label: "Admin" },
        { value: "seller", label: "Seller" },
        { value: "buyer", label: "Buyer" },
      ],
    },
  ];

  // Row actions via dot menu
  const rowActions = (user) => [
    {
      label: "View",
      icon: EyeIcon,
      onClick: () => router.push(`/admin/users/${user._id}`),
    },
    {
      label: user.userSuspended ? "Unsuspend" : "Suspend",
      icon: user.userSuspended ? UserPlusIcon : UserMinusIcon,
      onClick: async () => {
        const body = { userSuspended: !user.userSuspended };
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${user._id}/edit`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );
        const json = await res.json();
        if (json.success) {
          pushAlert("success", json.message || "Updated");
          // refresh list
          setUsers((prev) =>
            prev.map((u) =>
              u._id === user._id
                ? { ...u, userSuspended: !user.userSuspended }
                : u
            )
          );
        } else {
          pushAlert("error", json.message || "Update failed");
        }
      },
    },
    {
      label: "Delete",
      icon: TrashIcon,
      onClick: async () => {
        if (!confirm("Delete this user?")) return;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${user._id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
        const json = await res.json();
        if (json.success) {
          pushAlert("success", json.message || "Deleted");
          setUsers((prev) => prev.filter((u) => u._id !== user._id));
          setTotalCount((tc) => Math.max(0, tc - 1));
        } else {
          pushAlert("error", json.message || "Delete failed");
        }
      },
    },
  ];

  return (
    <div className="sm:mt-5">
      <ManagementPanel
        title="Users"
        primaryActions={[
          {
            type: "link",
            label: "Add Admin",
            icon: PlusIcon,
            href: "/admin/users/new-admin",
          },
        ]}
        itemLink={(u) => `/admin/users/${u._id}`}
        items={users}
        totalCount={totalCount}
        loading={loading}
        {...handlers}
        columns={columns}
        filters={filters}
        rowActions={rowActions}
        renderItem={(props) => <UserPreview {...props} />}
      />
    </div>
  );
}
