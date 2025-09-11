"use client";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import Button from "@/components/ui/Button"; // still used in sidebar actions
import PageHeader from "@/components/ui/PageHeader";
import { PencilSquareIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useAlert } from "@/components/ui/AlertManager";
import { RolesAPI } from "@/utils/api/adminRoles";
import DeleteRoleDialog from "@/components/admin/roles/DeleteRoleDialog";

function RenderUserCount({ id }) {
  const [userCount, setUserCount] = useState(null);
  const pushAlert = useAlert();
  useEffect(() => {
    try {
      RolesAPI.usersCount(id).then(serverResponse => {
        if (serverResponse.success) {
          setUserCount(serverResponse.data.count);
        }
      });
    } catch (error) {
      pushAlert("error", "Failed to load user count.");
      console.error("Error fetching user count:", error);
    }    
  }, []);
  
  return userCount !== null ?
    <>{userCount}</>
   : <div className="h-4 w-12 bg-gray-200 rounded" />;
};

export default function RolePreviewPage() {
  const { id } = useParams();
  const pushAlert = useAlert();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissionsEntries, setPermissionsEntries] = useState([]);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    async function fetchRole() {
      try {
        const serverResponse = await RolesAPI.get(id);
        if (serverResponse.success) {
          setRole(serverResponse.data);
          setPermissionsEntries(
            Object.entries(serverResponse.data.permissions)
          );
          setLoading(false);
        } else {
          notFound();
        }
      } catch (error) {
        console.log("Error fetching role:", error);
        pushAlert("error", error?.message || "Failed to load role.");
      }
    }
    fetchRole();
  }, []);

  return (loading ? (
    <div className="space-y-6 animate-fadeIn mt-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg border border-gray-200 bg-white" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-gray-200 rounded" />
            <div className="h-3 w-56 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="h-9 w-28 bg-gray-200 rounded" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                  <div className="h-4 w-36 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                    <div className="h-4 w-12 bg-gray-200 rounded" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="h-5 w-12 bg-gray-100 rounded" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="space-y-3">
              <div className="h-8 w-full bg-gray-100 rounded" />
              <div className="h-8 w-full bg-gray-100 rounded" />
            </div>
          </div>
          {/* <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-3 w-40 bg-gray-100 rounded" />
              ))}
            </div>
          </div> */}
        </div>
      </div>
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.25s ease;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  ) : (
    <div className="space-y-6 pb-20 mt-5 sm:pb-0">
      {/* extra bottom space for mobile action bar */}
      <PageHeader
        backHref="/admin/roles"
        backLabel="Roles"
        title={role.roleName}
        subtitle={`Created ${new Date(role.createdAt).toLocaleDateString()} • ${
          role.users
        } assigned user${role.users !== 1 ? "s" : ""}`}
        badge={role.isSuperAdmin && "Super Admin"}
        primaryLabel="Edit Role"
        primaryIcon={PencilSquareIcon}
        primaryHref={`/admin/roles/${role._id}/edit`}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
            <h2 className="text-sm font-semibold tracking-wide text-gray-700 mb-4">
              Overview
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Role Name</dt>
                <dd className="font-medium text-gray-900">{role.roleName}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Super Admin</dt>
                <dd className="font-medium">
                  {role.isSuperAdmin ? "Yes" : "No"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Users Assigned</dt>
                <dd className="font-medium">
                  <RenderUserCount id={role._id} />
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Created</dt>
                <dd className="font-medium">
                  {new Date(role.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold tracking-wide text-gray-700">
                Module Permissions
              </h2>
            </div>
            {role.isSuperAdmin ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheckIcon className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Super Admin role</p>
                    <p className="text-xs text-emerald-700">
                      This role has unrestricted access to all modules. Granular module permissions do not apply.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
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
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
            <h2 className="text-sm font-semibold tracking-wide text-gray-700 mb-4">
              Actions
            </h2>
            <div className="space-y-3">
              <Button
                variant="outline"
                as={Link}
                href={`/admin/roles/${role.id}/edit`}
                className="w-full"
                icon={PencilSquareIcon}
              >
                Edit Role
              </Button>
              <Button variant="danger" className="w-full" onClick={()=>setShowDelete(true)}>
                Delete Role
              </Button>
            </div>
          </section>
        </aside>
        <DeleteRoleDialog
          open={showDelete}
          role={role}
          onClose={()=>setShowDelete(false)}
          onDeleted={()=>{
            setShowDelete(false);
            // Redirect back to roles list after deletion
            window.location.href = '/admin/roles';
          }}
        />
      </div>
    </div>
  ));
}
