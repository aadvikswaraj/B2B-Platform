"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ManagementPanel from '@/components/common/ManagementPanel';
import { BrandVerificationAPI } from '@/utils/api/admin/brandVerification';
import { useAlert } from '@/components/ui/AlertManager';
import { useListQuery } from '@/utils/listQueryManager';
import BrandPreview from '@/components/admin/brand-verification/BrandPreview';

// Brand Verification list using the shared ManagementPanel for consistent admin UX
export default function BrandVerificationListPage() {
  const router = useRouter();
  const pushAlert = useAlert();
  
  // Single hook - all state managed internally
  const { items: docs, totalCount, loading, handlers } = useListQuery({
    apiFn: BrandVerificationAPI.list,
    initialQuery: { filters: { status: 'pending' } },
  });

  // Columns definition for ManagementPanel
  const columns = [
    {
      key: 'name',
      header: 'Brand',
      sortable: true,
      render: (row) => <span className="font-medium text-gray-900">{row.name}</span>
    },
    {
      key: 'seller',
      header: 'Seller',
      render: (row) => row.user ? `${row.user.name} (${row.user.email})` : '—'
    },
    {
      key: 'kycStatus',
      header: 'Status',
      sortable: true,
      render: (row) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${row.kyc.status==='verified'?'bg-emerald-100 text-emerald-700':row.kyc.status==='rejected'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}`}>{row.kyc.status}</span>
      )
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (row) => <span className="text-gray-500">{new Date(row.createdAt).toLocaleDateString()}</span>
    },
    // Replace action dropdown with a simple Review button
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Link
          href={`/admin/brand-verification/${row._id}`}
          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={(e) => e.stopPropagation()}
          aria-label="Review brand verification"
        >
          Review
        </Link>
      )
    }
  ];

  // Filters config for ManagementPanel (mobile + desktop)
  const filters = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'verified', label: 'Verified' },
        { value: 'rejected', label: 'Rejected' }
      ]
    }
  ];

  return (
    <div className="mt-5">
      <ManagementPanel
        title="Brand Verification"
        items={docs}
        itemLink={(item) => `/admin/brand-verification/${item._id}`}
        totalCount={totalCount}
        loading={loading}
        columns={columns}
        {...handlers}
        searchPlaceholder="Search brand name"
        renderItem={(props) => <BrandPreview {...props} />}
        filters={filters}
      />
    </div>
  );
}