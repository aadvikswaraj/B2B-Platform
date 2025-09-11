"use client";
import { useState, useEffect } from "react";
import { EyeIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import ManagementPanel from "@/components/common/ManagementPanel";
import Badge from "@/components/ui/Badge";
import { useAlert } from "@/components/ui/AlertManager";
import { useRouter } from "next/navigation";
import DeleteRoleDialog from "@/components/admin/roles/DeleteRoleDialog";
import {RolesAPI} from "@/utils/api/adminRoles";

function RenderUserCount({ id }) {
  const [userCount, setUserCount] = useState(null);
  useEffect(() => {
    try {
      RolesAPI.usersCount(id).then(serverResponse => {
        if (serverResponse.success) {
          setUserCount(serverResponse.data.count);
        }
      });
    } catch (error) {
      console.error("Error fetching user count:", error);
    }    
  }, []);
  
  return userCount !== null ?
    <>{userCount}</>
   : <div className="h-4 w-12 bg-gray-200 rounded" />;
};

export default function RolesPage() {
  const router = useRouter();
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
  const [activeDelete, setActiveDelete] = useState(null);
  const pushAlert = useAlert();

  async function fetchRolesFromAPI() {
    const params = new URLSearchParams();
    for (const key in query) {
      if (typeof query[key] === "object") {
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
          headers: { "Content-Type": "application/json" },
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
  }, [JSON.stringify(query)]);

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
    { key: "users", header: "Users", render: (row) => <RenderUserCount id={row._id} /> },
    {
      key: "updatedAt",
      header: "Last Updated",
      sortable: true,
      render: (row) => new Date(row.updatedAt).toLocaleDateString(),
    },
  ];

  const rowActions = (role) => [
    {
      label: "View",
      icon: EyeIcon,
      onClick: () => router.push(`/admin/roles/${role._id}`),
    },
    {
      label: "Delete",
      icon: TrashIcon,
      onClick: () => setActiveDelete(role),
    },
  ];

  return (
    <div className="mt-5">
      <ManagementPanel
        title="Roles"
        items={roles}
        itemLink={(role) => `/admin/roles/${role._id}`}
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
            onClick: (selectedIds) =>
              pushAlert(
                "info",
                `Deleting ${selectedIds.length} role(s) (not implemented)`
              ),
          },
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
      <DeleteRoleDialog
        open={!!activeDelete}
        role={activeDelete}
        onClose={() => setActiveDelete(null)}
        onDeleted={(deletedId) => {
          pushAlert("success", "Role deleted successfully");
          setRoles((prev) => prev.filter((r) => r._id !== deletedId));
          setTotalCount((prev) => Math.max(0, prev - 1));
        }}
      />
    </div>
  );
}
