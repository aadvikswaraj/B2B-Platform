import { PencilSquareIcon } from '@heroicons/react/24/outline';


export default function PreviewSection({ 
  title, 
  description, 
  onEdit, 
  actions = [],
  columns = 1, 
  children,
  className = ""
}) {
  const gridCols = columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-1";
  
  return (
    <section className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
                action.variant === 'danger' ? 'text-red-600 hover:text-red-700' :
                action.variant === 'success' ? 'text-emerald-600 hover:text-emerald-700' :
                'text-blue-600 hover:text-blue-700'
              }`}
              disabled={action.disabled}
            >
              {action.icon && <action.icon className="h-4 w-4" />}
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          ))}
          {onEdit && (
            <button 
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <PencilSquareIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          )}
        </div>
      </div>
      <div className={`p-5 grid grid-cols-1 ${gridCols} gap-6`}>
        {children}
      </div>
    </section>
  );
}
