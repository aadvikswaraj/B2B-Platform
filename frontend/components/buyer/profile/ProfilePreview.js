'use client';
import Image from 'next/image';

export default function ProfilePreview({ user, business, onEdit }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm p-4 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
          {user?.avatarUrl ? (
            <Image src={user.avatarUrl} alt="Avatar" width={64} height={64} className="h-16 w-16 object-cover" />
          ) : (
            <span className="text-2xl font-bold text-gray-400">{user?.name?.charAt(0) || '?'}</span>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">{user?.name}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <p className="text-sm text-gray-500">{user?.phone}</p>
        </div>
        <button onClick={onEdit} className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">Edit</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="font-medium text-gray-700">Company</div>
          <div className="text-gray-900">{business?.companyName || '-'}</div>
        </div>
        <div>
          <div className="font-medium text-gray-700">Business Type</div>
          <div className="text-gray-900">{business?.businessType || '-'}</div>
        </div>
        <div>
          <div className="font-medium text-gray-700">GSTIN</div>
          <div className="text-gray-900">{business?.gstin || '-'}</div>
        </div>
        <div>
          <div className="font-medium text-gray-700">PAN</div>
          <div className="text-gray-900">{business?.pan || '-'}</div>
        </div>
        <div className="sm:col-span-2">
          <div className="font-medium text-gray-700">Address</div>
          <div className="text-gray-900">{business?.address?.addressLine1 || ''} {business?.address?.addressLine2 || ''}, {business?.address?.city || ''}, {business?.address?.state || ''} {business?.address?.pincode || ''}</div>
        </div>
        <div className="sm:col-span-2">
          <div className="font-medium text-gray-700">Product Categories</div>
          <div className="text-gray-900">{(user?.productCategories || []).join(', ') || '-'}</div>
        </div>
        <div className="sm:col-span-2">
          <div className="font-medium text-gray-700">Social Links</div>
          <div className="flex gap-2 text-gray-900">
            {user?.socials?.linkedin && <a href={user.socials.linkedin} target="_blank" rel="noopener" className="underline">LinkedIn</a>}
            {user?.socials?.facebook && <a href={user.socials.facebook} target="_blank" rel="noopener" className="underline">Facebook</a>}
            {user?.socials?.twitter && <a href={user.socials.twitter} target="_blank" rel="noopener" className="underline">Twitter</a>}
            {!(user?.socials?.linkedin || user?.socials?.facebook || user?.socials?.twitter) && <span>-</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
