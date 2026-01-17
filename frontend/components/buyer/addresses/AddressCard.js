'use client';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { PencilSquareIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';

export default function AddressCard({ addr, onDelete, onSetDefault }) {
  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm transition hover:shadow-md flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900 truncate">{addr.name}</p>
            <span className="text-xs font-medium text-gray-500">{addr.phone}</span>
          </div>
          <p className="mt-1 text-sm text-gray-700 leading-snug">
            {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}{addr.landmark ? `, ${addr.landmark}`:''}<br />
            {addr.city}, {addr.state} {addr.pincode}<br />
            <span className="text-gray-500 text-xs">{addr.country}</span>
          </p>
        </div>
        {/* Actions (top-right) - desktop only */}
        <div className="hidden sm:flex sm:flex-col gap-2 shrink-0 w-auto">
          <Button as={Link} href={`/myaccount/addresses/${addr._id}`} size="sm" variant="outline" icon={PencilSquareIcon}>Edit</Button>
          <Button
            size="sm"
            variant="outline"
            onClick={()=>onDelete(addr)}
            className="border-rose-300 text-rose-700 hover:bg-rose-50"
            icon={TrashIcon}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Footer: always rendered to preserve height */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Default status or button */}
        <div>
          {addr.isDefault ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 border border-amber-200">
              <StarIcon className="h-3.5 w-3.5" /> Default address
            </span>
          ) : (
            <Button
              size="sm"
              variant="subtle"
              onClick={()=>onSetDefault(addr)}
              icon={StarIcon}
              className="text-gray-700 hover:text-gray-900"
            >
              Set as Default
            </Button>
          )}
        </div>

        {/* Mobile actions row */}
        <div className="flex sm:hidden gap-2 w-full">
          <Button as={Link} href={`/myaccount/addresses/${addr._id}`} size="sm" variant="outline" className="flex-1" icon={PencilSquareIcon}>Edit</Button>
          <Button
            size="sm"
            variant="outline"
            onClick={()=>onDelete(addr)}
            className="flex-1 border-rose-300 text-rose-700 hover:bg-rose-50"
            icon={TrashIcon}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
