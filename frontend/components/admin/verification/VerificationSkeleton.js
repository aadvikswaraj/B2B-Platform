import PageHeaderSkeleton from "@/components/ui/skeletons/PageHeaderSkeleton";

export default function VerificationSkeleton({
  sections = 3,
  fieldsPerSection = 4,
}) {
  return (
    <div className="space-y-6 animate-pulse max-w-5xl mx-auto pb-10">
      {/* Header Skeleton - Desktop: PageHeader style */}
      <div className="hidden md:block">
        <PageHeaderSkeleton withActions={true} showBack={true} lines={1} />
      </div>

      {/* Header Skeleton - Mobile: Card style */}
      <div className="md:hidden bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex gap-6">
        <div className="h-24 w-24 rounded-xl bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-3 py-2">
          <div className="h-8 w-1/3 bg-gray-200 rounded" />
          <div className="flex gap-4">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      {/* Dynamic Content Skeleton */}
      {Array.from({ length: sections }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4"
        >
          {/* Section Title */}
          <div className="h-5 w-48 bg-gray-200 rounded mb-6" />

          {/* Grid of Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: fieldsPerSection }).map((_, j) => (
              <div key={j} className="space-y-2">
                <div className="h-3 w-24 bg-gray-200 rounded" />
                <div className="h-5 w-full bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
