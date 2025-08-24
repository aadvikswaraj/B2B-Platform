'use client';
export default function RoleBadge({ children, color='indigo' }){
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    teal: 'bg-teal-50 text-teal-700 ring-teal-600/20',
    rose: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    amber: 'bg-amber-50 text-amber-700 ring-amber-600/20'
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${colors[color]||colors.indigo}`}>{children}</span>
  );
}