"use client";
import React from 'react';

const roleColors = {
  admin: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 ring-indigo-400/30',
  seller: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 ring-teal-400/30',
  buyer: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 ring-sky-400/30',
  unknown: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 ring-gray-400/20'
};

export default function RoleBadges({ roles = [], size = 'sm' }) {
  return (
    <div className="flex flex-wrap gap-1">
      {roles.length === 0 && <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${roleColors.unknown}`}>unknown</span>}
      {roles.map(r => (
        <span key={r} className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${roleColors[r] || roleColors.unknown}`}>{r}</span>
      ))}
    </div>
  );
}
