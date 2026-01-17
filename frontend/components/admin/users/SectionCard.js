'use client';
export default function SectionCard({ title, children, aside, actions, className='' }){
  return (
    <div className={`rounded-2xl bg-white/70 backdrop-blur border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden ${className}`}>
      <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold text-gray-900 tracking-tight">{title}</h3>
          {aside && <p className="text-[11px] text-gray-500 leading-snug max-w-sm">{aside}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="px-5 pb-5 pt-1 space-y-5">{children}</div>
    </div>
  );
}
