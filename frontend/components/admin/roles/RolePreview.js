import React from 'react';
import Badge from '@/components/ui/Badge';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

export default function RolePreview({ item: role, actions, href }) {
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
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <ShieldCheckIcon className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-semibold text-gray-900">{role.roleName}</h3>
                <p className="text-xs text-gray-500">
                    {role.isSuperAdmin ? "Super Admin Access" : (
                        `${Object.keys(role.permissions || {}).length} module permissions`
                    )}
                </p>
            </div>
        </div>
        <Badge variant={role.isActive ? "emerald" : "red"} className="text-xs">
            {role.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-100">
        <div className="text-[10px] text-gray-400 flex flex-col">
            <span>Last updated</span>
            <span>{new Date(role.updatedAt).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center gap-2">
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
                            : "border-indigo-100 text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
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
