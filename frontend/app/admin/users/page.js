"use client";
import { useState, useCallback, useMemo } from "react";
import useSampleList from "@/hooks/useSampleList";
import { CountStatsCard } from "@/components/admin/AdminComponents";
import ManagementPanel from "@/components/common/ManagementPanel";
import {
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import UserAvatar from "@/components/admin/users/UserAvatar";
import RoleBadges from "@/components/admin/users/RoleBadges";
import UserStatusPill from "@/components/admin/users/UserStatusPill";

// TODO: Replace with API integration to backend user model (see backend/models/model.js)
// Sample shape aligning with backend flags isSeller, isAdmin and optional sellerProfile / buyer profile extension
const initialUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    isSeller: true,
    isAdmin: false,
    status: "active",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    isSeller: false,
    isAdmin: false,
    status: "active",
  },
  {
    id: 3,
    name: "Sam Admin",
    email: "sam@platform.com",
    isSeller: false,
    isAdmin: true,
    status: "active",
  },
  {
    id: 4,
    name: "Peter Pending",
    email: "peter@wait.com",
    isSeller: true,
    isAdmin: false,
    status: "pending",
  },
  {
    id: 5,
    name: "Brenda Suspended",
    email: "brenda@corp.com",
    isSeller: false,
    isAdmin: false,
    status: "suspended",
  },
  {
    id: 6,
    name: "Carl Banned",
    email: "carl@ban.com",
    isSeller: true,
    isAdmin: false,
    status: "pending",
  },
];

