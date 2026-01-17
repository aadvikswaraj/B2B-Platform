"use client";
import React from 'react';

const statusStyles = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 ring-emerald-400/30',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 ring-amber-400/30',
  suspended: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 ring-orange-400/30',
  banned: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 ring-rose-400/30',
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 ring-gray-400/20'
};

export default function UserStatusPill({ status }) {
  const cls = statusStyles[status] || statusStyles.default;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset capitalize ${cls}`}>{status}</span>
  );
}
