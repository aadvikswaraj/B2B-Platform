"use client";
export default function AddressCard({ address, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(address.id)}
      className={`text-left relative rounded-lg border p-4 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${selected ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/50' : 'border-slate-200 bg-white'}`}
      role="radio"
      aria-checked={selected}
    >
      <div className="flex justify-between gap-2">
        <h3 className="font-medium text-sm">{address.name}</h3>
        {address.isDefault && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Default</span>}
      </div>
      <p className="mt-1 text-xs text-slate-600">{address.phone}</p>
      <p className="mt-1 text-xs text-slate-600">{address.line1}, {address.city}, {address.postalCode}, {address.country}</p>
      <span className={`absolute top-2 right-2 h-3 w-3 rounded-full ${selected ? 'bg-blue-600' : 'bg-slate-300'}`} aria-hidden />
    </button>
  );
}
