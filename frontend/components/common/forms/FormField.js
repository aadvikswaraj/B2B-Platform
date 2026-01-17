'use client';

export default function FormField({ label, error, children }){
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label && <span className="text-gray-700">{label}</span>}
      {children}
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </label>
  );
}
