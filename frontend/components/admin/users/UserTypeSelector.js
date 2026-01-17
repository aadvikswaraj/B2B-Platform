'use client';
import { useCallback } from 'react';

const TYPES = [
  { key: 'buyer', label: 'Buyer', desc: 'Standard purchasing account', color: 'bg-sky-500/10 text-sky-600 ring-sky-500/20' },
  { key: 'seller', label: 'Seller', desc: 'List and manage products', color: 'bg-teal-500/10 text-teal-600 ring-teal-500/20' },
  { key: 'admin', label: 'Admin', desc: 'Platform administration access', color: 'bg-indigo-500/10 text-indigo-600 ring-indigo-500/20' }
];

export default function UserTypeSelector({ value, onChange }) {
  const handle = useCallback((key)=>()=>onChange(key), [onChange]);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {TYPES.map(t => {
        const active = value === t.key;
        return (
          <button type="button" key={t.key} onClick={handle(t.key)}
            className={`relative w-full text-left rounded-xl border p-4 transition shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${active ? 'border-transparent ring-2 ring-offset-2 ring-indigo-500 bg-gradient-to-br from-white to-indigo-50' : 'border-gray-200 bg-white'} `}>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${t.color}`}>{t.label}</span>
            <p className="mt-2 text-xs text-gray-600 leading-snug">{t.desc}</p>
            {active && <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-indigo-500" />}
          </button>
        );
      })}
    </div>
  );
}
