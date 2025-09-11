"use client";
import { useState, useEffect } from "react";
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
import RoleBadges from "@/components/admin/users/RoleBadges";
import UserStatusPill from "@/components/admin/users/UserStatusPill";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [query, setQuery] = useState({
    search: "",
    filters: {},
    page: 1,
    pageSize: 10,
    sort: { key: "createdAt", direction: "desc" },
  });

  const pushAlert = useAlert();

  async function fetchUsersFromAPI() {
    const params = new URLSearchParams();
    // primitive params
    params.set("search", query.search || "");
    params.set("page", query.page);
    params.set("pageSize", query.pageSize);
    if (query.sort) {
      const sortPayload = {
        field: query.sort.key,
        order: query.sort.direction,
      };
      params.set("sort", JSON.stringify(sortPayload));
    }
    if (query.filters && Object.keys(query.filters).length) {
      params.set("filters", JSON.stringify(query.filters));
    }
    const url = `${
      process.env.NEXT_PUBLIC_API_URL
    }/admin/users/?${params.toString()}`;
    try {
      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (!json.success) {
        pushAlert("error", json.error || "Error fetching users");
        return { users: [], totalCount: 0 };
      }
      return json.data || { users: [], totalCount: 0 };
    } catch (e) {
      pushAlert("error", "Network error fetching users");
      return { users: [], totalCount: 0 };
    }
  }

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const fetchedUsers = await fetchUsersFromAPI();
      setUsers(fetchedUsers.users);
      setTotalCount(fetchedUsers.totalCount);
      setLoading(false);
    };
    fetchUsers();
  }, [JSON.stringify(query)]); // compare query object

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
          {u.isAdmin && <Badge color="blue">Admin</Badge>}
          {u.isSuperAdmin && <Badge color="purple">Super</Badge>}
          {u.isSeller && <Badge color="amber">Seller</Badge>}
          {!u.isSeller && !u.isAdmin && <Badge color="gray">Buyer</Badge>}
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
    },
    {
      key: "role",
      header: "Role",
      render: (u) => <RoleBadges user={u} />,
    },
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
    <div className="mt-5">
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
        search={query.search}
        onSearchChange={(value) =>
          setQuery((prev) => ({ ...prev, search: value, page: 1 }))
        }
        sort={query.sort}
        onSortChange={(sort) =>
          setQuery((prev) => ({ ...prev, sort, page: 1 }))
        }
        page={query.page}
        pageSize={query.pageSize}
        onPageChange={(page) => setQuery((prev) => ({ ...prev, page }))}
        onPageSizeChange={(pageSize) =>
          setQuery((prev) => ({ ...prev, pageSize, page: 1 }))
        }
        enableSorting
        columns={columns}
        filters={filters}
        activeFilters={query.filters}
        onFilterChange={(filters) =>
          setQuery((prev) => ({ ...prev, filters, page: 1 }))
        }
        rowActions={rowActions}
        loading={loading}
      />
    </div>
  );
}
