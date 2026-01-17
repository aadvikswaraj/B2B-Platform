"use client";
const STATUSES = [
  { id: 'pending', label: 'Pending', desc: 'Order received' },
  { id: 'processing', label: 'Processing', desc: 'Preparing items' },
  { id: 'shipped', label: 'Shipped', desc: 'In transit' },
  { id: 'delivered', label: 'Delivered', desc: 'Delivered to destination' }
];
export default function TrackingTimeline({ current = 'pending' }) {
  const currentIndex = STATUSES.findIndex(s => s.id === current);
  return (
    <ol className="relative border-l border-slate-200 pl-5 space-y-8 max-w-md">
      {STATUSES.map((s,i) => {
        const state = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming';
        return (
          <li key={s.id} className="relative">
            <span className={`absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${state === 'done' ? 'bg-green-600 text-white' : state === 'current' ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-300 text-slate-600'}`}>{i+1}</span>
            <div>
              <p className="text-sm font-medium">{s.label}{state === 'current' && <span className="ml-2 text-xs text-blue-600">In progress</span>}</p>
              <p className="text-xs text-slate-500">{s.desc}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
