import React from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

export default function BuyRequirementPreview({ item: req, actions, href }) {
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
             <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <ShoppingCartIcon className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 line-clamp-1">{req.requirementTitle || req.productName || "Requirement"}</h3>
                <p className="text-xs text-gray-500">
                    Qty: {req.quantity} {req.unit}
                </p>
            </div>
        </div>
        <span className={clsx(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
            req.status === 'active' ? "bg-emerald-100 text-emerald-700" :
            req.status === 'fulfilled' ? "bg-blue-100 text-blue-700" :
            "bg-gray-100 text-gray-700"
        )}>
            {req.status}
        </span>
      </div>
      
      <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-100">
        <div className="text-[10px] text-gray-400 flex flex-col">
           <span>{req.user?.name || "Unknown User"}</span>
           <span>{new Date(req.createdAt).toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center gap-2">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/admin/buy-requirements/${req._id}`);
                }}
                className="inline-flex items-center bg-blue-600 text-white rounded px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-blue-700"
            >
                Review
            </button>
            {actions.map((action, idx) => (
                <button
                    key={idx}
                    onClick={(e) => {
                        e.stopPropagation();
                        action.onClick?.();
                    }}
                    className={clsx(
                        "flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border",
                        action.danger 
                            ? "border-red-100 text-red-600 bg-red-50 hover:bg-red-100" 
                            : "border-blue-100 text-blue-600 bg-blue-50 hover:bg-blue-100"
                    )}
                >
                    {action.icon && <action.icon className="w-3.5 h-3.5" />}
                    <span>{action.label}</span>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
}
