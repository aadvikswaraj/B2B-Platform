import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import FormSection from '@/components/ui/FormSection';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';

export default function PickupAddressFormRHF({ defaultValues = {}, onBack, onSubmit }) {
  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger, resetField } = useForm({
    defaultValues: {
      addresses: defaultValues.addresses || [],
      pickupAddressId: defaultValues.pickupAddressId || '',
      newAddress: {
        line1: '', line2: '', city: '', state: '', pincode: '', contactName: '', contactPhone: ''
      },
    }
  });

  const addresses = watch('addresses');
  const pickupAddressId = watch('pickupAddressId');

  const isAddingNew = pickupAddressId === 'new';

  const addAddressNow = async () => {
    const ok = await trigger([
      'newAddress.line1','newAddress.city','newAddress.state','newAddress.pincode','newAddress.contactName','newAddress.contactPhone'
    ]);
    if (!ok) return;
    const id = `addr_${Date.now()}`;
    const addr = { id, ...watch('newAddress') };
    setValue('addresses', [...(addresses || []), addr], { shouldDirty: true });
    setValue('pickupAddressId', id, { shouldValidate: true });
    // Clear form for adding another if needed
    resetField('newAddress.line1');
    resetField('newAddress.line2');
    resetField('newAddress.city');
    resetField('newAddress.state');
    resetField('newAddress.pincode');
    resetField('newAddress.contactName');
    resetField('newAddress.contactPhone');
  };

  const submit = (data) => {
    let final = { ...defaultValues };
    if (isAddingNew) {
      const id = `addr_${Date.now()}`;
      const addr = { id, ...data.newAddress };
      final.addresses = [...(addresses || []), addr];
      final.pickupAddressId = id;
    } else {
      final.pickupAddressId = data.pickupAddressId;
      final.addresses = addresses || [];
    }
    onSubmit?.(final);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(submit)}>
      <FormSection dense title="Pickup Address" description="Choose a saved address or add a new one.">
        {/* Actions */}
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs text-gray-500">Select one address to schedule pickups.</p>
          <Button type="button" size="sm" variant="ghost" onClick={() => setValue('pickupAddressId', 'new')}>+ Add Address</Button>
        </div>

        {/* Address cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(addresses || []).map((a) => {
            const selected = pickupAddressId === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setValue('pickupAddressId', a.id, { shouldValidate: true })}
                className={`group relative flex h-full flex-col rounded-lg border p-4 text-left transition hover:shadow-sm focus:outline-none ${
                  selected ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/40' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h4 className={`line-clamp-1 text-sm font-semibold ${selected ? 'text-blue-700' : 'text-gray-900'}`}>{a.contactName || 'Unnamed'}</h4>
                  {selected ? (
                    <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-medium text-white">Selected</span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">Tap to select</span>
                  )}
                </div>
                <div className="text-xs leading-relaxed text-gray-600">
                  <p className="line-clamp-2">{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
                  <p>{a.city}{a.state ? `, ${a.state}` : ''} {a.pincode ? `- ${a.pincode}` : ''}</p>
                  {a.contactPhone && <p className="mt-1 text-gray-500">+91 {a.contactPhone}</p>}
                </div>
              </button>
            );
          })}

          {/* Add new address card */}
          <button
            type="button"
            onClick={() => setValue('pickupAddressId', 'new', { shouldValidate: true })}
            className={`flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition hover:border-blue-400 hover:bg-blue-50/40 ${
              isAddingNew ? 'border-blue-600 bg-blue-50/40' : 'border-gray-300 bg-white'
            }`}
          >
            <span className="mb-1 text-xl text-blue-600">＋</span>
            <span className="text-sm font-medium text-blue-700">Add Address</span>
            <span className="mt-1 text-xs text-gray-500">Create a new pickup location</span>
          </button>
        </div>

        {/* Validation message for selection */}
        {errors.pickupAddressId?.message && (
          <p className="mt-2 text-xs text-red-600">{errors.pickupAddressId.message}</p>
        )}

        {/* Hidden field to keep RHF validation for selection */}
        <input type="hidden" {...register('pickupAddressId', { required: 'Please choose or add an address' })} />

        {/* Add new address form */}
        {isAddingNew && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
            <h5 className="mb-3 text-sm font-semibold text-gray-900">New Address</h5>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Address Line 1" htmlFor="line1" required error={errors?.newAddress?.line1?.message}>
                <Input id="line1" placeholder="Building, street"
                  invalid={!!errors?.newAddress?.line1}
                  {...register('newAddress.line1', { required: 'Required' })}
                />
              </FormField>
              <FormField label="Address Line 2" htmlFor="line2" error={errors?.newAddress?.line2?.message}>
                <Input id="line2" placeholder="Area, landmark (optional)" {...register('newAddress.line2')} />
              </FormField>
              <FormField label="City" htmlFor="city" required error={errors?.newAddress?.city?.message}>
                <Input id="city" placeholder="City" invalid={!!errors?.newAddress?.city} {...register('newAddress.city', { required: 'Required' })} />
              </FormField>
              <FormField label="State" htmlFor="state" required error={errors?.newAddress?.state?.message}>
                <Input id="state" placeholder="State" invalid={!!errors?.newAddress?.state} {...register('newAddress.state', { required: 'Required' })} />
              </FormField>
              <FormField label="Pincode" htmlFor="pincode" required error={errors?.newAddress?.pincode?.message}>
                <Input id="pincode" placeholder="6-digit pincode" inputMode="numeric"
                  invalid={!!errors?.newAddress?.pincode}
                  {...register('newAddress.pincode', { required: 'Required', pattern: { value: /^\d{6}$/, message: 'Enter 6 digits' } })}
                />
              </FormField>
              <FormField label="Contact Name" htmlFor="contactName" required error={errors?.newAddress?.contactName?.message}>
                <Input id="contactName" placeholder="Pickup contact" invalid={!!errors?.newAddress?.contactName} {...register('newAddress.contactName', { required: 'Required' })} />
              </FormField>
              <FormField label="Contact Phone" htmlFor="contactPhone" required error={errors?.newAddress?.contactPhone?.message}>
                <Input id="contactPhone" placeholder="10-digit mobile" inputMode="numeric"
                  invalid={!!errors?.newAddress?.contactPhone}
                  {...register('newAddress.contactPhone', { required: 'Required', pattern: { value: /^\d{10}$/, message: 'Enter 10 digits' } })}
                />
              </FormField>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button type="button" size="sm" onClick={addAddressNow}>Save Address</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setValue('pickupAddressId', '', { shouldValidate: true })}>Cancel</Button>
            </div>
          </div>
        )}
      </FormSection>
      <div className="flex gap-2 mt-2">
        <Button type="button" variant="outline" size="md" onClick={onBack}>Back</Button>
        <Button type="submit" variant="solid" size="md">Finish</Button>
      </div>
    </form>
  );
}
