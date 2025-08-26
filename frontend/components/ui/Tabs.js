"use client";
import { useState, useId } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export function Tabs({ tabs, initial=0, onChange }){
  const [active, setActive] = useState(initial);
  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-1 border-b border-gray-200 dark:border-gray-700 mb-4">
        {tabs.map((t,i)=>(
          <button
            key={t.key || i}
            type="button"
            onClick={()=>{ setActive(i); onChange?.(i, t); }}
            className={clsx('relative px-4 py-2 text-sm font-medium rounded-t-md transition',
              i===active ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900')}
          >
            {t.icon && <t.icon className="h-4 w-4 inline mr-1" />} {t.label}
          </button>
        ))}
      </div>
      <div>
        {tabs[active] && tabs[active].content}
      </div>
    </div>
  );
}

export function StepTabs({ steps, active, onStep }){
  return (
    <ol className="flex gap-2 overflow-x-auto no-scrollbar py-1 pr-2 -ml-1" style={{WebkitOverflowScrolling:'touch'}}>
      {steps.map((s,i)=>{
        const status = i < active ? 'completed' : i === active ? 'active' : 'upcoming';
        return (
          <li key={s.key || i} className="flex-shrink-0">
            <button
              type="button"
              aria-current={status==='active' ? 'step' : undefined}
              onClick={()=>onStep?.(i)}
              className={clsx(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium border transition whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1',
                status==='active' && 'bg-indigo-600 border-indigo-600 text-white shadow-sm',
                status==='completed' && 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-50',
                status==='upcoming' && 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              )}
            >
              {status==='completed' ? (
                <CheckIcon className="h-3.5 w-3.5" />
              ) : (
                <span className="font-semibold">{i+1}</span>
              )}
              <span className="truncate max-w-[7rem] sm:max-w-none">{s.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
