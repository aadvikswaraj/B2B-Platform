'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import AddressesAPI from '@/utils/api/addresses';
import AddressForm, { FIELD_SPECS_SECTIONS } from '@/components/buyer/addresses/AddressForm';

export default function EditAddressPage(){
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  // Build initial form state from FIELD_SPECS_SECTIONS
  const [form, setForm] = useState(() => {
    const acc = {};
    FIELD_SPECS_SECTIONS.forEach(section => {
      Object.entries(section.fields).forEach(([name, spec]) => {
        acc[name] = spec.defaultValue || '';
      });
    });
    return acc;
  });

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try {
        const res = await AddressesAPI.get(id);
        if (res.success && res.data?.address && mounted){
          const a = res.data.address;
          // Set form fields using FIELD_SPECS_SECTIONS
          setForm(f => {
            const updated = { ...f };
            FIELD_SPECS_SECTIONS.forEach(section => {
              Object.entries(section.fields).forEach(([name, spec]) => {
                updated[name] = a[name] !== undefined && a[name] !== null ? a[name] : (spec.defaultValue || '');
              });
            });
            return updated;
          });
        } else if (!res.success){
          setError(res.message || 'Failed to load address');
        }
      } catch(e){ setError(e.message || 'Failed to load'); }
      finally { if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false; };
  },[id]);

  const handleSubmit = async (values)=>{
    setSaving(true); setError(null);
    try {
      const res = await AddressesAPI.update(id, values);
      if (res.success){
        router.push('/myaccount/addresses');
        router.refresh?.();
        return { success: true };
      } else {
        return { success: false, message: res.message || 'Failed to update address' };
      }
    } catch(e){
      return { success: false, message: e.message || 'Update failed' };
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl mx-auto pb-24 space-y-10">
      <PageHeader
        backHref="/myaccount/addresses"
        backLabel="Addresses"
        title={loading ? 'Loading...' : 'Edit Address'}
        subtitle="Modify the selected saved address."
        primaryLabel={saving ? 'Saving...' : 'Save Changes'}
        primaryDisabled={saving || loading}
        onPrimary={()=> document.getElementById('address-generic-form')?.requestSubmit()}
      />

      {!loading && (
        <AddressForm
          initial={form}
          onSubmit={handleSubmit}
          saving={saving}
          submitLabel="Save Changes"
          onCancel={()=> router.push('/myaccount/addresses')}
        />
      )}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
    </div>
  );
}
