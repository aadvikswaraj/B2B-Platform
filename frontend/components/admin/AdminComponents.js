'use client';

export function AdminCard({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {title && (
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

export function CountStatsCard({ title, items, statsContainerClassName, className}) {
  return (
  <div className={`bg-white rounded-lg shadow px-6 py-4 ${className}`}>
      {title && (
  <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {title}
        </h2>
      )}
      <div className={"grid text-sm "+statsContainerClassName}>
        {items.map(item => (
          <div key={item.label} className={`flex flex-col`}>
            <span className="text-base font-medium">{item.label}</span>
            <span className={`text-lg py-0.5 font-semibold ${item.className}`}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DataTable({ columns, data, onSort, sortColumn, sortDirection }) {
  return (
    <div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                onClick={() => column.sortable && onSort?.(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {column.sortable && sortColumn === column.key && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
  <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FilterBar({ filters, onChange }) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {filters.map((filter) => (
        <div key={filter.key} className="flex-1 min-w-[200px]">
          <label
            htmlFor={filter.key}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {filter.label}
          </label>
          <select
            id={filter.key}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value={filter.value}
            onChange={(e) => onChange(filter.key, e.target.value)}
          >
            <option value="">All</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

export function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <input
        type="text"
  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 pr-10 text-sm"
        placeholder={placeholder || 'Search...'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <svg
        className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
}

export function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
  <div className="flex items-center justify-between px-4 py-3 bg-white">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => onPageChange(i + 1)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  currentPage === i + 1
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
