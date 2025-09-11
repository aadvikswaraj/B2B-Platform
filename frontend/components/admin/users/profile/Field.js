export default function Field({ label, value, span = 1 }) {
  const colSpan = span === 2 ? 'sm:col-span-2' : 'sm:col-span-1';
  return (
    <div className={colSpan}>
      <div className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">{label}</div>
      <div className="mt-1 text-sm text-gray-900 break-words">{value ?? '—'}</div>
    </div>
  );
}
