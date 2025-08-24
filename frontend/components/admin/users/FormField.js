'use client';
export default function FormField({ label, children, required, description }) {
  return (
    <label className="space-y-1 block">
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">{label}</span>
        {required && <span className="text-rose-500">*</span>}
      </div>
      {description && <p className="text-[11px] text-gray-500 leading-snug">{description}</p>}
      {children}
    </label>
  );
}
