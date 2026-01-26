"use client";

import { Check, MapPin, Phone } from "lucide-react";

export default function AddressCard({ address, selected, onSelect }) {
  const {
    id,
    line1,
    line2,
    city,
    state,
    pincode,
    contactName,
    contactPhone,
    isDefault,
  } = address || {};

  return (
    <div
      onClick={() => onSelect?.(id)}
      className={`
        relative group cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-300
        ${
          selected
            ? "border-blue-600 bg-blue-50/50 shadow-md shadow-blue-900/5"
            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50"
        }
      `}
      role="radio"
      aria-checked={selected}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h4
                className={`text-base font-semibold truncate ${selected ? "text-blue-900" : "text-slate-900"}`}
              >
                {contactName || "Address Contact"}
              </h4>
              {isDefault && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">
                  Default
                </span>
              )}
            </div>

            <div className="flex items-start gap-2 text-sm text-slate-600 mb-3">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
              <div className="leading-relaxed">
                <p>{line1}</p>
                {line2 && <p>{line2}</p>}
                <p>
                  {city}
                  {city && state ? ", " : ""}
                  {state}
                  {pincode ? ` - ${pincode}` : ""}
                </p>
              </div>
            </div>

            {contactPhone && (
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>+91 {contactPhone}</span>
              </div>
            )}
          </div>

          <div
            className={`
            flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors duration-200
            ${
              selected
                ? "border-blue-600 bg-blue-600"
                : "border-slate-300 bg-transparent group-hover:border-slate-400"
            }
          `}
          >
            {selected && (
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
