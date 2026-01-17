import PageHeaderSkeleton from '@/components/ui/skeletons/PageHeaderSkeleton';
import FormSectionSkeleton from '@/components/ui/skeletons/FormSectionSkeleton';

export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-6 py-4 sm:py-6 space-y-8">
      <PageHeaderSkeleton showBack withActions lines={1} />
      <div className="space-y-8">
        <FormSectionSkeleton type='form' fields={2} />
        <FormSectionSkeleton type='matrix' />
      </div>
    </div>
  );
}