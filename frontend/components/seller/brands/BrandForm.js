"use client";
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import FileInput from '@/components/ui/FileInput';
import FormSection from '@/components/ui/FormSection';
import Button from '@/components/ui/Button';

/**
 * BrandForm (Seller)
 * Enhanced seller brand creation form with dynamic file previews and validation.
 */
export default function BrandForm({ initial, onSubmit, formId }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: initial?.name || "",
      proofFile: initial?.proofFile || null,
    },
  });

  const handleFileChange = (fileId) => {
    // FileInput now only returns fileId (string) or null
    setValue("proofFile", fileId, { shouldValidate: true });
  };

  const onFormSubmit = async (data) => {
    const payload = { name: data.name.trim() };
    if (typeof data.proofFile === "string" && data.proofFile) {
      payload.proofFile = data.proofFile;
    } else {
      return; // Proof file is required
    }
    await onSubmit?.(payload);
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <FormSection
        title="Brand Details"
        description="Provide the brand name and upload proof. Proof file is required."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="Brand Name" required error={errors.name?.message}>
            <Input
              placeholder="e.g. Acme Corp"
              invalid={!!errors.name}
              {...register("name", {
                required: "Brand name is required",
                minLength: { value: 2, message: "Min 2 chars" },
              })}
            />
          </FormField>
          <FormField
            label="Ownership Proof"
            hint="Upload a document or image proving ownership/authorization (JPG/PNG/PDF up to 5MB)"
            error={errors.proofFile?.message}
            required
          >
            <FileInput
              id="brand-proof"
              accept="image/*,application/pdf"
              folder="brands"
              value={watch("proofFile")}
              onChange={handleFileChange}
              placeholder="Upload proof file"
              maxSizeMB={5}
            />
            <input
              type="hidden"
              {...register("proofFile", {
                validate: (v) => (typeof v === "string" && v.length > 0) || "Proof file is required",
              })}
            />
          </FormField>
        </div>
      </FormSection>
    </form>
  );
}

// Usage Examples:
// <BrandForm onCreated={(b) => refreshList()} />
// <BrandForm formId="brand-create" onSubmittingChange={setSubmitting} onCreated={(b) => router.push(`/seller/brands/${b._id}`)} />
