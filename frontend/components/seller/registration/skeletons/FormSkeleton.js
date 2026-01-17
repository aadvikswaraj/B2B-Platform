export default function FormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-40 rounded bg-gray-200" />
      <div className="h-4 w-64 rounded bg-gray-200" />
      <div className="h-48 w-full rounded bg-gray-100" />
      <div className="flex gap-3">
        <div className="h-10 w-24 rounded bg-gray-200" />
        <div className="h-10 w-24 rounded bg-gray-200" />
      </div>
    </div>
  );
}
