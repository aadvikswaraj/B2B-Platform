'use client';
import { Fragment } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

export default function Modal({ open, onClose, title, children, size='md', actions, closeOnBackdrop=true }){
  if(!open) return null;
  return createPortal(
    <Fragment>
      <div className="fixed inset-0 z-[200] bg-black/30 backdrop-blur-sm" onClick={()=>closeOnBackdrop && onClose?.()} />
      <div className="fixed inset-0 z-[201] flex items-start justify-center overflow-y-auto p-4 sm:p-6">
        <div className={clsx('relative mt-20 w-full max-w-lg rounded-xl bg-white shadow-xl ring-1 ring-black/5 flex flex-col', {
          sm:'sm:max-w-sm', md:'sm:max-w-lg', lg:'sm:max-w-3xl'
        }[size] || 'sm:max-w-lg') }>
          <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900 leading-5">{title}</h2>
            <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <span className="sr-only">Close</span>
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M10 8.586 4.95 3.536 3.536 4.95 8.586 10l-5.05 5.05 1.414 1.414L10 11.414l5.05 5.05 1.414-1.414L11.414 10l5.05-5.05-1.414-1.414L10 8.586Z" clipRule="evenodd"/></svg>
            </button>
          </div>
          <div className="px-5 py-4 max-h-[70vh] overflow-y-auto text-sm text-gray-700 space-y-4">
            {children}
          </div>
          {actions && (
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </Fragment>,
    document.body
  );
}
