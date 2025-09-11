import clsx from 'clsx';

export function shimmerBase(className=''){
  return clsx('relative overflow-hidden bg-gray-200 rounded', className);
}
export function Shimmer({className=''}){
  return (
    <div className={shimmerBase(className)}>
      <span className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

/* Tailwind keyframes suggestion (ensure in tailwind config if using JIT it's fine):
@keyframes shimmer { 100% { transform: translateX(100%); } }
*/
