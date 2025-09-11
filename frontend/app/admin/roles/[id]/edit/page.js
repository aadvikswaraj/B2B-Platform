"use client";
import { notFound, useParams, useRouter } from 'next/navigation';
import { findRole } from '@/data/mockRoles';
import PageHeader from '@/components/ui/PageHeader';
import RoleForm from '@/components/admin/roles/RoleForm';
import { CheckIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useAlert } from '@/components/ui/AlertManager';

export default function EditRolePage(){
  const { id } = useParams();
  const [saving, setSaving] = useState(false);
    const pushAlert = useAlert();
    const router = useRouter();
    
    async function handleUpdate(data) {
      setSaving(true);
      try {
        const serverResponse = await (await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/roles/new`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        })).json();
        if (serverResponse.success) {
          pushAlert('success', 'Role created successfully!');
          router.push('/admin/roles');
        } else if (serverResponse.message === "Role name already exists") {
          pushAlert('error', 'Role name already exists.');
        } else {
          pushAlert('error', 'Failed to create role. Please try again.');
        }
      } catch (error) {
        console.error("Error creating role:", error);
        pushAlert('error', 'Failed to create role. Please try again.');
      } finally {
        setSaving(false);
      }
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
