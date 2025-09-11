export default function ProfileSection({ title, description, onEdit, columns = 1, children }) {
  const gridCols = columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-1";
  return (
    <section className="rounded-xl bg-white shadow border border-gray-100 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {description ? (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          ) : null}
        </div>
        {typeof onEdit === 'function' && (
          <button onClick={onEdit} className="text-xs font-medium text-blue-600 hover:text-blue-700">Edit</button>
        )}
      </div>
      <div className={`mt-4 grid grid-cols-1 ${gridCols} gap-4`}>
        {children}
      </div>
    </section>
  );
}
