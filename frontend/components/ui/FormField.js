'use client';
import clsx from 'clsx';

export function FormField({ label, htmlFor, required, error, hint, className='', children, inline=false }){
  return (
    <div className={clsx('space-y-1', inline && 'sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:space-y-0', className)}>
      {label && <label htmlFor={htmlFor} className={clsx('block text-xs font-medium uppercase tracking-wide', error?'text-rose-600':'text-gray-600', inline && 'sm:pt-2')}>{label}{required && <span className="text-rose-500">*</span>}</label>}
        <div className={clsx(inline && 'sm:col-span-2')}>{children}
        {(error || hint) && (
          <p className={clsx('mt-1 text-xs', error?'text-rose-600':'text-gray-500')}>{error || hint}</p>
        )}
      </div>
    </div>
  );
}
