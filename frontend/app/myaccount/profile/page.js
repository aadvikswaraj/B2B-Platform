"use client";

import { useEffect, useState } from "react";
import { api } from "@/utils/api/base";
import UnifiedProfileForm from "@/components/common/profile/UnifiedProfileForm";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [addressOptions, setAddressOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);
    const res = await api("/user/profile");
    setUser(res.data?.user || null);
    setBusiness(res.data?.business || null);
    setLoading(false);
  };

  const fetchAddresses = async () => {
    const res = await api("/user/address");
    setAddressOptions(res.data?.addresses || []);
  };

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="h-48 sm:h-56 rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300" />

        {/* Section skeletons */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-100 rounded-lg" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-12 bg-gray-100 rounded-lg" />
                <div className="h-12 bg-gray-100 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
          My Profile
        </h1>
      </div>
      <UnifiedProfileForm
        user={user}
        business={business}
        addresses={addressOptions}
        mode="buyer"
        onSaved={async () => {
          await fetchProfile();
        }}
      />
    </div>
  );
}
