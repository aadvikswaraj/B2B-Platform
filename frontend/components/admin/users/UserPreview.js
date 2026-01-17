import React from 'react';
import UserAvatar from './UserAvatar';
import UserStatusPill from './UserStatusPill';
import Badge from '@/components/ui/Badge';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

export default function UserPreview({ item: user, actions, href }) {
  const router = useRouter();
  
  const handleClick = (e) => {
    // Prevent navigation if clicking on actions or interactive elements
    if (e.target.closest('button') || e.target.closest('a')) return;
    if (href) router.push(href);
  };

  return (
    <div 
        onClick={handleClick}
        className={clsx(
            "bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-3 relative transition-all",
            href && "cursor-pointer active:scale-[0.99] active:bg-gray-50"
        )}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-center">
          <UserAvatar user={user} className="w-10 h-10 text-sm" />
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 leading-tight">{user.name || "No Name"}</span>
            <span className="text-xs text-gray-500">{user.email}</span>
          </div>
        </div>
        <UserStatusPill status={user.userSuspended ? "suspended" : "active"} className="text-xs px-2 py-0.5" />
      </div>

      <div className="flex flex-wrap gap-1.5 min-h-[24px]">
         {user.isAdmin && <Badge variant="blue" size="sm">Admin</Badge>}
         {user.isSuperAdmin && <Badge variant="purple" size="sm">Super</Badge>}
         {user.isSeller && <Badge variant="amber" size="sm">Seller</Badge>}
         {!user.isSeller && !user.isAdmin && <Badge variant="gray" size="sm">Buyer</Badge>}
         {user.adminRole?.roleName && <Badge variant="emerald" size="sm">{user.adminRole.roleName}</Badge>}
      </div>
      
      <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-100">
        <span className="text-[10px] text-gray-400">
            Added {new Date(user.createdAt).toLocaleDateString()}
        </span>
        
        <div className="flex items-center gap-2">
            {actions.map((action, idx) => (
                <button
                    key={idx}
                    onClick={(e) => {
                        e.stopPropagation();
                        action.onClick?.();
                    }}
                    className={clsx(
                        "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border",
                        action.danger 
                            ? "border-red-100 text-red-600 bg-red-50 hover:bg-red-100" 
                            : "border-blue-100 text-blue-600 bg-blue-50 hover:bg-blue-100"
                    )}
                    title={action.label}
                >
                    {action.icon && <action.icon className="w-3.5 h-3.5" />}
                    <span className="hidden xs:inline">{action.label}</span>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
}
