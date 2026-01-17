import React from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { TagIcon } from "@heroicons/react/24/outline";

export default function BrandPreview({ item: brand, actions, href }) {
  const router = useRouter();
  
  const handleClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) return;
    if (href) router.push(href);
  };
  
  return (
    <div 
        onClick={handleClick}
        className={clsx(
            "bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-3 transition-all",
            href && "cursor-pointer active:scale-[0.99] active:bg-gray-50"
        )}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                <TagIcon className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                <p className="text-xs text-gray-500">
                    by {brand.user?.name || "Unknown"}
                </p>
            </div>
        </div>
        <span className={clsx(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
            brand.kyc?.status === 'verified' ? "bg-emerald-100 text-emerald-700" :
            brand.kyc?.status === 'rejected' ? "bg-red-100 text-red-700" :
            "bg-amber-100 text-amber-700"
        )}>
            {brand.kyc?.status || 'pending'}
        </span>
      </div>
      
      <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-100">
        <span className="text-[10px] text-gray-400">
           Sent: {new Date(brand.createdAt).toLocaleDateString()}
        </span>
        
         <button
            onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/brand-verification/${brand._id}`);
            }}
            className="inline-flex items-center bg-blue-600 text-white rounded px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-blue-700"
         >
            Review
         </button>
      </div>
    </div>
  )
}
