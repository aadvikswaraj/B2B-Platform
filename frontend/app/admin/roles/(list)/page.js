"use client";
import { useState, useEffect } from "react";
import { EyeIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import ManagementPanel from "@/components/common/ManagementPanel";
import Badge from "@/components/ui/Badge";
import { useAlert } from "@/components/ui/AlertManager";
import { useRouter } from "next/navigation";
import DeleteRoleDialog from "@/components/admin/roles/DeleteRoleDialog";
import { RolesAPI } from "@/utils/api/admin/adminRoles";
import { useListQuery } from "@/utils/listQueryManager";
import { PenBoxIcon } from "lucide-react";
import RolePreview from "@/components/admin/roles/RolePreview";

function RenderUserCount({ id }) {
  const [userCount, setUserCount] = useState(null);
  useEffect(() => {
    try {
      RolesAPI.usersCount(id).then((serverResponse) => {
        if (serverResponse.success) {
          setUserCount(serverResponse.data.count);
        }
      });
    } catch (error) {
      console.error("Error fetching user count:", error);
    }
  }, []);

  return userCount !== null ? (
    <>{userCount}</>
  ) : (
    <div className="h-4 w-12 bg-gray-200 rounded" />
  );
}

export default function RolesPage() {
  const router = useRouter();
  const pushAlert = useAlert();
  const [activeDelete, setActiveDelete] = useState(null);

  // Single hook - all state managed internally
  const {
    items: roles,
    setItems: setRoles,
    totalCount,
    setTotalCount,
    loading,
    handlers,
  } = useListQuery({
    apiFn: RolesAPI.list,
    initialQuery: { sort: { key: "roleName", direction: "asc" } },
  });

  const columns = [
    {
      key: "roleName",
      header: "Role",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <div className="flex">
            <span className="font-medium text-gray-900">{row.roleName}</span>
              <Badge className="ml-2" variant="gray">
                {row.isActive ? "Active" : "Inactive"}
              </Badge>
          </div>
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
    {
      key: "users",
      header: "Users",
      render: (row) => <RenderUserCount id={row._id} />,
    },
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
      label: "Edit",
      icon: PenBoxIcon,
      onClick: () => router.push(`/admin/roles/${role._id}/edit`),
    },
    {
      label: "Delete",
      icon: TrashIcon,
      onClick: () => setActiveDelete(role),
    },
  ];
  const filters = [
      {key: "isActive", label: "Status", options: [{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }] },
      { key: "isSuperAdmin", label: "Super Admin", options: [{ value: "true", label: "Yes" }, { value: "false", label: "No" }] },
  ];

  return (
    <div className="mt-5">
      <ManagementPanel
        title="Roles"
        items={roles}
        itemLink={(role) => `/admin/roles/${role._id}`}
        totalCount={totalCount}
        loading={loading}
        {...handlers}
        primaryActions={[
          {
            type: "link",
            label: "Add Role",
            icon: PlusIcon,
            href: "/admin/roles/new",
          },
        ]}
        columns={columns}
        rowActions={rowActions}
        filters={filters}
        renderItem={(props) => <RolePreview {...props} />}
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
