'use client';
import clsx from 'clsx';

export function Table({ children, className='' }){
  return <div className={clsx('overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm', className)}>
    <table className="min-w-full divide-y divide-gray-200">{children}</table>
  </div>;
}

export function THead({ children }){
  return <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">{children}</thead>;
}

export function TBody({ children }){ return <tbody className="divide-y divide-gray-100 text-sm">{children}</tbody>; }

export function Tr({ children, className='' }){ return <tr className={clsx('hover:bg-gray-50', className)}>{children}</tr>; }

export function Th({ children, className='' }){ return <th scope="col" className={clsx('px-4 py-2.5 text-left font-semibold', className)}>{children}</th>; }

export function Td({ children, className='' }){ return <td className={clsx('px-4 py-2.5 align-top text-gray-700', className)}>{children}</td>; }
