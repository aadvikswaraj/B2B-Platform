"use client"
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import Button from '@/components/ui/Button'; // still used in sidebar actions
import PageHeader from '@/components/ui/PageHeader';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';

export default function RolePreviewPage(){
  const { id } = useParams();

 useEffect(() => {
   const fetchRole = async () => {
     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/roles/${id}`);
     if (!res.ok) return notFound();
     const data = await res.json();
     setRole(data);
   };
   fetchRole();
 }, [])
 
  const permissionsEntries = Object.entries(role.permissions || {});

  return (
    <div className="space-y-6 pb-20 sm:pb-0">{/* extra bottom space for mobile action bar */}
      <PageHeader
        backHref="/admin/roles"
        backLabel="Roles"
        title={role.roleName}
        subtitle={`Created ${new Date(role.createdAt).toLocaleDateString()} • ${role.users} assigned user${role.users!==1 ? 's' : ''}`}
        badge={role.isSuperAdmin && 'Super Admin'}
        primaryLabel="Edit Role"
        primaryIcon={PencilSquareIcon}
        primaryHref={`/admin/roles/${role.id}/edit`}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
            <h2 className="text-sm font-semibold tracking-wide text-gray-700 mb-4">Overview</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Role Name</dt>
                <dd className="font-medium text-gray-900">{role.roleName}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Super Admin</dt>
                <dd className="font-medium">{role.isSuperAdmin ? 'Yes' : 'No'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Users Assigned</dt>
                <dd className="font-medium">{role.users}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Created</dt>
                <dd className="font-medium">{new Date(role.createdAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold tracking-wide text-gray-700">Module Permissions</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {permissionsEntries.map(([module, perms])=> (
                <div key={module} className="rounded-lg border border-gray-100 bg-gray-50 p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800 text-sm capitalize">{module}</h3>
                    <span className="text-[10px] inline-flex items-center rounded-full bg-indigo-100 text-indigo-600 font-semibold px-2 py-0.5">{Object.keys(perms).length} perms</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {Object.entries(perms).map(([key,val])=> (
                      <span key={key} className={`px-2 py-1 rounded-md border text-[11px] font-medium ${val? 'bg-emerald-50 border-emerald-200 text-emerald-700':'bg-gray-100 border-gray-200 text-gray-500 line-through opacity-70'}`}>{key}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

  <aside className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
            <h2 className="text-sm font-semibold tracking-wide text-gray-700 mb-4">Actions</h2>
            <div className="space-y-3">
              <Button variant="outline" as={Link} href={`/admin/roles/${role.id}/edit`} className="w-full" icon={PencilSquareIcon}>Edit Role</Button>
              <Button variant="danger" className="w-full" disabled>Delete Role</Button>
            </div>
          </section>
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
            <h2 className="text-sm font-semibold tracking-wide text-gray-700 mb-4">Summary</h2>
            <ul className="text-sm space-y-2 text-gray-600">
              <li><span className="font-medium text-gray-800">{permissionsEntries.length}</span> modules configured</li>
              <li><span className="font-medium text-gray-800">{role.users}</span> users assigned</li>
              <li>{role.isSuperAdmin ? 'Has every permission' : 'Restricted to listed modules'}</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
