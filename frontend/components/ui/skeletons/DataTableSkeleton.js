import React from 'react';
import { Shimmer } from './SkeletonUtilities';

/**
 * Generic data table skeleton.
 * Props:
 *  - title (bool) show title block
 *  - filters (number) how many filter selects
 *  - columns (number) how many table columns (excluding select + actions)
 *  - rows (number) how many placeholder rows
 *  - selectable (bool) whether to show checkbox column
 *  - actions (bool) whether to show actions column
 */
export default function DataTableSkeleton({
  title = true,
  filters = 2,
  columns = 4,
  rows = 8,
  selectable = true,
  actions = true,
  withPrimaryAction = true
}) {
  return (
    <div className="space-y-4">
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-2">
            <Shimmer className="h-6 w-40" />
            <Shimmer className="h-3 w-24" />
          </div>
          <div className="flex items-center gap-2">
            {withPrimaryAction && <Shimmer className="h-9 w-28" />}
            <Shimmer className="h-9 w-10" />
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="flex-1 max-w-md"><Shimmer className="h-9 w-full" /></div>
          <div className="hidden sm:flex gap-2">
            {[...Array(Math.max(0, filters - 1)).keys()].map(i => (
              <Shimmer key={i} className="h-9 w-32" />
            ))}
          </div>
        </div>
        <div className="hidden md:flex gap-3">
          {[...Array(filters).keys()].map(i => (
            <Shimmer key={i} className="h-9 w-40" />
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 overflow-hidden bg-white hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {selectable && <th className="px-4 py-2"><Shimmer className="h-4 w-4" /></th>}
                {[...Array(columns).keys()].map(i => (
                  <th key={i} className="px-4 py-2 text-left"><Shimmer className="h-3 w-24" /></th>
                ))}
                {actions && <th className="px-4 py-2 text-right"><Shimmer className="h-3 w-12 ml-auto" /></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {[...Array(rows).keys()].map(r => (
                <tr key={r} className="animate-pulse">
                  {selectable && <td className="px-4 py-3"><Shimmer className="h-4 w-4" /></td>}
                  {[...Array(columns).keys()].map(c => (
                    <td key={c} className="px-4 py-3"><Shimmer className="h-3 w-32" /></td>
                  ))}
                  {actions && <td className="px-4 py-3 text-right"><Shimmer className="h-5 w-8 ml-auto" /></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 text-xs text-gray-500">
          <div className="flex items-center gap-2"><Shimmer className="h-4 w-24" /><Shimmer className="h-6 w-14" /></div>
          <div className="flex items-center gap-2"><Shimmer className="h-6 w-12" /><Shimmer className="h-6 w-12" /></div>
        </div>
      </div>
      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {[...Array(Math.min(rows,5)).keys()].map(i => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3 animate-pulse">
            <div className="flex items-start justify-between gap-3">
              {selectable && <Shimmer className="h-4 w-4" />}
              <div className="flex-1 space-y-2">
                <Shimmer className="h-3 w-40" />
                <Shimmer className="h-2 w-24" />
              </div>
              {actions && <Shimmer className="h-5 w-10" />}
            </div>
            <div className="flex gap-3">
              <Shimmer className="h-2 w-20" />
              <Shimmer className="h-2 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
