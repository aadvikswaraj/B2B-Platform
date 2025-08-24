"use client";
import { useState, useMemo } from 'react';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import PermissionMatrix from '@/components/admin/roles/PermissionMatrix';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardSection } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';

const basePermissions = {
  users:{ view:true, edit:false, delete:false, suspend:false },
  products:{ view:true, edit:false, delete:false, approve:false, reject:false },
  orders:{ view:true, edit:false, delete:false, create:false },
  rfqs:{ view:true, approve:false, reject:false },
  category:{ view:true, edit:false, delete:false, create:false },
  content:{ view:true, edit:false }
};

export default function NewRolePage(){
  const [roleName, setRoleName] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [permissions, setPermissions] = useState(basePermissions);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  function validate(){
    const e={};
    if(!roleName.trim()) e.roleName='Role name required';
    setErrors(e); return Object.keys(e).length===0;
  }

  async function handleSubmit(e){
    e.preventDefault();
    if(!validate()) return;
    setSaving(true);
    await new Promise(r=>setTimeout(r,900));
    alert('Role created (mock)');
    setSaving(false);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-6 py-4 sm:py-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/roles" className="group inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 shadow-sm">
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Roles</span>
          </Link>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">New Role</h1>
          {isSuperAdmin && <Badge variant='rose'>Super Admin</Badge>}
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Button onClick={handleSubmit} disabled={saving} icon={CheckIcon}>{saving ? 'Saving...' : 'Save Role'}</Button>
        </div>
      </div>
      <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/90 backdrop-blur px-4 py-3 flex items-center justify-end gap-3">
        <Button size='sm' onClick={handleSubmit} disabled={saving} icon={CheckIcon}>{saving ? 'Saving...' : 'Save'}</Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-24 sm:pb-0">
        <Card>
          <CardHeader title="Role Details" />
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label='Role Name' required error={errors.roleName}>
                <Input value={roleName} onChange={e=>setRoleName(e.target.value)} placeholder='e.g. Catalog Moderator' invalid={!!errors.roleName} />
              </FormField>
              <FormField label='Super Admin' hint='Grants unrestricted platform access'>
                <Checkbox label='Enable' checked={isSuperAdmin} onChange={e=>setIsSuperAdmin(e.target.checked)} />
              </FormField>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title='Permissions Matrix' />
          <div className='space-y-5'>
            <p className='text-xs text-gray-500'>Toggle permissions for each module. Disabled when Super Admin is selected.</p>
            <PermissionMatrix value={permissions} onChange={setPermissions} disabled={isSuperAdmin} />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type='submit' disabled={saving} icon={CheckIcon}>{saving ? 'Saving...' : 'Create Role'}</Button>
        </div>
      </form>
    </div>
  );
}
