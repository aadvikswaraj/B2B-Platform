'use client';
import clsx from 'clsx';

export function Input({ className='', invalid, size='md', ...rest }){
  const sizes = { sm:'px-2.5 py-1.5 text-xs', md:'px-3 py-2.5 text-sm', lg:'px-4 py-3 text-sm' };
  return (
    <input
      className={clsx('w-full rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-400', invalid?'border-rose-400':'border-gray-300', sizes[size], className)}
      {...rest}
    />
  );
}

export function Textarea({ className='', invalid, rows=3, ...rest }){
  return (
    <textarea rows={rows} className={clsx('w-full rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-400', invalid?'border-rose-400':'border-gray-300', className)} {...rest} />
  );
}

export function Select({ className='', invalid, size='md', children, ...rest }){
  const sizes = { sm:'px-2.5 py-1.5 text-xs', md:'px-3 py-2.5 text-sm', lg:'px-4 py-3 text-sm' };
  return (
    <select className={clsx('w-full rounded-md border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500', invalid?'border-rose-400':'border-gray-300', sizes[size], className)} {...rest}>
      {children}
    </select>
  );
}
