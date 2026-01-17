"use client"
import { use, useState } from 'react';
import { useAlert } from '@/components/ui/AlertManager';
import PageHeader from '@/components/ui/PageHeader';
import RoleForm from '@/components/admin/roles/RoleForm';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function NewRolePage() {
  const [saving, setSaving] = useState(false);
  const pushAlert = useAlert();
  const router = useRouter();
  
  async function handleCreate(data) {
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
    <div className="max-w-5xl mx-auto lg:px-6 py-4 sm:py-6 space-y-8">
      <PageHeader
        backHref="/admin/roles"
        backLabel="Roles"
        title="New Role"
        primaryLabel={saving ? 'Saving...' : 'Save Role'}
        primaryIcon={CheckIcon}
        primaryDisabled={saving}
        onPrimary={() => document.getElementById('role-form')?.requestSubmit()}
      />
      <RoleForm
        submitting={saving}
        submitLabel={saving ? 'Saving...' : 'Create Role'}
        onSubmit={handleCreate}
        stickyMobileBar
      />
    </div>
  );
}
