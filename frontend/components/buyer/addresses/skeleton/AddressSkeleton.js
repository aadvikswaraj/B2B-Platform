'use client';

// Reusable skeleton card for an address while loading
export default function AddressSkeleton(){
  return (
    <div className="rounded-xl border border-gray-200 bg-white/70 p-5 shadow-sm animate-pulse">
      <div className="h-4 w-40 bg-gray-200 rounded mb-3" />
      <div className="space-y-2">
        <div className="h-3 w-2/3 bg-gray-100 rounded" />
        <div className="h-3 w-1/2 bg-gray-100 rounded" />
        <div className="h-3 w-1/3 bg-gray-100 rounded" />
      </div>
      <div className="mt-4 h-6 w-28 bg-gray-200 rounded" />
    </div>
  );
}
