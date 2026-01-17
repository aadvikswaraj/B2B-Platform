'use client';
import clsx from 'clsx';

const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition';
const sizes = {
  xs: 'text-[11px] px-2.5 py-1.5',
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-sm px-5 py-2.5',
  xl: 'text-base px-6 py-3'
};
const variants = {
  solid: 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-600',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-indigo-500',
  subtle: 'bg-gray-300 text-gray-700 focus-visible:ring-indigo-500',
  danger: 'bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-600',
  ghost: 'text-gray-600 hover:bg-gray-100 focus-visible:ring-indigo-500',
  success: 'bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-600'
};

export default function Button({ as:Comp="button", variant='solid', size='md', className='', icon:Icon, loading=false, disabled, children, ...rest }){
  const isDisabled = disabled || loading;
  return (
    <Comp
      className={clsx(base, sizes[size], variants[variant], className)}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin text-current" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      )}
      {Icon && !loading && <Icon className='h-4 w-4' />}
      {children}
    </Comp>
  );
}
