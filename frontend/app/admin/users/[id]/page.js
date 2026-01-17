"use client";
import { useState, useMemo, useEffect } from "react";

// Sections
import IdentityCard from "@/components/admin/users/sections/IdentityCard";
import BasicInfoSection from "@/components/admin/users/sections/BasicInfoSection";
import SellerInfoSection from "@/components/admin/users/sections/SellerInfoSection";
import SecuritySection from "@/components/admin/users/sections/SecuritySection";
import ActivitySection from "@/components/admin/users/sections/ActivitySection";

import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { UsersAPI } from "@/utils/api/adminUsers";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { TrashIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [seller, setSeller] = useState(null);
  const [gstProfile, setGstProfile] = useState(null);
  const [showEdit, setShowEdit] = useState(null); // 'user' | 'seller' | 'gst'

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const roles = useMemo(() => {
    if (!user) return [];
    const arr = [];
    if (user.isAdmin) arr.push("admin");
    if (user.isSeller) arr.push("seller");
    if (!user.isAdmin) arr.push("buyer");
    return arr;
  }, [user]);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const res = await UsersAPI.get(id);
        if (res?.success) {
          if (!mounted) return;
          setUser(res.data);
          setSeller(res.data.seller || null);
          setGstProfile(res.data.gstProfile || null);
        } else {
          setError(res?.message || "Failed to load user");
        }
      } catch (e) {
        setError(e?.message || "Failed to load user");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (id) fetchData();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleToggleSuspend = async () => {
    if (!user) return;
    const nextSuspended = !user.userSuspended;
    // Optimistic update could go here, but let's wait for API
    const res = await UsersAPI.update(user._id, {
      userSuspended: nextSuspended,
    });
    if (res?.success) {
      setUser((u) => ({ ...u, userSuspended: nextSuspended }));
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const res = await UsersAPI.remove(user._id);
      if (res?.success) {
        router.push("/admin/users");
      }
    } finally {
      setDeleting(false);
    }
  };

  const actions = useMemo(() => {
    if (!user) return [];
    return [
      {
        label: "Reset Password",
        onClick: () => {
          /* TODO: Implement reset password modal */
        },
        variant: "outline",
      },
      {
        label: user.userSuspended ? "Activate User" : "Suspend User",
        onClick: handleToggleSuspend,
        variant: user.userSuspended ? "outline" : "outline", // or maybe specific color?
        // Let's keep outline for secondary actions usually
      },
      {
        label: "Delete User",
        onClick: () => setDeleteOpen(true),
        variant: "danger",
        icon: TrashIcon,
      },
    ];
  }, [user]);

  return (
    <div className="space-y-6 mt-5">
      <PageHeader
        backHref="/admin/users"
        title={user ? user.name || "User Detail" : "User Detail"}
        subtitle={user?.email}
        badge={user ? (user.userSuspended ? "Suspended" : "Active") : undefined}
        primaryLabel="Edit Details"
        onPrimary={() => setShowEdit("user")}
        secondaryActions={actions}
      />

      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      )}
      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}
      {user && !loading && !error && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main content - now full width or structured differently if we want side panels later. 
              Since we removed the management panel, sticking to keeping Identity on top or left?
              The previous layout had 2 cols for profile, 1 col for management.
              Now we can just use a proper grid or maybe just standard stacked sections if 2/3 is too wide?
              Let's keep the existing 2/3 layout logic but extend it effectively.
          */}
          <div className="xl:col-span-3 space-y-6">
            <IdentityCard user={user} roles={roles} />
            <div className="grid gap-6 md:grid-cols-2">
              <BasicInfoSection
                user={user}
                onEdit={() => setShowEdit("user")}
              />
              <SellerInfoSection
                seller={seller}
                gstProfile={gstProfile}
                onEdit={() => {}}
              />
              <SecuritySection user={user} />
              <ActivitySection user={user} />
            </div>
          </div>
        </div>
      )}

      {user && (
        <ConfirmationDialog
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          title="Delete User"
          description={`Are you sure you want to delete ${user.name}? This action cannot be undone.`}
          confirmText="Delete User"
          type="verification" // Implies variant='danger' and verificationText='DELETE'
          // verificationText="DELETE" // Optional redundant override, 'verification' defaults to 'DELETE'
          loading={deleting}
        />
      )}
    </div>
  );
}
