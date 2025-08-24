"use client";
import React from 'react';

export default function Field({ label, value, placeholder='—', span=1 }) {
  return (
    <div className={`flex flex-col gap-1 col-span-${span}`}>
      <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">{label}</span>
      <span className="text-sm text-gray-800 break-words">{value || placeholder}</span>
    </div>
  );
}
