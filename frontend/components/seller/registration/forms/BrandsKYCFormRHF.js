import { useForm, useFieldArray } from 'react-hook-form';
import { useState } from 'react';
import FormSection from '@/components/ui/FormSection';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import FileInput from '@/components/ui/FileInput';

export default function BrandsKYCFormRHF({ defaultValues, onBack, onSubmit }) {
  const { control, register, handleSubmit, formState: { errors }, setValue } = useForm({ defaultValues });
  const { fields, append, remove } = useFieldArray({ control, name: 'brands' });
  const [proofPreviews, setProofPreviews] = useState({});

  const handleProofChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      setValue(`brands.${index}.proofFile`, file);
      const reader = new FileReader();
      reader.onload = () => {
        setProofPreviews(prev => ({ ...prev, [index]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
  <FormSection dense title="Brands KYC" description="Add your brands and upload proof documents.">
        <div className="space-y-4">
          {fields.map((item, index) => (
            <div key={item.id} className="p-3 rounded-lg border border-gray-200 bg-white">
              <FormField label="Brand Name" htmlFor={`brand_${index}`} required error={errors.brands?.[index]?.name?.message}>
                <Input id={`brand_${index}`} placeholder="Brand name" invalid={!!errors.brands?.[index]?.name} {...register(`brands.${index}.name`, { required: 'Brand name required' })} />
              </FormField>
              <FormField label="Proof Document" htmlFor={`brand_proof_${index}`} hint="Image or PDF">
                <FileInput id={`brand_proof_${index}`} accept="image/*,.pdf" onChange={e => handleProofChange(e, index)} viewUrl={proofPreviews[index] || undefined} placeholder="Upload brand proof" />
                {proofPreviews[index] && <img src={proofPreviews[index]} alt="Proof Preview" className="mt-2 h-12 rounded border" />}
              </FormField>
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => remove(index)}>Remove</Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={() => append({ name: '', proofFile: null })}>+ Add Brand</Button>
        </div>
      </FormSection>
      <div className="flex gap-2 mt-2">
        <Button type="button" variant="outline" size="md" onClick={onBack}>Back</Button>
        <Button type="submit" variant="solid" size="md">Finish</Button>
      </div>
    </form>
  );
}
