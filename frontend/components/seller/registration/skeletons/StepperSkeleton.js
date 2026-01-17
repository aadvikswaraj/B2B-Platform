export default function StepperSkeleton({ steps }) {
  return (
    <div className="mb-6 animate-pulse">
      <div className="h-4 w-40 rounded bg-gray-200 mb-3" />
      <div className="flex flex-wrap gap-2">
        {steps.map(s => (
          <div key={s.id} className="h-9 w-32 rounded-full bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
