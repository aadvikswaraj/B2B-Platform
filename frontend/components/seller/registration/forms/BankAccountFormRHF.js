import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import FormSection from '@/components/ui/FormSection';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import FileInput from '@/components/ui/FileInput';

export default function BankAccountFormRHF({ defaultValues, loading, onBack, onSubmit }) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({ defaultValues });
  const [chequePreview, setChequePreview] = useState(null);
  
  // Rehydrate cancelled cheque preview and RHF values from defaultValues when step remounts
  useEffect(() => {
    const existing = watch('cancelledChequeFile');
    if (!existing && typeof defaultValues?.cancelledChequeFile === 'string') {
      setValue('cancelledChequeFile', defaultValues.cancelledChequeFile, { shouldValidate: false });
    }
    if (!existing && defaultValues?.cancelledChequeFileUrl) {
      setChequePreview(defaultValues.cancelledChequeFileUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues, setValue, watch('cancelledChequeFile')]);
  // removed finder UI state

  // Simulate auto-fetch account holder and IFSC details
  const fetchBankDetails = async () => {
    // Replace with real API call
    const currentIfsc = (watch('ifsc') || '').toUpperCase();
    if (currentIfsc !== watch('ifsc')) {
      setValue('ifsc', currentIfsc, { shouldValidate: true });
    }
    if (watch('accountNumber') && currentIfsc) {
      setValue('accountHolder', 'Auto Fetched Holder');
    }
  };

  // Watch for changes to auto-fetch
  const accountNumber = watch('accountNumber');
  const ifsc = watch('ifsc');
  // Use effect for auto-fetch
  // useEffect(() => { fetchBankDetails(); }, [accountNumber, ifsc]);

  const handleChequeChange = (value) => {
    if (typeof value === 'string' || value === null) {
      // If we got a new uploaded file id, stop forcing the old preview URL.
      if (typeof value === 'string' && value) setChequePreview(null);
      setValue('cancelledChequeFile', value, { shouldValidate: true });
      return;
    }
    const file = value?.target?.files?.[0] || null;
    setValue('cancelledChequeFile', file, { shouldValidate: true });
  };

  // Helper: only require file if neither file nor preview URL exists
  const isChequeFileRequired = !(watch('cancelledChequeFile') || chequePreview || defaultValues?.cancelledChequeFileUrl);

  // Async IFSC validation using Razorpay IFSC service with backend fallback
  const validateIfscRemote = async (value) => {
    const ifsc = (value || '').toUpperCase();
    if (!ifsc) return 'IFSC required';
    // Basic format check first
    const pattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!pattern.test(ifsc)) return 'Invalid IFSC code';
    try {
      const res = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
      if (res.ok) return true;
      // Try backend proxy if available
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
        const bres = await fetch(`${base}/bank/ifsc/validate/${ifsc}`);
        if (bres.ok) return true;
      } catch {}
      return 'IFSC not found';
    } catch (e) {
      // Network issue: degrade to format-only pass to not block user unnecessarily
      return true;
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
  <FormSection dense title="Bank Account" description="Enter your bank details. We'll auto-fill account holder after IFSC and account number are valid.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Account Number" htmlFor="accountNumber" required error={errors.accountNumber?.message}>
            <Input id="accountNumber" placeholder="1234567890"
              invalid={!!errors.accountNumber}
              {...register('accountNumber', { required: 'Account number required', pattern: { value: /^[0-9]{9,18}$/, message: 'Invalid account number' } })}
            />
          </FormField>
          <FormField label="IFSC Code" htmlFor="ifsc" required error={errors.ifsc?.message}>
            <Input id="ifsc" placeholder="HDFC0001234"
              invalid={!!errors.ifsc}
              {...register('ifsc', { validate: validateIfscRemote })}
              onBlur={fetchBankDetails}
            />
          </FormField>
        </div>
        <FormField label="Account Holder" htmlFor="accountHolder" hint="Auto-fetched based on IFSC and account number.">
          <Input id="accountHolder" placeholder="Account holder name" readOnly {...register('accountHolder')} />
        </FormField>
        <FormField 
          label="Cancelled Cheque" 
          htmlFor="cancelledChequeFile" 
          hint="Upload a clear image or PDF of your cancelled cheque."
          error={errors.cancelledChequeFile?.message}
          required={isChequeFileRequired}
        >
          <FileInput 
            id="cancelledChequeFile" 
            accept="image/*,.pdf" 
            upload
            folder="kyc"
            value={watch('cancelledChequeFile')}
            onChange={handleChequeChange} 
            viewUrl={chequePreview || undefined} 
            placeholder="Upload cancelled cheque" 
            maxSizeBytes={5 * 1024 * 1024}
          />
          {/* RHF validation for required file only if not present */}
          <input
            type="hidden"
            {...register("cancelledChequeFile", {
              validate: f => {
                if (isChequeFileRequired) return (typeof f === 'string' && f) || "Cancelled cheque is required";
                return true;
              }
            })}
          />
        </FormField>
      </FormSection>
      {/* IFSC finder UI removed; field validates via Razorpay API */}
      <div className="flex gap-2 mt-2">
        <Button type="button" variant="outline" size="md" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button type="submit" variant="solid" size="md" loading={loading}>
          Next
        </Button>
      </div>
    </form>
  );
}
