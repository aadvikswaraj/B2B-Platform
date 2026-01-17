"use client";
import { useForm, Controller } from 'react-hook-form';
import PermissionMatrix from '@/components/admin/roles/PermissionMatrix';
import FormSection from '@/components/ui/FormSection';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import Button from '@/components/ui/Button';
import { CheckIcon } from '@heroicons/react/24/outline';
import { adminPermissions } from '@/data/mockRoles';

export default function RoleForm({
  initial = {},
  onSubmit,
  submitting,
  submitLabel = 'Save Role'
}){
  const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      roleName: initial.roleName || '',
      isSuperAdmin: !!initial.isSuperAdmin,
      permissions: initial.permissions || adminPermissions
    }
  });

  const isSuperAdmin = watch('isSuperAdmin');

  return (
    <form id="role-form" onSubmit={handleSubmit(async (data)=>await onSubmit?.(data))} className="space-y-8 pb-24 sm:pb-0">
      <FormSection
        title="Role Details"
        description="Basic identity and access level for this role. Enable Super Admin to bypass granular permissions."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label='Role Name' required error={errors.roleName?.message}>
            <Input {...register('roleName', { required: 'Role name required' })} placeholder='e.g. Catalog Moderator' invalid={!!errors.roleName} />
          </FormField>
          <FormField label='Super Admin' hint='Grants unrestricted platform access'>
            <Controller
              control={control}
              name="isSuperAdmin"
              render={({ field })=> (
                <Checkbox label='Enable' checked={field.value} onChange={e=>field.onChange(e.target.checked)} />
              )}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        title='Permissions Matrix'
        description='Toggle capabilities for each module. Disabled when Super Admin is active.'
      >
        <div className='space-y-5'>
            
      <Controller
            control={control}
            name="permissions"
            render={({ field })=> (
        <PermissionMatrix value={field.value} onChange={newValues=>field.onChange(newValues)} superAdmin={isSuperAdmin} />
            )}
          />
        </div>
      </FormSection>

      <div className="flex justify-end">
        <Button type='submit' disabled={submitting} icon={CheckIcon}>{submitting ? 'Saving...' : submitLabel}</Button>
      </div>

        <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-4 py-3 flex items-center justify-end gap-3 shadow-lg">
          <Button size='sm' type='submit' disabled={submitting} icon={CheckIcon}>{submitting ? 'Saving...' : submitLabel}</Button>
        </div>      
    </form>
  );
}