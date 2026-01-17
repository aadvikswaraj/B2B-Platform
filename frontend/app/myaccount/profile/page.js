'use client';

import { useEffect, useState } from 'react';
import { api } from '@/utils/api/base';
import TabbedProfileForms from '@/components/buyer/profile/TabbedProfileForms';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [addressOptions, setAddressOptions] = useState([]);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);
    const res = await api('/user/profile');
    setUser(res.data?.user || null);
    setBusiness(res.data?.business || null);
    setLoading(false);
  };

  const fetchAddresses = async () => {
    const res = await api('/user/address');
    setAddressOptions(res.data?.addresses || []);
  };

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">My Profile</h1>
      </div>
      <TabbedProfileForms
        user={user}
        business={business}
        addresses={addressOptions}
        onSaved={async () => {
          // Refresh after save to keep UI in sync
          await fetchProfile();
        }}
      />
    </div>
  );
}
