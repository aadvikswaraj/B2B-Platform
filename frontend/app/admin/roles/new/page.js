"use client";
import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import RoleForm from '@/components/admin/roles/RoleForm';
import { CheckIcon } from '@heroicons/react/24/outline';

export default function NewRolePage(){
  const [saving,setSaving] = useState(false);

  async function handleCreate(data){
    setSaving(true);
    await new Promise(r=>setTimeout(r,900));
    alert('Role created (mock)');
    setSaving(false);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-6 py-4 sm:py-6 space-y-8">
      <PageHeader
        backHref="/admin/roles"
        backLabel="Roles"
        title="New Role"
        primaryLabel={saving ? 'Saving...' : 'Save Role'}
        primaryIcon={CheckIcon}
        primaryDisabled={saving}
        onPrimary={()=>document.getElementById('role-form')?.requestSubmit()}
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
