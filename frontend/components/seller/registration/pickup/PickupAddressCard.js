"use client";
export default function PickupAddressCard({ address, selected, onSelect }) {
  const { id, line1, line2, city, state, pincode, contactName, contactPhone, isDefault } = address || {};
  return (
    <button
      type="button"
      onClick={() => onSelect?.(id)}
      className={`group relative text-left rounded-lg border p-4 transition hover:shadow-sm focus:outline-none ${selected ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/40' : 'border-gray-200 bg-white'}`}
      role="radio"
      aria-checked={selected}
    >
      <div className="mb-1 flex items-start justify-between gap-3">
        <h4 className={`line-clamp-1 text-sm font-semibold ${selected ? 'text-blue-700' : 'text-gray-900'}`}>{contactName || 'Pickup Contact'}</h4>
        <div className="flex items-center gap-1">
          {isDefault && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">Default</span>}
          {selected ? (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-medium text-white">Selected</span>
          ) : (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">Tap to select</span>
          )}
        </div>
      </div>
      <div className="text-xs leading-relaxed text-gray-600">
        <p className="line-clamp-2">{line1}{line2 ? `, ${line2}` : ''}</p>
        <p>{city}{state ? `, ${state}` : ''} {pincode ? `- ${pincode}` : ''}</p>
        {contactPhone && <p className="mt-1 text-gray-500">+91 {contactPhone}</p>}
      </div>
      <span className={`absolute right-3 top-3 h-2.5 w-2.5 rounded-full ${selected ? 'bg-blue-600' : 'bg-gray-300'}`} aria-hidden />
    </button>
  );
}
