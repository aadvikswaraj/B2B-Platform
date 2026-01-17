export default function KPIStatCard({ title, value, change, isPositive }) {
  return (
    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
      <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
      <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
        {value}
      </dd>
      {change && (
        <div className="mt-2">
          <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <span className="font-medium">
              {isPositive ? '↑' : '↓'} {change}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
