export default function SidebarSkeleton({ steps }) {
  return (
    <div className="animate-pulse">
      <div className="h-5 w-24 rounded bg-gray-200 mb-4" />
      <div className="h-2 w-full rounded bg-gray-200 mb-6" />
      <ul className="space-y-3">
        {steps.map((_, i) => (
          <li key={i} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-300" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-40 rounded bg-gray-200" />
              <div className="h-2 w-28 rounded bg-gray-100" />
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 h-20 w-full rounded bg-gray-100" />
    </div>
  );
}
