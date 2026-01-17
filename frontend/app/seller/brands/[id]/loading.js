import PageHeaderSkeleton from "@/components/ui/skeletons/PageHeaderSkeleton";

export default function Loading() {
  return (
    <div className="p-4 space-y-6">
      <PageHeaderSkeleton showBack withActions lines={1} />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
            <div className="mt-4 h-9 w-full bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
