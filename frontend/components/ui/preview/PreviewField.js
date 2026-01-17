export default function PreviewField({ label, value, span = 1 }) {
  const colSpan = span === 2 ? 'sm:col-span-2' : 'sm:col-span-1';
  
  return (
    <div className={colSpan}>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-sm text-gray-900 font-medium break-words">
        {value ?? <span className="text-gray-400 italic">Empty</span>}
      </div>
    </div>
  );
}
