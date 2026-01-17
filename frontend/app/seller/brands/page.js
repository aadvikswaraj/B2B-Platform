"use client";
import React from 'react';
import ManagementPanel from '@/components/common/ManagementPanel';
import { brandColumns } from '@/components/seller/brands/columns';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import BrandsAPI from '@/utils/api/seller/brands';
import { useListQuery } from '@/utils/listQueryManager';
import { useRouter } from "next/navigation";

export default function ManageBrandsPage(){
  const router = useRouter();
  
  const { items, totalCount, loading, handlers } = useListQuery({
    apiFn: BrandsAPI.list,
  });

  const handleDelete = async (item) => {
    if (!confirm(`Are you sure you want to delete brand "${item.name}"?`)) return;
    try {
        await BrandsAPI.delete(item._id);
        handlers.onRefresh();
    } catch(err) {
        console.error(err);
        alert("Failed to delete brand");
    }
  };

  const rowActions = (item) => [
    { label: 'Preview', icon: EyeIcon, onClick: () => router.push(`/seller/brands/${item._id}`) },
    { label: 'Edit', icon: PencilIcon, onClick: () => router.push(`/seller/brands/${item._id}/edit`) },
    { label: 'Delete', icon: TrashIcon, onClick: () => handleDelete(item) }
  ];

  const filterDefs = [
    { key: 'status', label: 'Status', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'verified', label: 'Verified' },
      { value: 'rejected', label: 'Rejected' },
    ]}
  ];

  return (
    <div>
      <ManagementPanel
        title="Brands"
        items={items}
        totalCount={totalCount}
        columns={brandColumns}
        itemLink={(b) => `/seller/brands/${b._id}`}
        filters={filterDefs}
        rowActions={rowActions}
        primaryActions={[{ type: 'link', href: '/seller/brands/new', label: 'Create Brand', icon: PlusIcon }]}
        loading={loading}
        {...handlers}
      />
    </div>
  );
}
