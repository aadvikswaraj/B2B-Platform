"use client"
export default function LoadingRoles(){
  // Route-level loading UI for /admin/roles
  // Responsive skeletons (table for md+, cards for mobile)
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Action Bar Skeleton */}
      <div className="flex items-center justify-end">
        <div className="h-9 w-32 rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" aria-hidden="true" />
      </div>

      {/* Desktop Table Skeleton */}
      <div className="hidden md:block rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
          <div className="h-5 w-28 bg-gray-200 rounded" />
          <div className="flex gap-2">
            <div className="h-8 w-40 bg-gray-200 rounded" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 6 }).map((_,i)=>(
            <div key={i} className="grid grid-cols-4 gap-4 px-5 py-4 text-sm">
              <div className="flex flex-col gap-2">
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-100 rounded" />
              </div>
              <div className="h-5 w-12 bg-gray-200 rounded" />
              <div className="h-5 w-10 bg-gray-200 rounded" />
              <div className="h-5 w-24 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between text-xs text-gray-500">
          <div className="h-4 w-32 bg-gray-100 rounded" />
          <div className="flex gap-2 items-center">
            <div className="h-8 w-8 bg-gray-100 rounded" />
            <div className="h-8 w-8 bg-gray-100 rounded" />
            <div className="h-8 w-8 bg-gray-100 rounded" />
          </div>
        </div>
      </div>

      {/* Mobile Card Skeletons */}
      <div className="grid gap-4 md:hidden">
        {Array.from({ length: 6 }).map((_,i)=>(
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-36 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-100 rounded" />
              </div>
              <div className="h-5 w-12 bg-gray-200 rounded" />
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              <div className="h-3 w-16 bg-gray-100 rounded" />
              <div className="h-3 w-20 bg-gray-100 rounded" />
              <div className="h-3 w-14 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .animate-shimmer { 
          background-size: 400% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }
        @keyframes shimmer { 
          0% { background-position: 0% 50%; }
          100% { background-position: -135% 50%; }
        }
        .animate-fadeIn { animation: fadeIn .3s ease; }
        @keyframes fadeIn { from { opacity:0; transform: translateY(4px);} to { opacity:1; transform: translateY(0);} }
      `}</style>
    </div>
  );
}
