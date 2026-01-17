'use client';

import { useMemo } from 'react';
import ManagementPanel from '@/components/common/ManagementPanel';
import { ProductVerificationAPI } from '@/utils/api/admin/productVerification';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/components/ui/AlertManager';
import { useListQuery } from '@/utils/listQueryManager';

export default function ProductVerificationListPage() {
  const router = useRouter();
  const pushAlert = useAlert();
  
  // Single hook - all state managed internally
  const { items, totalCount, loading, handlers } = useListQuery({
    apiFn: ProductVerificationAPI.list,
    initialQuery: { filters: { status: 'pending' } },
  });

  const columns = useMemo(()=>[
    {
      key: 'product', header: 'Product', render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.title || '—'}</div>
          <div className="text-gray-500">{row.category?.name || '—'}</div>
        </div>
      )
    },
    {
      key: 'seller', header: 'Seller', render: (row) => (
        <div>
          <div className="text-gray-900">{row.seller?.name || '—'}</div>
          <div className="text-gray-500">{row.seller?.email || '—'}</div>
        </div>
      )
    },
    { key: 'price', header: 'Price', render: (row) => (
      <div className="text-gray-900">{row.price} {row.currency}</div>
    ) },
    { key: 'images', header: 'Images', render: (row) => (
      <div className="text-gray-700">{row.imagesCount || 0}</div>
    ) },
    { key: 'status', header: 'Status', render: (row) => (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${row.moderationStatus==='approved'?'bg-emerald-100 text-emerald-700':row.moderationStatus==='rejected'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}`}>{row.moderationStatus}</span>
    ) },
    { key: 'actions', header: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <Button size="sm" onClick={(e)=>{ e.stopPropagation(); router.push(`/admin/product-verification/${row._id}`); }}>Review</Button>
      </div>
    ) },
  ], [router]);

  return (
    <div className="mt-5">
      <ManagementPanel
        title="Product Verification"
        items={items}
        totalCount={totalCount}
        loading={loading}
        columns={columns}
        getRowId={(r) => r._id}
        itemLink={(r) => r._id ? `/admin/product-verification/${r._id}` : null}
        {...handlers}
        searchPlaceholder="Search product title or seller"
        filters={[{ key: 'status', label: 'Status', options: [{ value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }] }]}
        primaryActions={[]}
        enableSorting={false}
      />
    </div>
  );
}
