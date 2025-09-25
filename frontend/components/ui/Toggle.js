'use client';
import clsx from 'clsx';

export function Toggle({ checked, onChange, disabled, size='md', className='', ...rest }){
  const sizes = { sm:{wrapper:'w-8 h-4',circle:'h-3.5 w-3.5 translate-x-0.5',circleOn:'translate-x-4'}, md:{wrapper:'w-11 h-6',circle:'h-5 w-5 translate-x-0.5',circleOn:'translate-x-5'}, lg:{wrapper:'w-14 h-7',circle:'h-6 w-6 translate-x-1',circleOn:'translate-x-7'} };
  const s = sizes[size];
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={()=>!disabled && onChange?.(!checked)} className={clsx('inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2', checked?'bg-indigo-600':'bg-gray-300', disabled && 'opacity-50 cursor-not-allowed', s.wrapper, className)} {...rest}>
      <span className={clsx('pointer-events-none inline-block rounded-full bg-white shadow transform transition', s.circle, checked && s.circleOn)} />
    </button>
  );
}