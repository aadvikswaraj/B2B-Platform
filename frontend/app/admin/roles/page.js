"use client";
import { useState, useMemo, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import ManagementPanel from "@/components/common/ManagementPanel";
import Badge from "@/components/ui/Badge";
import { useAlert } from "@/components/ui/AlertManager";

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({
    search: "",
    filters: {},
    page: 1,
    pageSize: 10,
    sort: { key: "roleName", direction: "asc" },
  });

  const pushAlert = useAlert();

  async function fetchRolesFromAPI() {
    const params = new URLSearchParams();
    for (const key in query) {
      if (typeof query[key] === "object") { // if the query parameter is an object will be contered to json
        params.append(key, JSON.stringify(query[key]));
      } else {
        params.append(key, query[key]);
      }
    }
    const serverResponse = await (
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/roles/?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    ).json();
    if (!serverResponse.success) pushAlert("error", "Error fetching roles");
    return serverResponse.data || [];
  }

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      const fetchedRoles = await fetchRolesFromAPI();
      setTotalCount(fetchedRoles.totalCount);
      setRoles(fetchedRoles.roles);
      setLoading(false);
    };
    fetchRoles();
  }, [JSON.stringify(query)]); // compare query object

  const columns = [
    {
      key: "roleName",
      header: "Role",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.roleName}</span>
          <span className="text-[11px] text-gray-500">
            {row.isSuperAdmin
              ? "Full platform access"
              : Object.keys(row.permissions).length + " modules"}
          </span>
        </div>
      ),
    },
    {
      key: "isSuperAdmin",
      header: "Super",
      sortable: true,
      render: (row) =>
        row.isSuperAdmin ? (
          <Badge variant="rose">Yes</Badge>
        ) : (
          <span className="text-xs text-gray-500">No</span>
        ),
    },
    { key: "users", header: "Users", render: (row) => "Coming Soon" },
    {
      key: "updatedAt",
      header: "Last Updated",
      sortable: true,
      render: (row) => new Date(row.updatedAt).toLocaleDateString(),
    },
  ];

   // Row actions via dot menu
  const rowActions = (role) => [
      {
        label: "View",
        icon: EyeIcon,
        onClick: () => pushAlert("info", `View Role ${role.roleName}`),
      },
      {
        label: "Delete",
        icon: TrashIcon,
        onClick: async () => {
          if (!confirm("Delete this role?")) return;
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/roles/${role._id}`,
            {
              method: "DELETE",
              credentials: "include",
            }
          );
          const json = await res.json();
          if (json.success) {
            pushAlert("success", json.message || "Deleted");
            setRoles((prev) => prev.filter((r) => r._id !== role._id));
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
        title="Roles"
        items={roles}
        totalCount={totalCount}
        search={query.search}
        primaryActions={[
          {
            type: "link",
            label: "Add Role",
            icon: PlusIcon,
            href: "/admin/roles/new",
          },
        ]}
        bulkActions={[
          {
            label: "Delete",
            onClick: (selectedIds) => {
              pushAlert("info", 'Deleting roles');
            },
          }
        ]}
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
        rowActions={rowActions}
        loading={loading}
      />
    </div>
  );
}
