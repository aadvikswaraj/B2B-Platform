import React from 'react';
import { Shimmer } from './SkeletonUtilities';

export default function PageHeaderSkeleton({ withActions=true, showBack=true, lines=1 }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {showBack && <Shimmer className="h-7 w-20" />}
        <div className="space-y-1">
          <Shimmer className="h-6 w-48" />
          {Array.from({length: lines}).map((_,i)=>(
            <Shimmer key={i} className="h-3 w-64" />
          ))}
        </div>
        <Shimmer className="h-5 w-16" />
      </div>
      {withActions && (
        <div className="hidden sm:flex items-center gap-2">
          <Shimmer className="h-8 w-28" />
        </div>
      )}
    </div>
  );
}
