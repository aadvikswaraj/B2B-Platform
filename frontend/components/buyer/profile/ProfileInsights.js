'use client';

export default function ProfileInsights({ completeness = 0, verification = 'pending' }) {
  const statusColor = verification === 'verified' ? 'emerald' : verification === 'rejected' ? 'rose' : 'yellow';
  const statusLabel = verification === 'verified' ? 'Verified' : verification === 'rejected' ? 'Rejected' : 'Pending';
  return (
    <div className="flex items-center gap-4 py-3 px-2 sm:px-0">
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-500">Profile Completeness</span>
        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
          <div className={`h-full bg-emerald-500 transition-all`} style={{ width: `${completeness}%` }} />
        </div>
        <span className="text-xs font-semibold text-gray-700 mt-1">{completeness}%</span>
      </div>
      <div className={`flex flex-col items-center px-3 py-1 rounded bg-${statusColor}-50`}>
        <span className={`text-xs font-semibold text-${statusColor}-700`}>Verification</span>
        <span className={`text-xs text-${statusColor}-600`}>{statusLabel}</span>
      </div>
    </div>
  );
}
