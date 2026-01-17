'use client';
import { useCallback } from 'react';

const ROLES = [
  { key: 'buyer', label: 'Buyer', desc: 'Can browse & purchase', color: 'bg-sky-500/10 text-sky-600 ring-sky-500/20' },
  { key: 'seller', label: 'Seller', desc: 'Can list products & manage orders', color: 'bg-teal-500/10 text-teal-600 ring-teal-500/20' },
  { key: 'admin', label: 'Admin', desc: 'Administrative capabilities', color: 'bg-indigo-500/10 text-indigo-600 ring-indigo-500/20' }
];

export default function RoleMultiSelector({ value, onChange }){
  const toggle = useCallback(role => () => {
    onChange(prev => ({ ...prev, [role]: !prev[role] }));
  }, [onChange]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {ROLES.map(r => {
        const active = !!value[r.key];
        return (
          <button key={r.key} type="button" onClick={toggle(r.key)}
            className={`group relative w-full text-left rounded-xl border p-4 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${active ? 'border-transparent ring-2 ring-offset-2 ring-indigo-500 bg-gradient-to-br from-white to-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-300'} `}>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${r.color}`}>{r.label}</span>
            <p className="mt-2 text-xs text-gray-600 leading-snug pr-6">{r.desc}</p>
            {active && <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-indigo-500" />}
          </button>
        );
      })}
    </div>
  );
}
