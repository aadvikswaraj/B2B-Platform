'use client';
import { Fragment, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

export default function Modal({ 
  open, 
  onClose, 
  title, 
  children, 
  size='md', 
  actions, 
  closeOnBackdrop=true,
  showHeader=true,
  showCloseButton=true,
  mobileMode='popup', // 'popup' | 'drawer' | 'fullscreen'
  center=false
}){
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const contentRef = useRef(null);
  const startY = useRef(0);

  // Reset drag state when opening
  useEffect(() => {
    if (open) {
      setDragY(0);
      setIsDragging(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if(!open) return null;

  const handleTouchStart = (e) => {
    if (mobileMode !== 'drawer') return;
    
    // Only allow drag if we are at the top of the scroll
    // OR if we are touching the handle area (we can check target)
    const scrollTop = contentRef.current?.querySelector('.modal-content')?.scrollTop || 0;
    
    // If we are scrolling content, don't drag unless we are at top and pulling down
    if (scrollTop > 0) return;

    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const y = e.touches[0].clientY;
    const delta = y - startY.current;
    
    if (delta > 0) { // Only allow dragging down
      // e.preventDefault(); // This might block scrolling inside, be careful
      setDragY(delta);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (dragY > 150) { // Threshold to close
      onClose?.();
    } else {
      setDragY(0); // Snap back
    }
  };

  const modalContent = (
    <div 
      className={clsx(
        'relative bg-white shadow-xl flex flex-col transition-transform duration-200 ease-out',
        // Desktop styles (always popup-like)
        'sm:rounded-xl sm:w-full sm:h-auto sm:translate-y-0',
        !center && 'sm:mt-20',
        {
          sm:'sm:max-w-sm', md:'sm:max-w-lg', lg:'sm:max-w-3xl', xl: 'sm:max-w-5xl'
        }[size] || 'sm:max-w-lg',
        
        // Mobile styles based on mode
        mobileMode === 'drawer' && [
          'fixed bottom-0 left-0 right-0 w-full rounded-t-xl max-h-[90vh]',
          'transform', // For drag translation
        ],
        mobileMode === 'fullscreen' && [
          'fixed inset-0 w-full h-full rounded-none',
        ],
        mobileMode === 'popup' && [
          'w-full max-w-lg rounded-xl mx-4 mt-20',
        ]
      )}
      style={mobileMode === 'drawer' ? { transform: `translateY(${dragY}px)` } : {}}
      ref={contentRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Drawer Handle */}
      {mobileMode === 'drawer' && (
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden cursor-grab active:cursor-grabbing shrink-0">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>
      )}

      {/* Header */}
      {showHeader ? (
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-sm font-semibold text-gray-900 leading-5">{title}</h2>
          {showCloseButton && (
            <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <span className="sr-only">Close</span>
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M10 8.586 4.95 3.536 3.536 4.95 8.586 10l-5.05 5.05 1.414 1.414L10 11.414l5.05 5.05 1.414-1.414L11.414 10l5.05-5.05-1.414-1.414L10 8.586Z" clipRule="evenodd"/></svg>
            </button>
          )}
        </div>
      ) : showCloseButton ? (
        // Close button when no header
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 z-10 rounded-full p-2 bg-white/80 text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none shadow-sm"
        >
          <span className="sr-only">Close</span>
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M10 8.586 4.95 3.536 3.536 4.95 8.586 10l-5.05 5.05 1.414 1.414L10 11.414l5.05 5.05 1.414-1.414L11.414 10l5.05-5.05-1.414-1.414L10 8.586Z" clipRule="evenodd"/></svg>
        </button>
      ) : null}

      {/* Content */}
      <div className={clsx(
        "modal-content px-5 py-4 overflow-y-auto text-sm text-gray-700 space-y-4",
        mobileMode === 'fullscreen' ? 'flex-1 sm:flex-none sm:max-h-[80vh]' : 'max-h-[70vh]'
      )}>
        {children}
      </div>

      {/* Actions */}
      {actions && (
        <div className={clsx(
          "px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2 shrink-0",
          mobileMode === 'fullscreen' && "pb-safe-bottom" // Add safe area padding for fullscreen
        )}>
          {actions}
        </div>
      )}
    </div>
  );

  return createPortal(
    <Fragment>
      <div 
        className="fixed inset-0 z-[200] bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={()=>closeOnBackdrop && onClose?.()} 
      />
      <div className={clsx(
        "fixed inset-0 z-[201] flex overflow-hidden pointer-events-none",
        // Alignment based on mode
        mobileMode === 'drawer' ? 'items-end sm:justify-center' : 'items-center justify-center',
        center ? 'sm:items-center' : 'sm:items-start',
        // Padding
        (mobileMode === 'fullscreen' || mobileMode === 'drawer') ? 'p-0 sm:p-6' : 'p-4 sm:p-6'
      )}>
        <div className={clsx(
          "pointer-events-auto w-full flex justify-center",
          mobileMode === 'drawer' ? 'h-auto' : 'h-full sm:h-auto'
        )}>
           {modalContent}
        </div>
      </div>
    </Fragment>,
    document.body
  );
}
