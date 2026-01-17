import React from 'react';

export const brandColumns = [
  {
    key: 'name',
    header: 'Brand',
    sortable: true,
    render: (b) => (
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-900">{b.name}</span>
      </div>
    )
  },
  {
    key: 'kyc',
    header: 'Status',
    sortable: true,
    className: 'w-40',
    render: (b) => (
      <span className={`text-xs px-2 py-0.5 rounded-full border ${b.kyc?.status === 'verified' ? 'bg-green-50 text-green-700 border-green-200' : b.kyc?.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
        {b.kyc?.status || 'pending'}
      </span>
    )
  },
  {
    key: 'createdAt',
    header: 'Created',
    sortable: true,
    className: 'w-48',
    render: (b) => new Date(b.createdAt).toLocaleString()
  }
];
