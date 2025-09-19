'use client';

import { useEffect, useState } from 'react';
import AddressAPI from '@/utils/api/addresses';
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
    // (Future) server could return isDefault; for now, mark first as default if any
    if (list.length) {
      const existingDefault = list.find(a=>a.isDefault);
      if (!existingDefault) list = list.map((a,i)=> ({...a, isDefault: i===0 }));
    }
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
    // Placeholder client-side default logic until backend endpoint exists
    setSettingDefault(addr._id);
    setAddresses(prev=> prev.map(a=> ({...a, isDefault: a._id === addr._id})));
    setTimeout(()=> setSettingDefault(null), 400); // simulate async
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
          {addresses.map(a => (
            <div key={a._id} className="relative">
              {(deleting === a._id || settingDefault === a._id) && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm">
                  <ArrowPathIcon className="h-6 w-6 animate-spin text-gray-500" />
                </div>) }
              <AddressCard addr={a} onDelete={remove} onSetDefault={handleSetDefault} />
            </div>
          ))}
          <AddAddressCard />
        </div>
      )}
    </div>
  );
}
