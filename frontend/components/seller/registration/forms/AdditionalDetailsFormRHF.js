"use client";
import { useForm } from "react-hook-form";
import FormSection from '@/components/ui/FormSection';
import { FormField } from '@/components/ui/FormField';
import { Input, Select, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function AdditionalDetailsFormRHF({ defaultValues = {}, onBack, onSubmit }) {
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
  <FormSection dense title="Additional Info" description="Tell buyers more about your business. All fields are mobile-friendly.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Contact Person" htmlFor="contactPerson" required error={errors.contactPerson?.message}>
            <Input id="contactPerson" placeholder="Full name" invalid={!!errors.contactPerson} {...register("contactPerson", { required: "Required" })} />
          </FormField>
          <FormField label="Phone Number" htmlFor="phoneNumber" required error={errors.phoneNumber?.message}>
            <Input id="phoneNumber" placeholder="10-digit mobile" inputMode="numeric" invalid={!!errors.phoneNumber} {...register("phoneNumber", { required: "Required", pattern: { value: /^\d{10}$/, message: "Enter 10 digits" } })} />
          </FormField>
          <FormField label="Annual Turnover" htmlFor="annualTurnover" hint="Approximate yearly revenue" error={errors.annualTurnover?.message}>
            <Input id="annualTurnover" placeholder="e.g., 5,00,000" inputMode="numeric" invalid={!!errors.annualTurnover} {...register("annualTurnover", { pattern: { value: /^\d{1,12}$/, message: "Numbers only" } })} />
          </FormField>
          <FormField label="Employee Count" htmlFor="employeeCount" error={errors.employeeCount?.message}>
            <Input id="employeeCount" placeholder="e.g., 25" inputMode="numeric" invalid={!!errors.employeeCount} {...register("employeeCount", { pattern: { value: /^\d{1,6}$/, message: "Enter a valid number" } })} />
          </FormField>
          <FormField className="sm:col-span-2" label="Business Category" htmlFor="businessCategory" required error={errors.businessCategory?.message}>
            <Select id="businessCategory" {...register("businessCategory", { required: "Select one" })}>
              <option value="">Select…</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="trading">Trading</option>
              <option value="services">Services</option>
            </Select>
          </FormField>
          <FormField className="sm:col-span-2" label="Product Categories" htmlFor="productCategories" hint="Comma separated (e.g., bearings, pumps)">
            <Input id="productCategories" placeholder="Comma separated (e.g., bearings, pumps)" {...register("productCategories")} />
          </FormField>
          <FormField className="sm:col-span-2" label="About Your Business" htmlFor="description" error={errors.description?.message}>
            <Textarea id="description" rows={4} placeholder="Short description that appears on your store." {...register("description", { maxLength: { value: 500, message: "Max 500 chars" } })} />
          </FormField>
        </div>
      </FormSection>
      <div className="sticky bottom-0 -mx-5 -mb-5 flex justify-between gap-3 border-t border-gray-200 bg-white/80 px-5 py-3 backdrop-blur sm:static sm:m-0 sm:border-0 sm:bg-transparent sm:p-0">
        <Button type="button" variant="outline" size="md" onClick={onBack}>Back</Button>
        <Button type="submit" disabled={isSubmitting}>Save & Continue</Button>
      </div>
    </form>
  );
}
