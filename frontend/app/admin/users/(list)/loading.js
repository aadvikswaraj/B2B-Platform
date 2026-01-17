import DataTableSkeleton from '@/components/ui/skeletons/DataTableSkeleton';

export default function Loading(){
  return (
    <div className="mt-5 px-4">
      <DataTableSkeleton title filters={2} columns={5} rows={8} selectable actions withPrimaryAction />
    </div>
  );
}