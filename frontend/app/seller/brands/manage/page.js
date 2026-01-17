"use client";
import React, { useEffect, useMemo, useState } from 'react';
import ManagementPanel from '@/components/common/ManagementPanel';
import { brandColumns } from '@/components/seller/brands/columns';
import { listSellerBrands } from '@/utils/api/seller/brands.js';
import { PlusIcon, EyeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ManageBrandsPage(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '' });

  async function load(){
    setLoading(true);
    const json = await listSellerBrands({ status: filters.status, search });
    if (json?.success){
      setItems(json.data.items || []);
    } else {
      setItems([]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [search, filters]);

  const rowActions = (item) => [
    { label: 'View', icon: EyeIcon, onClick: () => { window.location.href = `/seller/brands/${item._id}`; } },
    ...(item.kyc?.status !== 'verified' ? [{ label: 'Resubmit', icon: ArrowPathIcon, onClick: () => { window.location.href = `/seller/brands/${item._id}/manage`; } }] : [])
  ];

  const filterDefs = [
    { key: 'status', label: 'Status', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'verified', label: 'Verified' },
      { value: 'rejected', label: 'Rejected' },
    ]}
  ];

  return (
    <div className="p-4">
      <ManagementPanel
        title="Brands"
        items={items}
        totalCount={items.length}
        columns={brandColumns}
        itemLink={(b) => `/seller/brands/${b._id}`}
        onSearchChange={setSearch}
        search={search}
        filters={filterDefs}
        activeFilters={filters}
        onFilterChange={setFilters}
        rowActions={rowActions}
        primaryActions={[{ type: 'link', href: '/seller/brands/new', label: 'Create Brand', icon: PlusIcon }]}
        loading={loading}
      />
    </div>
  );
}
