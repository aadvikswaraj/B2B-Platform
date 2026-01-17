"use client";
import React from 'react';
import clsx from 'clsx';

/**
 * Spinner - inline loading indicator.
 *
 * Props:
 * - size: tailwind size keyword or numeric px ("xs" | "sm" | "md" | "lg" | "xl" | number)
 * - variant: "primary" | "neutral" | "inverse"
 * - className: extra classes
 * - label: accessible text label (defaults to "Loading...")
 * - srOnly: hide label visually (default true)
 */
export function Spinner({ size = 'md', variant = 'primary', className, srOnly = true }) {
  const sizeMap = {
    xs: 'h-3 w-3 border-[2px] after:border-[2px]',
    sm: 'h-4 w-4 border-[2.5px] after:border-[2.5px]',
    md: 'h-6 w-6 border-2 after:border-2',
    lg: 'h-8 w-8 border-[3px] after:border-[3px]',
    xl: 'h-12 w-12 border-[4px] after:border-[4px]'
  };
  const numeric = typeof size === 'number';
  const dim = numeric ? `h-[${size}px] w-[${size}px]` : sizeMap[size] || sizeMap.md;

  const variantMap = {
    primary: 'text-indigo-600',
    neutral: 'text-gray-400',
    inverse: 'text-white'
  };

  return (
    <span
      role="status"
      aria-live="polite"
      className={clsx('relative inline-flex items-center justify-center', className)}
    >
      <span
        className={clsx(
          'block animate-spin rounded-full border-current border-t-transparent',
          'after:content-[""] after:absolute after:inset-0 after:rounded-full after:border-current after:border-b-transparent after:opacity-40',
          dim,
          variantMap[variant]
        )}
      />
    </span>
  );
}

/**
 * ScreenSpinner - full-screen overlay spinner for global loading states.
 *
 * Props:
 * - visible: boolean controls mount
 * - backdrop: "light" | "dark" (affects background & spinner variant)
 * - text: optional descriptive text
 */
export function ScreenSpinner({ visible, backdrop = 'light', text = 'Loading...' }) {
  if (!visible) return null;
  const dark = backdrop === 'dark';
  return (
    <div
      className={clsx(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 px-6',
        dark ? 'bg-gray-900/80 backdrop-blur-sm' : 'bg-white/70 backdrop-blur'
      )}
      role="alert"
      aria-busy="true"
      aria-live="assertive"
    >
      <Spinner size="xl" variant={dark ? 'inverse' : 'primary'} srOnly={false} className="drop-shadow" />
      <p className={clsx('text-sm font-medium tracking-wide', dark ? 'text-gray-200' : 'text-gray-600')}>{text}</p>
    </div>
  );
}

/**
 * Example usage:
 *
 * import { ScreenSpinner } from '@/components/ui/Spinner';
 * const Page = () => {
 *   const [loading, setLoading] = useState(true);
 *   return <>
 *     <ScreenSpinner visible={loading} backdrop="dark" text="Fetching dashboard" />
 *     <main className="p-6">Content</main>
 *   </>
 * };
 */
export default Spinner;
