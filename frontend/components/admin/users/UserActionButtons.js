"use client";
import React from 'react';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

export default function UserActionButtons({ onView, onEdit, onSuspend, onDelete, status }) {
  return (
    <div className="flex items-center gap-2">
      {onView && <button onClick={onView} className="rounded-md bg-white/60 hover:bg-white text-gray-700 shadow px-2 py-1 text-xs border border-gray-200">View</button>}
      {onEdit && <button onClick={onEdit} className="rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow px-2.5 py-1 text-xs">Edit</button>}
      {onSuspend && (
        <button onClick={onSuspend} className={`rounded-md px-2.5 py-1 text-xs font-medium shadow border ${status==='suspended' ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 text-white border-orange-600 hover:bg-orange-700'}`}>{status==='suspended'?'Activate':'Suspend'}</button>
      )}
      {onDelete && <button onClick={onDelete} className="rounded-md bg-rose-600 hover:bg-rose-700 text-white shadow px-2.5 py-1 text-xs">Delete</button>}
      <button className="hidden lg:inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-gray-100 border border-gray-200"><EllipsisHorizontalIcon className="w-4 h-4 text-gray-500"/></button>
    </div>
  );
}
