"use client";
import React from 'react';

function getInitials(name = '') {
  if(!name) return '?';
  const parts = name.trim().split(/\s+/);
  if(parts.length === 1) return parts[0].slice(0,2).toUpperCase();
  return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
}

export default function UserAvatar({ user, size = 40, className = '' }) {
  const initials = getInitials(user?.name || user?.email);
  const dimension = typeof size === 'number' ? `${size}px` : size;
  const hashSource = (user?.name || user?.email || 'user').toLowerCase();
  let hash = 0; for (let i=0;i<hashSource.length;i++) hash = (hash * 31 + hashSource.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  const bg = `hsl(${hue} 70% 45%)`;
  const fg = 'white';
  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-xs select-none ring-2 ring-white shadow ${className}`}
      style={{ width: dimension, height: dimension, background: bg, color: fg }}
      aria-label={user?.name || user?.email || 'User avatar'}
    >
      {initials}
    </div>
  );
}
