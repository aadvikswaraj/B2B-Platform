"use client";
export const steps = [
  { id: 'shipping', label: 'Shipping' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review' },
  { id: 'success', label: 'Success' }
];

export default function ProgressSteps({ current }) {
  const currentIndex = steps.findIndex(s => s.id === current);
  return (
    <ol className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm mb-6" aria-label="Checkout Progress">
      {steps.map((s, i) => {
        const state = i < currentIndex ? 'complete' : i === currentIndex ? 'current' : 'upcoming';
        return (
          <li key={s.id} className="flex items-center gap-2" aria-current={state === 'current' ? 'step' : undefined}>
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-medium ${state === 'complete' ? 'bg-green-600 text-white' : state === 'current' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>{i + 1}</span>
            <span className={state === 'current' ? 'font-semibold text-slate-900' : 'text-slate-500'}>{s.label}</span>
            {i < steps.length - 1 && <span className="hidden sm:block w-10 h-px bg-slate-200" />}
          </li>
        );
      })}
    </ol>
  );
}
