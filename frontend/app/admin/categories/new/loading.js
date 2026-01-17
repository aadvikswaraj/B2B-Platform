import PageHeaderSkeleton from '@/components/ui/skeletons/PageHeaderSkeleton';
import FormSectionSkeleton from '@/components/ui/skeletons/FormSectionSkeleton';

export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto lg:px-6 py-4 sm:py-6 space-y-8">
      <PageHeaderSkeleton showBack withActions lines={1} />
      <div className="space-y-8">
        {/* Basics (Name, Description, Image, Slug) */}
        <FormSectionSkeleton type="form" fields={4} />

        {/* Hierarchy (Parent picker area) */}
        <FormSectionSkeleton type="form" fields={1} />

        {/* Specifications builder (list/grid feel) */}
        <FormSectionSkeleton type="matrix" />

        {/* Commission (mode + inputs) */}
        <FormSectionSkeleton type="form" fields={2} />

        {/* Spec Inheritance Preview */}
        <FormSectionSkeleton type="matrix" />

        {/* Final Preview */}
        <FormSectionSkeleton type="matrix" />
      </div>
    </div>
  );
}