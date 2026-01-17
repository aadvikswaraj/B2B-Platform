"use client";
import clsx from 'clsx';

export default function SpecsPreview({ specs = [] }){
  return (
    <div className="flex flex-wrap gap-2">
      {specs.map((s,i)=>(
        <span key={i} className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium', 'bg-blue-50 text-blue-700')}>{s.name || '(unnamed)'}</span>
      ))}
      {specs.length===0 && <span className="text-[11px] italic text-gray-400">None</span>}
    </div>
  );
}
