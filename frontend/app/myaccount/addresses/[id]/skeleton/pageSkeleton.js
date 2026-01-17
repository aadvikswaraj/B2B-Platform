import FormSectionSkeleton from "@/components/ui/skeletons/FormSectionSkeleton";
import PageHeaderSkeleton from "@/components/ui/skeletons/PageHeaderSkeleton";

export default function PageSkeleton() {
  return (
    <>
      <PageHeaderSkeleton withActions={true} showBack={true} lines={1} />
      <div className="space-y-8">
        <FormSectionSkeleton type="form" fields={2} withDescription={true} />
        <FormSectionSkeleton type="form" fields={6} withDescription={true} />
      </div>
    </>
  );
}