const roleFilter = [
  { value: "admin", label: "Admin" },
  { value: "seller", label: "Seller" },
  { value: "buyer", label: "Buyer" },
];
const statusFilter = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
];

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState({
    search: "",
    filters: {},
    page: 1,
    pageSize: 10,
    sort: { key: "name", direction: "asc" },
  });
  const { items, totalCount, loading } = useSampleList(
    useMemo(
      () =>
        users.map((u) => ({
          ...u,
          roles: [
            u.isAdmin && "admin",
            u.isSeller && "seller",
            !u.isAdmin ? "buyer" : null,
          ].filter(Boolean),
        })),
      [users]
    ),
    query,
    { searchableKeys: ["name", "email", "status"] }
  );

  // Derived roles array for each user (so we can reuse RoleBadges)
  const usersWithRoles = items.map((u) => ({
    ...u,
    role: u.roles?.[0] || "buyer",
  }));

  const toggleSuspend = useCallback((user) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, status: u.status === "suspended" ? "active" : "suspended" }
          : u
      )
    );
  }, []);

  const banUser = useCallback((user) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: "banned" } : u))
    );
  }, []);

  const bulkSetStatus = (status) => {
    setUsers((prev) =>
      prev.map((u) => (selected.includes(u.id) ? { ...u, status } : u))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="grid flex-1 gap-6 grid-cols-6">
          <CountStatsCard
            title="Status Stats"
            className={"col-span-1 lg:col-span-2"}
            items={[
              {
                label: "Total",
                value: users.length,
                className: "text-gray-900",
              },
              {
                label: "Active",
                value: users.filter((u) => u.status === "active").length,
                className: "text-emerald-600",
              },
              {
                label: "Suspended",
                value: users.filter((u) => u.status === "suspended").length,
                className: "text-orange-600",
              },
              {
                label: "Banned",
                value: users.filter((u) => u.status === "banned").length,
                className: "text-rose-600",
              },
            ]}
            statsContainerClassName="grid-cols-2 gap-4"
          />
          <CountStatsCard
            title="Roles Stats"
            className={"col-span-1 lg:col-span-2"}
            items={[
              {
                label: "Admins",
                value: users.filter((u) => u.isAdmin).length,
                className: "text-indigo-600",
              },
              {
                label: "Sellers",
                value: users.filter((u) => u.isSeller).length,
                className: "text-teal-600",
              },
              {
                label: "Buyers",
                value: users.filter((u) => !u.isAdmin).length,
                className: "text-sky-600",
              },
              {
                label: "Multi (Seller+Buyer)",
                value: users.filter((u) => u.isSeller && !u.isAdmin).length,
                className: "text-fuchsia-600",
              },
            ]}
            statsContainerClassName="grid-cols-2 gap-4"
          />
          <CountStatsCard
            title="Engagement Stats"
            className={"col-span-1 lg:col-span-2"}
            items={[
              {
                label: "Active Today",
                value: users.filter(
                  (u) =>
                    u.lastLogin &&
                    new Date(u.lastLogin).toDateString() ===
                      new Date().toDateString()
                ).length,
                className: "text-emerald-600",
              },
              {
                label: "No Login",
                value: users.filter((u) => !u.lastLogin).length,
                className: "text-gray-600",
              },
              {
                label: "Pending",
                value: users.filter((u) => u.status === "pending").length,
                className: "text-amber-600",
              },
              {
                label: "Recent 7d",
                value: users.filter(
                  (u) =>
                    u.lastLogin &&
                    Date.now() - new Date(u.lastLogin).getTime() < 7 * 86400000
                ).length,
                className: "text-blue-600",
              },
            ]}
            statsContainerClassName="grid-cols-2 gap-4"
          />
        </div>
      </div>

      <ManagementPanel
        title={"Users"}
        items={usersWithRoles}
        totalCount={totalCount}
        search={query.search}
        onSearchChange={(v) => setQuery((prev) => ({ ...prev, search: v, page: 1 }))}
        filters={[
          { key: "role", label: "Role", options: roleFilter },
          { key: "status", label: "Status", options: statusFilter },
        ]}
        activeFilters={query.filters}
        onFilterChange={(f) => setQuery((q) => ({ ...q, filters: f, page: 1 }))}
        sort={query.sort}
        onSortChange={(s) => setQuery((q) => ({ ...q, sort: s, page: 1 }))}
        enableSorting
        page={query.page}
        pageSize={query.pageSize}
        onPageChange={(p) => setQuery((q) => ({ ...q, page: p }))}
        onPageSizeChange={(ps) =>
          setQuery((q) => ({ ...q, pageSize: ps, page: 1 }))
        }
        columns={[
          {
            key: "name",
            header: "User",
            sortable: true,
            className: "min-w-[220px]",
            render: (u) => (
              <div className="flex items-center gap-3">
                <UserAvatar user={u} size={38} />
                <div className="leading-tight">
                  <p className="font-medium text-gray-900">{u.name}</p>
                  <p className="text-[11px] text-gray-500">{u.email}</p>
                </div>
              </div>
            ),
          },
          {
            key: "roles",
            header: "Roles",
            sortable: false,
            render: (u) => <RoleBadges roles={u.roles} />,
          },
          {
            key: "status",
            header: "Status",
            sortable: true,
            render: (u) => <UserStatusPill status={u.status} />,
          },
        ]}
        rowActions={(item) =>{
          return [
            {
              label: "Edit",
              onClick: () => handleEditUser(item.id),
            },
            {
              label: "Delete",
              onClick: () => handleDeleteUser(item.id),
            },
          ];
        }}
        bulkActions={[
          {
            key: "activate",
            label: "Set Active",
            onClick: (ids) => {
              setUsers((prev) =>
                prev.map((u) =>
                  ids.includes(u.id) ? { ...u, status: "active" } : u
                )
              );
            },
          },
          {
            key: "suspend",
            label: "Set Suspended",
            onClick: (ids) => bulkSetStatus("suspended"),
          },
          {
            key: "ban",
            label: "Ban",
            onClick: (ids) => {
              setUsers((prev) =>
                prev.map((u) =>
                  ids.includes(u.id) ? { ...u, status: "banned" } : u
                )
              );
            },
          },
        ]}
        loading={loading}
        primaryActions={[
          {
            type: "link",
            label: "New User",
            href: "/admin/users/new",
            icon: PlusIcon,
          },
        ]}
      />
    </div>
  );
}
