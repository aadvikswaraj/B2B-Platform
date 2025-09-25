"use client";

import { useEffect, useMemo, useState } from 'react';
import ManagementPanel from '@/components/common/ManagementPanel';
import { listSellerVerifications } from '@/utils/api/admin/sellerVerification';

export default function SellerVerificationListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState({ status: '' });

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const data = await listSellerVerifications({ page, pageSize, search, status: activeFilters.status });
      setItems(data.items || []);
      setTotalCount(data.totalCount || 0);
    } catch (e) { setError(e.message || 'Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, pageSize]);

  const columns = useMemo(() => ([
    {
      key: 'user',
      header: 'User',
      sortable: false,
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.user?.name || '—'}</div>
          <div className="text-gray-500">{row.user?.email}</div>
          <div className="text-gray-500">{row.user?.phone}</div>
        </div>
      )
    },
    {
      key: 'business',
      header: 'Business',
      sortable: false,
      render: (row) => (
        <div>
          <div className="text-gray-900">{row.profile?.businessCategory || '—'}</div>
          <div className="text-gray-500">Emp: {row.profile?.employeeCount || '—'}, Turnover: {row.profile?.annualTurnover || '—'}</div>
        </div>
      )
    },
    {
      key: 'step',
      header: 'Step',
      sortable: false,
      render: (row) => (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{row.step}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: false,
      render: (row) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${row.verificationStatus==='verified' ? 'bg-emerald-100 text-emerald-700' : row.verificationStatus==='rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{row.verificationStatus}</span>
      )
    }
  ]), []);

  return (
    <ManagementPanel
      title="Seller Verification"
      items={items}
      totalCount={totalCount}
      columns={columns}
      getRowId={(r)=> r.user?._id}
      itemLink={(r)=> r.user?._id ? `/admin/seller-verification/${r.user._id}` : null}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search name, email, phone"
      filters={[{ key: 'status', label: 'Status', options: [
        { value: 'pending', label: 'Pending' },
        { value: 'verified', label: 'Verified' },
        { value: 'rejected', label: 'Rejected' },
      ]}]}
      activeFilters={activeFilters}
      onFilterChange={(f)=>{ setActiveFilters(f); setPage(1); load(); }}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      onPageSizeChange={(s)=>{ setPageSize(s); setPage(1); }}
      loading={loading}
      primaryActions={[]}
      enableSorting={false}
    />
  );
}
