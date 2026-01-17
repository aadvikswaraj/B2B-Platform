'use client';

import { useEffect, useState } from 'react';
import AddressAPI from '@/utils/api/common/addresses';
import Button from '@/components/ui/Button';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import AddressSkeleton from '@/components/buyer/addresses/skeleton/AddressSkeleton';
import AddressCard from '@/components/buyer/addresses/AddressCard';
import EmptyState from '@/components/buyer/addresses/EmptyState';
import AddAddressCard from '@/components/buyer/addresses/AddAddressCard';
import Link from 'next/link';



export default function AddressesPage(){
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [settingDefault, setSettingDefault] = useState(null);

  const refresh = async ()=>{
    setLoading(true);
    const res = await AddressAPI.list();
    let list = res?.data?.addresses || [];
    // Server now returns isDefault; no client simulation needed
    setAddresses(list);
    setLoading(false);
  };

  useEffect(()=>{ refresh(); },[]);

  const remove = async (addr)=>{
    if (!confirm('Delete this address?')) return;
    setDeleting(addr._id);
    const res = await deleteAddress(addr._id);
    if (res.success) await refresh();
    setDeleting(null);
  };

  const handleSetDefault = async (addr)=>{
    setSettingDefault(addr._id);
    const res = await AddressAPI.setDefault(addr._id);
    if (res.success) {
      await refresh();
    }
    setSettingDefault(null);
  };

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6">
      <div className="flex items-center justify-between gap-4 pt-2">
        <h1 className="text-lg font-semibold text-gray-900 tracking-tight">My Addresses</h1>
        <Button as={Link} href="/myaccount/addresses/new" size="sm" icon={PlusIcon} disabled={loading}>Add Address</Button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({length:6}).map((_,i)=>(<AddressSkeleton key={i} />))}
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AddAddressCard />
          {addresses.map(a => (
            <div key={a._id} className="relative">
              {(deleting === a._id || settingDefault === a._id) && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm">
                  <ArrowPathIcon className="h-6 w-6 animate-spin text-gray-500" />
                </div>) }
              <AddressCard addr={a} onDelete={remove} onSetDefault={handleSetDefault} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
