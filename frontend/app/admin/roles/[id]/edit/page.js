"use client";
import { notFound, useRouter } from 'next/navigation';
import { findRole } from '@/data/mockRoles';
import PageHeader from '@/components/ui/PageHeader';
import RoleForm from '@/components/admin/roles/RoleForm';
import { CheckIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function EditRolePage({ params }){
  const { id } = params;
  const existing = findRole(id);
  const router = useRouter();
  if(!existing) return notFound();

  const [saving,setSaving] = useState(false);

  async function handleUpdate(data){
    setSaving(true);
    await new Promise(r=>setTimeout(r,900));
    alert('Role updated (mock)');
    setSaving(false);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-6 py-4 sm:py-6 space-y-8">
      <PageHeader
        backHref="/admin/roles/" 
        backLabel="Roles"
        title={`Edit: ${existing.roleName}`}
        subtitle={`Created ${new Date(existing.createdAt).toLocaleDateString()} • ${existing.users} users`}
        badge={existing.isSuperAdmin && 'Super Admin'}
        primaryLabel={saving ? 'Saving...' : 'Save Changes'}
        primaryIcon={CheckIcon}
        primaryDisabled={saving}
        onPrimary={()=>document.getElementById('role-form')?.requestSubmit()}
        secondaryActions={[{
          label:'Preview',
          href:`/admin/roles/${existing.id}`,
          icon:EyeIcon,
          variant:'outline'
        }]}
      />
      <RoleForm
        initialRole={existing}
        submitting={saving}
        submitLabel={saving ? 'Saving...' : 'Save Changes'}
        onSubmit={handleUpdate}
        stickyMobileBar
      />
    </div>
  );
}
