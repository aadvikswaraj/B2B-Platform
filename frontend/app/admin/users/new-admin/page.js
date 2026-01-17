"use client";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import FormSection from "@/components/ui/FormSection";
import PageHeader from "@/components/ui/PageHeader";
import { useAlert } from "@/components/ui/AlertManager";
import UsersAPI from "@/utils/api/admin/users";
import RolesAPI from "@/utils/api/admin/adminRoles";
import { useRouter } from "next/navigation";

// Loading skeleton for role cards
function RoleCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="h-4 w-40 bg-gray-200 rounded" />
        <div className="h-4 w-10 bg-gray-200 rounded" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-5 w-12 bg-gray-200 rounded-full" />
        ))}
      </div>
    </div>
  );
}

export default function NewUserPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      adminRoleId: "",
    },
  });

  const adminRoleId = watch("adminRoleId");
  const pushAlert = useAlert();
  const router = useRouter();

  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [showAllPerms, setShowAllPerms] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const params = {
          page: "1",
          pageSize: "100",
          sort: JSON.stringify({ field: "roleName", order: "asc" }),
        };
        const serverResponse = await RolesAPI.list(params);
        serverResponse.success
          ? setRoles(serverResponse.data.docs)
          : pushAlert("error", "Failed to load admin roles!");
      } catch {
        pushAlert("error", "Failed to load admin roles!");
      }
      setRolesLoading(false);
    })();
  }, []);

  const onSubmit = async (data) => {
    if (!data.adminRoleId) {
      pushAlert("error", "Please select an admin role");
      return;
    }

    try {
      const payload = {
        name: data.base.name,
        email: data.base.email,
        password: data.base.password,
        adminRoleId: data.adminRoleId,
      };

      const result = await UsersAPI.createAdmin(payload);

      if (result.success) {
        pushAlert(
          "success",
          result.message || "Admin user created successfully"
        );
        router.push('/admin/roles');
      } else {
        pushAlert("error", result.message || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      pushAlert("error", "Network error. Please try again.");
    }
  };

  const selectedRole = roles.find((r) => r._id === adminRoleId);

  return (
    <div className="max-w-5xl mx-auto lg:px-6 py-4 sm:py-6 space-y-8">
      <PageHeader
        backHref="/admin/users"
        backLabel="Users"
        title="New Admin User"
        subtitle="Create a new administrative user and assign a platform role."
        badge={selectedRole ? selectedRole.roleName : "No role selected"}
        primaryLabel={isSubmitting ? "Saving..." : "Create User"}
        primaryIcon={CheckIcon}
        primaryDisabled={isSubmitting}
        onPrimary={handleSubmit(onSubmit)}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="sm:space-y-8 pb-24 sm:pb-0"
      >
        <FormSection
          title="Basic Information"
          description="Core identity and login credentials."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              label="Full Name"
              required
              error={errors.base?.name?.message}
            >
              <Input
                {...register("base.name", { required: "Name is required" })}
                placeholder="Jane Doe"
                invalid={!!errors.base?.name}
              />
            </FormField>
            <FormField
              label="Email"
              required
              error={errors.base?.email?.message}
            >
              <Input
                {...register("base.email", {
                  required: "Valid email is required",
                  pattern: {
                    value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                    message: "Invalid email format",
                  },
                })}
                type="email"
                placeholder="user@example.com"
                invalid={!!errors.base?.email}
              />
            </FormField>
            <FormField
              label="Password"
              required
              error={errors.base?.password?.message}
            >
              <Input
                {...register("base.password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                })}
                type="password"
                placeholder="••••••••"
                invalid={!!errors.base?.password}
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection
          title="Admin Role Selection"
          description="Choose exactly one administrative role for this user."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rolesLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <RoleCardSkeleton key={i} />
                ))
              : roles.map((role) => {
                  const active = adminRoleId === role._id;
                  return (
                    <label
                      key={role._id}
                      className={`relative cursor-pointer rounded-xl border p-4 flex flex-col gap-2 transition shadow-sm hover:shadow-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 ${
                        active
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        value={role._id}
                        {...register("adminRoleId", { required: true })}
                        className="peer sr-only"
                      />
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                          {role.roleName}
                        </p>
                        {role.isSuperAdmin && (
                          <span className="text-[10px] font-medium rounded-md bg-rose-500 text-white px-1.5 py-0.5">
                            Super
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {Object.keys(role.permissions)
                          .slice(0, 5)
                          .map((m) => (
                            <span
                              key={m}
                              className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                active
                                  ? "border-indigo-300 text-indigo-700 bg-white/60"
                                  : "border-gray-200 text-gray-500"
                              }`}
                            >
                              {m}
                            </span>
                          ))}
                        {Object.keys(role.permissions).length > 5 && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border ${
                              active
                                ? "border-indigo-300 text-indigo-700 bg-white/60"
                                : "border-gray-200 text-gray-500"
                            }`}
                          >
                            +{Object.keys(role.permissions).length - 5}
                          </span>
                        )}
                      </div>
                      {active && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-2 ring-white" />
                      )}
                    </label>
                  );
                })}
          </div>
          {!adminRoleId && (
            <p className="mt-3 text-[11px] text-amber-600">
              Select an admin role to continue.
            </p>
          )}
          {!rolesLoading && selectedRole && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-700">
                  Permissions Preview
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAllPerms((p) => !p)}
                  className="text-[11px] font-medium text-indigo-600 hover:underline"
                >
                  {showAllPerms ? "Hide" : "Show"} details
                </button>
              </div>
              {showAllPerms && (
                <div className="rounded-lg border border-gray-200 bg-white p-4 max-h-72 overflow-auto text-xs leading-relaxed space-y-3">
                  {Object.entries(selectedRole.permissions || {}).map(
                    ([module, perms]) => (
                      <div key={module} className="space-y-1">
                        <p className="font-medium text-gray-800">{module}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(perms).map(([perm, val]) => (
                            <span
                              key={perm}
                              className={`px-2 py-0.5 rounded-full border text-[10px] ${
                                val
                                  ? "bg-indigo-600 border-indigo-600 text-white"
                                  : "border-gray-200 text-gray-500"
                              }`}
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}
        </FormSection>
      </form>
    </div>
  );
}
