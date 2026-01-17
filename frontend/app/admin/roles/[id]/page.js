"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PencilSquareIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import PageHeaderSkeleton from "@/components/ui/skeletons/PageHeaderSkeleton";
import FormSectionSkeleton from "@/components/ui/skeletons/FormSectionSkeleton";
import { useAlert } from "@/components/ui/AlertManager";
import { RolesAPI } from "@/utils/api/admin/adminRoles";
import PreviewPage from "@/components/ui/preview/PreviewPage";
import PreviewSection from "@/components/ui/preview/PreviewSection";
import PreviewField from "@/components/ui/preview/PreviewField";
import DeleteRoleDialog from "@/components/admin/roles/DeleteRoleDialog";

function RoleDetailSkeleton() {
  return (
    <>
      <PageHeaderSkeleton showBack withActions lines={2} />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <FormSectionSkeleton type="form" fields={4} />
          <FormSectionSkeleton type="matrix" />
        </div>
        <div className="space-y-6">
          <FormSectionSkeleton type="form" fields={2} />
        </div>
      </div>
    </>
  );
}

function RenderUserCount({ id }) {
  const [userCount, setUserCount] = useState(null);
  const pushAlert = useAlert();

  useEffect(() => {
    let ignore = false;
    RolesAPI.usersCount(id)
      .then((serverResponse) => {
        if (ignore) return;
        if (serverResponse.success) {
          setUserCount(serverResponse.data.count);
        }
      })
      .catch((error) => {
        if (!ignore) {
          pushAlert("error", "Failed to load user count.");
          console.error("Error fetching user count:", error);
        }
      });
    return () => {
      ignore = true;
    };
  }, [id, pushAlert]);

  return userCount !== null ? (
    <>{userCount}</>
  ) : (
    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
  );
}

export default function RoleDetailPage() {
  const { id } = useParams();
  const pushAlert = useAlert();
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissionsEntries, setPermissionsEntries] = useState([]);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    let ignore = false;

    RolesAPI.get(id)
      .then((serverResponse) => {
        if (ignore) return;
        if (serverResponse.success) {
          if (serverResponse.data) {
            setRole(serverResponse.data);
            setPermissionsEntries(Object.entries(serverResponse.data.permissions));
            setLoading(false);
          } else {
            pushAlert("error", "Role not found.");
            router.push("/admin/roles");
          }
        } else {
          pushAlert("error", "Failed to load role.");
        }
      })
      .catch((error) => {
        if (!ignore) {
          console.error("Error fetching role:", error);
          pushAlert("error", error?.message || "Failed to load role.");
        }
      });

    return () => {
      ignore = true;
    };
  }, [id, pushAlert, router]);

  const actions = [
    {
      label: "Edit Role",
      href: role ? `/admin/roles/${role._id}/edit` : "#",
      icon: PencilSquareIcon,
      variant: "outline",
    },
    {
      label: "Delete Role",
      onClick: () => setShowDelete(true),
      variant: "danger",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      {loading ? (
        <RoleDetailSkeleton />
      ) : (
        <>
          <PageHeader
            backHref="/admin/roles"
            backLabel="Roles"
            title={role.roleName}
            subtitle={`Updated at ${new Date(role.updatedAt).toLocaleDateString()}`}
            badge={role.isSuperAdmin && "Super Admin"}
          />

          <PreviewPage actions={actions}>
            <PreviewSection title="Overview" columns={2}>
              <PreviewField label="Role Name" value={role.roleName} />
              <PreviewField 
                label="Super Admin" 
                value={role.isSuperAdmin ? "Yes" : "No"} 
              />
              <PreviewField 
                label="Users Assigned" 
                value={<RenderUserCount id={role._id} />} 
              />
              <PreviewField 
                label="Created" 
                value={new Date(role.createdAt).toLocaleDateString()} 
              />
            </PreviewSection>

            <PreviewSection title="Module Permissions">
              {role.isSuperAdmin ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 sm:col-span-2">
                  <div className="flex items-start gap-3">
                    <ShieldCheckIcon className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-800">
                        Super Admin role
                      </p>
                      <p className="text-xs text-emerald-700">
                        This role has unrestricted access to all modules. Granular
                        module permissions do not apply.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4 sm:col-span-2">
                  {permissionsEntries.map(([module, perms]) => (
                    <div
                      key={module}
                      className="rounded-lg border border-gray-100 bg-gray-50 p-4 flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-800 text-sm capitalize">
                          {module}
                        </h3>
                        <span className="text-[10px] inline-flex items-center rounded-full bg-indigo-100 text-indigo-600 font-semibold px-2 py-0.5">
                          {Object.keys(perms).length} perms
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        {Object.entries(perms).map(([key, val]) => (
                          <span
                            key={key}
                            className={`px-2 py-1 rounded-md border text-[11px] font-medium ${
                              val
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : "bg-gray-100 border-gray-200 text-gray-500 line-through opacity-70"
                            }`}
                          >
                            {key}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </PreviewSection>
          </PreviewPage>

          <DeleteRoleDialog
            open={showDelete}
            role={role}
            onClose={() => setShowDelete(false)}
            onDeleted={() => {
              setShowDelete(false);
              router.push("/admin/roles");
            }}
          />
        </>
      )}
    </div>
  );
}
