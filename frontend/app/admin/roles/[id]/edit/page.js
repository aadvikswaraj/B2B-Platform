"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RoleForm from "@/components/admin/roles/RoleForm";
import { useAlert } from "@/components/ui/AlertManager";

import PageHeaderSkeleton from "@/components/ui/skeletons/PageHeaderSkeleton";
import FormSectionSkeleton from "@/components/ui/skeletons/FormSectionSkeleton";
import RolesAPI from "@/utils/api/admin/adminRoles";
import PageHeader from "@/components/ui/PageHeader";

function EditRolePageSkeleton() {
  return (
    <>
      <PageHeaderSkeleton showBack withActions lines={2} />
      <div className="space-y-8">
        {/* Role Details (Name, Description) */}
        <FormSectionSkeleton type="form" fields={2} />

        {/* Permissions Grid */}
        <FormSectionSkeleton type="matrix" />
      </div>
    </>
  );
}

export default function EditRolePage() {
  const { id } = useParams();
  const pushAlert = useAlert();
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/roles/${id}`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((resp) => {
        if (ignore) return;
        if (resp.success) {
          if (resp.data) {
            setRole(resp.data);
            setLoading(false);
          } else {
            pushAlert("error", "Role not found.");
            router.push("/admin/roles");
          }
        } else {
          pushAlert("error", "Failed to load role.");
        }
      })
      .catch(() => {
        if (!ignore) {
          pushAlert("error", "Failed to load role.");
        }
      });
    
    return () => {
      ignore = true;
    };
  }, [id, pushAlert, router]);

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      {loading ? (
        <EditRolePageSkeleton />
      ) : (
        <>
        <PageHeader
        backHref="/admin/roles"
        backLabel="Roles"
        title={`Edit Role: ${role.roleName}`}
        subtitle={`Last Updated at ${new Date(role.updatedAt).toLocaleDateString()}`}
        badge={role.isSuperAdmin && "Super Admin"}
      />
        <RoleForm
          mode="edit"
          initial={role}
          onCancel={() => router.push("/admin/roles")}
          onSubmit={async (data) => {
            try {
              const resp = await RolesAPI.update(role._id, data);
              if (resp.success) {
                pushAlert("success", "Role updated successfully!");
                router.push("/admin/roles");
              } else if (resp.message === "Role name already exists") {
                pushAlert("error", "Role name already exists.");
              } else {
                pushAlert("error", "Failed to update role.");
              }
            } catch (e) {
              pushAlert("error", "Failed to update role.");
            }
          }}
        />
      </>
      )
      }
    </div>
  );
}
