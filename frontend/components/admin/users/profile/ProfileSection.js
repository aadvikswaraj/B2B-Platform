"use client";
import React from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

export default function ProfileSection({ title, description, children, onEdit, columns = 2 }) {
  // Map allowed columns to Tailwind classes (avoid dynamic class names not picked by JIT)
  const colClassMap = {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4'
  };
  const gridCols = colClassMap[columns] || colClassMap[2];
  return (
    <section className="rounded-xl bg-white shadow border border-gray-100 p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold tracking-wide uppercase text-gray-700">{title}</h3>
          {description && <p className="mt-1 text-xs text-gray-500 max-w-prose">{description}</p>}
        </div>
        {onEdit && (
          <button onClick={onEdit} className="inline-flex items-center gap-1 rounded-md bg-gray-800 text-white text-xs font-medium px-3 py-1.5 hover:bg-gray-700">
            <PencilSquareIcon className="w-4 h-4"/>
            Edit
          </button>
        )}
      </div>
      <div className={`grid grid-cols-1 ${gridCols} gap-4`}>{children}</div>
    </section>
  );
}
