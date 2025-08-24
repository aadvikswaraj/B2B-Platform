'use client';
import clsx from 'clsx';

export function Checkbox({ label, className='', invalid, description, ...rest }){
  return (
    <label className={clsx('flex items-start gap-2 text-sm', className)}>
      <input type="checkbox" className={clsx('mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500', invalid && 'border-rose-400')} {...rest} />
      <span className="select-none">
        <span className={clsx(invalid?'text-rose-600':'text-gray-800')}>{label}</span>
        {description && <span className="block text-xs text-gray-500 leading-snug">{description}</span>}
      </span>
    </label>
  );
}
