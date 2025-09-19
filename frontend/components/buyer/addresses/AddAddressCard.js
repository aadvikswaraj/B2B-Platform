'use client';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function AddAddressCard(){
  return (
    <Link
      href="/myaccount/addresses/new"
      className="hidden md:flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-white/70 p-5 text-center hover:border-gray-400 hover:bg-gray-50 transition"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-600">
        <PlusIcon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800">Add Address</p>
        <p className="text-xs text-gray-500 mt-0.5">Create a new saved location</p>
      </div>
    </Link>
  );
}
