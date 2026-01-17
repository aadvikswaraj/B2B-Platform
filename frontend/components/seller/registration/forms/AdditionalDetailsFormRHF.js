"use client";
import { useForm } from "react-hook-form";
import FormSection from '@/components/ui/FormSection';
import { FormField } from '@/components/ui/FormField';
import { Input, Select, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { annualTurnoverOptions, businessCategoryOptions, employeeCountOptions } from "@/data/businessDetails";

export default function AdditionalDetailsFormRHF({ defaultValues = {}, loading, onBack, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    defaultValues: {
      contactPerson: "",
      phoneNumber: "",
      businessCategory: "",
      productCategories: [],
      description: "",
      annualTurnover: "",
      employeeCount: "",
      ...defaultValues,
    },
    mode: "onTouched",
  });

  const submit = (data) => onSubmit?.(data);

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
  <FormSection dense title="Additional Info" description="Tell buyers more about your business.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Contact Person" htmlFor="contactPerson" required error={errors.contactPerson?.message}>
            <Input id="contactPerson" placeholder="Full name" invalid={!!errors.contactPerson} {...register("contactPerson", { required: "Required" })} />
          </FormField>
          <FormField label="Phone Number" htmlFor="phoneNumber" hint="From your account" error={errors.phoneNumber?.message}>
            <Input id="phoneNumber" placeholder="10-digit mobile" inputMode="tel" disabled readOnly invalid={!!errors.phoneNumber} {...register("phoneNumber")} />
          </FormField>
          <FormField label="Annual Turnover" htmlFor="annualTurnover" hint="Approximate yearly revenue" error={errors.annualTurnover?.message}>
            <Select id="annualTurnover" {...register("annualTurnover", { required: "Select one" })}>
              <option value="">Select…</option>
              {annualTurnoverOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Employee Count" htmlFor="employeeCount" error={errors.employeeCount?.message}>
            <Select id="employeeCount" {...register("employeeCount", { required: "Select one" })}>
              <option value="">Select…</option>
              {employeeCountOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField className="sm:col-span-2" label="Business Category" htmlFor="businessCategory" required error={errors.businessCategory?.message}>
            <Select id="businessCategory" {...register("businessCategory", { required: "Select one" })}>
              <option value="">Select…</option>
              {businessCategoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField className="sm:col-span-2" label="About Your Business" htmlFor="description" error={errors.description?.message}>
            <Textarea id="description" rows={4} placeholder="Short description that appears on your store." {...register("description", { maxLength: { value: 500, message: "Max 500 chars" } })} />
          </FormField>
        </div>
      </FormSection>
      <div className="sticky bottom-0 -mx-5 -mb-5 flex justify-between gap-3 border-t border-gray-200 bg-white/80 px-5 py-3 backdrop-blur sm:static sm:m-0 sm:border-0 sm:bg-transparent sm:p-0">
        <Button type="button" variant="outline" size="md" onClick={onBack} disabled={loading}>Back</Button>
        <Button type="submit" loading={loading || isSubmitting}>Save & Continue</Button>
      </div>
    </form>
  );
}
