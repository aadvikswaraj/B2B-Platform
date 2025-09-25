import React from 'react';
import { Shimmer } from './SkeletonUtilities';

export default function FormSectionSkeleton({ type='form', fields = 4, withDescription=true, actions=false }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white/70 shadow-sm">
      <div className="p-4 sm:p-6">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Shimmer className="h-4 w-4 rounded-full" />
              <Shimmer className="h-4 w-40" />
            </div>
            {withDescription && <Shimmer className="h-3 w-72" />}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              <Shimmer className="h-8 w-24" />
              <Shimmer className="h-8 w-16" />
            </div>
          )}
        </header>
        {type === 'form' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Array.from({length: fields}).map((_,i)=>(
              <div key={i} className="space-y-2">
                <Shimmer className="h-3 w-32" />
                <Shimmer className="h-10 w-full" />
              </div>
            ))}
          </div>
        )}
        {type === 'matrix' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {Array.from({length: 12}).map((_,i)=>(
                <div key={i} className="space-y-2 p-3 rounded-md border border-gray-100 bg-white/60">
                  <Shimmer className="h-3 w-24" />
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Shimmer className="h-4 w-10" />
                    <Shimmer className="h-4 w-10" />
                    <Shimmer className="h-4 w-10" />
                    <Shimmer className="h-4 w-10" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <Shimmer className="h-9 w-32" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
