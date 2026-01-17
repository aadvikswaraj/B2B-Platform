'use client';
import clsx from 'clsx';

export function Card({ as:Comp='div', className='', padded=true, shadow=true, border=true, children, ...rest }){
  return (
    <Comp className={clsx('bg-white rounded-lg', shadow && 'shadow-sm', border && 'border border-gray-200', padded && 'p-4 md:p-6', className)} {...rest}>{children}</Comp>
  );
}

export function CardHeader({ title, actions, className='' }){
  return (
    <div className={clsx('mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between', className)}>
      {title && <h2 className="text-base font-semibold text-gray-900">{title}</h2>}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardSection({ title, description, children, actions, className='' }){
  return (
    <section className={clsx('space-y-3', className)}>
      {(title || description || actions) && (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && <h3 className="text-sm font-medium text-gray-900">{title}</h3>}
            {description && <p className="text-xs text-gray-500 max-w-prose">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
