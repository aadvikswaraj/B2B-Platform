'use client';
import { MapPinIcon, PlusIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function EmptyState(){
  return (
    <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-600">
        <MapPinIcon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-gray-800">No addresses yet</h3>
      <p className="mt-1 text-sm text-gray-600">Add your first address to speed up checkout.</p>
      <Button as={Link} href="/myaccount/addresses/new" size="sm" className="mt-5" icon={PlusIcon}>Add Address</Button>
    </div>
  );
}
