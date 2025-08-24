'use client';
import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import UserAvatar from '@/components/admin/users/UserAvatar';
import RoleBadges from '@/components/admin/users/RoleBadges';
import UserStatusPill from '@/components/admin/users/UserStatusPill';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import ProfileSection from '@/components/admin/users/profile/ProfileSection';
import Field from '@/components/admin/users/profile/Field';

// Helper for formatting
const fmtDate = (d) => d ? new Date(d).toLocaleString() : '—';

export default function AdminUserDetailPage(){
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  // Mock data (no backend) – replace with API integration later
  const [user, setUser] = useState({
    _id: id,
    name: 'Sample User',
    email: 'sample.user@example.com',
    isAdmin: false,
    isSeller: true,
    status: 'active',
    createdAt: '2025-08-01T10:00:00Z',
    updatedAt: '2025-08-19T10:00:00Z'
  });
  const [seller, setSeller] = useState({
    companyName: 'Acme Components Pvt Ltd',
    gstin: '22AAAAA0000A1Z5',
    gstProfile: 'gst123',
    createdAt: '2025-08-05T09:00:00Z'
  });
  const [gstProfile, setGstProfile] = useState({
    companyName: 'Acme Components Pvt Ltd',
    gstRegistrationDate: '2023-04-12T00:00:00Z',
    ownershipType: 'Private Limited',
    primaryBusinessType: 'Manufacturing',
    secondaryBusiness: 'Wholesale',
    annualTurnover: '5-10 Cr'
  });
  const [showEdit, setShowEdit] = useState(null); // 'user' | 'seller' | 'gst'

  const roles = useMemo(()=>{
    if(!user) return [];
    const arr = [];
    if(user.isAdmin) arr.push('admin');
    if(user.isSeller) arr.push('seller');
    if(!user.isAdmin) arr.push('buyer');
    return arr;
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={()=>router.push('/admin/users')} className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
          <ArrowLeftIcon className="w-4 h-4"/> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">User Detail</h1>
      </div>

      {user && (
  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left column: main profile */}
          <div className="xl:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 bg-white rounded-xl shadow border border-gray-100">
              <UserAvatar user={user} size={80} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="flex-1 min-w-40">
                    <h2 className="text-xl font-semibold text-gray-900 break-words">{user.name}</h2>
                    <p className="text-sm text-gray-500 break-words">{user.email}</p>
                    <div className="mt-3"><RoleBadges roles={roles} /></div>
                  </div>
                  <UserStatusPill status={user.status || 'active'} />
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium text-gray-700">Created</p>
                    <p className="mt-1 text-gray-600">{fmtDate(user.createdAt)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium text-gray-700">Updated</p>
                    <p className="mt-1 text-gray-600">{fmtDate(user.updatedAt)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium text-gray-700">Last Login</p>
                    <p className="mt-1 text-gray-600">—</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium text-gray-700">Status</p>
                    <p className="mt-1 text-gray-600 capitalize">{user.status || 'active'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Placeholder panels for future expansions */}
            <div className="grid gap-6 md:grid-cols-2">
              <ProfileSection title="User Profile" description="Core account information." onEdit={()=>{}} columns={2}>
                <Field label="Name" value={user.name} />
                <Field label="Email" value={user.email} />
                <Field label="Admin" value={user.isAdmin ? 'Yes' : 'No'} />
                <Field label="Seller" value={user.isSeller ? 'Yes' : 'No'} />
              </ProfileSection>

              {seller && (
                <ProfileSection title="Seller Profile" description="Registered seller company information." onEdit={()=>{}} columns={2}>
                  <Field label="Company Name" value={seller.companyName} span={2} />
                  <Field label="GSTIN" value={seller.gstin} />
                  <Field label="GST Profile ID" value={seller.gstProfile} />
                  <Field label="Created" value={fmtDate(seller.createdAt)} />
                </ProfileSection>
              )}

              {gstProfile && (
                <ProfileSection title="GST Verification" description="Details from GST registration." onEdit={()=>{}} columns={2}>
                  <Field label="Company" value={gstProfile.companyName} span={2} />
                  <Field label="Registration Date" value={gstProfile.gstRegistrationDate ? new Date(gstProfile.gstRegistrationDate).toLocaleDateString() : ''} />
                  <Field label="Ownership Type" value={gstProfile.ownershipType} />
                  <Field label="Primary Business" value={gstProfile.primaryBusinessType} />
                  <Field label="Secondary Business" value={gstProfile.secondaryBusiness} />
                  <Field label="Annual Turnover" value={gstProfile.annualTurnover} />
                </ProfileSection>
              )}

              <ProfileSection title="Security" description="Authentication & access posture." onEdit={()=>{}} columns={2}>
                <Field label="Password Last Changed" value={''} />
                <Field label="MFA" value={'Not Enabled'} />
                <Field label="Failed Logins (24h)" value={'0'} />
                <Field label="Lockouts" value={'0'} />
              </ProfileSection>

              <ProfileSection title="Activity Snapshot" description="User engagement metrics." onEdit={()=>{}} columns={2}>
                <Field label="Orders Placed" value={'0'} />
                <Field label="RFQs" value={'0'} />
                <Field label="Products" value={user.isSeller ? '0' : '—'} />
                <Field label="Status" value={user.status || 'active'} />
              </ProfileSection>
            </div>
          </div>

          {/* Right column: management actions */}
          <div className="space-y-6">
            <div className="rounded-xl bg-white shadow border border-gray-100 p-5">
              <h3 className="text-sm font-semibold tracking-wide text-gray-700 uppercase">Manage User</h3>
              <div className="mt-4 flex flex-col gap-2">
                <button className="rounded-md bg-blue-600 text-white text-sm font-medium px-4 py-2 hover:bg-blue-700" onClick={()=>setShowEdit('user')}>Edit Details</button>
                <button className="rounded-md bg-gray-800 text-white text-sm font-medium px-4 py-2 hover:bg-gray-900">Reset Password</button>
                <button className="rounded-md bg-orange-600 text-white text-sm font-medium px-4 py-2 hover:bg-orange-700" onClick={()=>setUser(u=>({...u, status: u.status==='suspended'?'active':'suspended'}))}>{user.status==='suspended'?'Activate User':'Suspend User'}</button>
                <button className="rounded-md bg-rose-600 text-white text-sm font-medium px-4 py-2 hover:bg-rose-700" onClick={()=>router.push('/admin/users')}>Delete User</button>
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 p-5 text-white shadow">
              <h3 className="text-sm font-semibold tracking-wide uppercase text-white/80">Next Steps</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/90">Wire backend mutation endpoints (PATCH /admin/users/:id) to update status and roles. Add audit log and permission management panel.</p>
            </div>
          </div>
        </div>
      )}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl border border-gray-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold tracking-wide uppercase text-gray-700">Edit {showEdit === 'user' ? 'User' : showEdit === 'seller' ? 'Seller Profile' : 'GST Details'}</h2>
              <button onClick={()=>setShowEdit(null)} className="text-gray-500 hover:text-gray-700 text-sm">Close</button>
            </div>
            <form onSubmit={e=>{e.preventDefault(); setShowEdit(null);}} className="overflow-y-auto p-5 space-y-4">
              {showEdit==='user' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">Name
                    <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={user.name} onChange={e=>setUser(u=>({...u, name:e.target.value}))}/>
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">Email
                    <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={user.email} onChange={e=>setUser(u=>({...u, email:e.target.value}))}/>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-600"><input type="checkbox" checked={user.isAdmin} onChange={e=>setUser(u=>({...u, isAdmin:e.target.checked}))}/> Admin</label>
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-600"><input type="checkbox" checked={user.isSeller} onChange={e=>setUser(u=>({...u, isSeller:e.target.checked}))}/> Seller</label>
                </div>
              )}
              {showEdit==='seller' && seller && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">Company Name
                    <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={seller.companyName} onChange={e=>setSeller(s=>({...s, companyName:e.target.value}))}/>
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">GSTIN
                    <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={seller.gstin} onChange={e=>setSeller(s=>({...s, gstin:e.target.value}))}/>
                  </label>
                </div>
              )}
              {showEdit==='gst' && gstProfile && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">Company
                    <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={gstProfile.companyName} onChange={e=>setGstProfile(g=>({...g, companyName:e.target.value}))}/>
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">Ownership Type
                    <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={gstProfile.ownershipType} onChange={e=>setGstProfile(g=>({...g, ownershipType:e.target.value}))}/>
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">Primary Business
                    <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={gstProfile.primaryBusinessType} onChange={e=>setGstProfile(g=>({...g, primaryBusinessType:e.target.value}))}/>
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">Secondary Business
                    <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={gstProfile.secondaryBusiness} onChange={e=>setGstProfile(g=>({...g, secondaryBusiness:e.target.value}))}/>
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">Annual Turnover
                    <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={gstProfile.annualTurnover} onChange={e=>setGstProfile(g=>({...g, annualTurnover:e.target.value}))}/>
                  </label>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={()=>setShowEdit(null)} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
