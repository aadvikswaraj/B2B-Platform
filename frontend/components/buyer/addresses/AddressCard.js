'use client';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { PencilSquareIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';

export default function AddressCard({ addr, onDelete, onSetDefault }) {
  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900 truncate">{addr.name}</p>
            <span className="text-xs font-medium text-gray-500">{addr.phone}</span>
            {addr.isDefault && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700 border border-gray-200">
                <StarIcon className="h-3 w-3" /> Default
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-700 leading-snug">
            {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}{addr.landmark ? `, ${addr.landmark}`:''}<br />
            {addr.city}, {addr.state} {addr.pincode}<br />
            <span className="text-gray-500 text-xs">{addr.country}</span>
          </p>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <Button as={Link} href={`/myaccount/addresses/${addr._id}`} size="xs" variant="outline" icon={PencilSquareIcon}>Edit</Button>
          <Button size="xs" variant="ghost" onClick={()=>onDelete(addr)} className="text-red-600 hover:bg-red-50" icon={TrashIcon}>Delete</Button>
        </div>
      </div>
      {!addr.isDefault && (
        <div className="mt-4">
          <Button size="xs" variant="subtle" onClick={()=>onSetDefault(addr)} icon={StarIcon} className="text-gray-700 hover:text-gray-900">Set as Default</Button>
        </div>
      )}
    </div>
  );
}
