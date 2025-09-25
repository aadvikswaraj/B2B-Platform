import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import FormSection from "@/components/ui/FormSection";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FileInput from "@/components/ui/FileInput";

export default function BusinessKYCFormRHF({
  defaultValues,
  loading,
  onBack,
  onSubmit,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({ defaultValues });
  const [panFilePreview, setPanFilePreview] = useState(null);
  const [gstinFilePreview, setGstinFilePreview] = useState(null);
  const [signatureFilePreview, setSignatureFilePreview] = useState(null);

  // Rehydrate previews and RHF values from defaultValues when step remounts
  useEffect(() => {
    const files = [
      { key: "panFile", setPreview: setPanFilePreview, urlKey: "panFileUrl" },
      { key: "gstinFile", setPreview: setGstinFilePreview, urlKey: "gstinFileUrl" },
      { key: "signatureFile", setPreview: setSignatureFilePreview, urlKey: "signatureFileUrl" },
    ];
    const urls = [];
    files.forEach(({ key, setPreview, urlKey }) => {
      const f = watch(key) || defaultValues?.[key];
      if (f instanceof File) {
        setValue(key, f, { shouldValidate: false });
        const url = URL.createObjectURL(f);
        urls.push(url);
        setPreview(url);
      } else if (defaultValues?.[urlKey]) {
        setPreview(defaultValues[urlKey]);
      } else {
        setPreview(null);
      }
    });
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues, setValue, watch("panFile"), watch("gstinFile"), watch("signatureFile")]);

  // File preview handlers
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setValue(type, file, { shouldValidate: true });
    } else {
      setValue(type, null, { shouldValidate: true });
    }
  };

  // Helper: only require file if neither file nor preview URL exists
  const isPanFileRequired = !(panFilePreview || defaultValues?.panFileUrl);
  const isGstinFileRequired = !(gstinFilePreview || defaultValues?.gstinFileUrl);
  const isSignatureFileRequired = !(signatureFilePreview || defaultValues?.signatureFileUrl);

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <FormSection
        title="Business KYC"
        description="Provide your PAN, GSTIN and a signature file for verification."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="PAN"
            htmlFor="pan"
            required
            error={errors.pan?.message}
          >
            <Input
              id="pan"
              placeholder="ABCDE1234F"
              invalid={!!errors.pan}
              maxLength={10}
              onBlur={(e) => {
                const v = (e.target.value || "").toUpperCase().trim();
                if (v !== watch("pan"))
                  setValue("pan", v, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
              }}
              {...register("pan", {
                required: "PAN is required",
                pattern: {
                  value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                  message: "Invalid PAN format",
                },
              })}
            />
          </FormField>
          <FormField
            label="GSTIN"
            htmlFor="gstin"
            required
            error={errors.gstin?.message}
          >
            <Input
              id="gstin"
              placeholder="22ABCDE1234F1Z5"
              invalid={!!errors.gstin}
              maxLength={15}
              onBlur={(e) => {
                const v = (e.target.value || "")
                  .toUpperCase()
                  .replace(/\s+/g, "")
                  .trim();
                if (v !== watch("gstin"))
                  setValue("gstin", v, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
              }}
              {...register("gstin", {
                required: "GSTIN is required",
                pattern: {
                  value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
                  message: "Invalid GSTIN format",
                },
              })}
            />
          </FormField>
          <FormField
            label="PAN Proof"
            htmlFor="panFile"
            hint="Image or PDF, max 5 MB"
            error={errors.panFile?.message}
            required={isPanFileRequired}
          >
            <FileInput
              id="panFile"
              accept="image/*,application/pdf"
              onChange={(e) => handleFileChange(e, "panFile")}
              viewUrl={panFilePreview || undefined}
              placeholder="Upload PAN proof"
              maxSizeBytes={5 * 1024 * 1024}
            />
            {/* RHF validation for required file only if not present */}
            <input
              type="hidden"
              {...register("panFile", {
                validate: f => {
                  if (isPanFileRequired) return f instanceof File || "PAN proof is required";
                  return true;
                }
              })}
            />
          </FormField>
          <FormField
            label="GSTIN Certificate"
            htmlFor="gstinFile"
            hint="PDF or image, max 5 MB"
            error={errors.gstinFile?.message}
            required={isGstinFileRequired}
          >
            <FileInput
              id="gstinFile"
              accept="image/*,application/pdf"
              onChange={(e) => handleFileChange(e, "gstinFile")}
              viewUrl={gstinFilePreview || undefined}
              placeholder="Upload GSTIN certificate"
              maxSizeBytes={5 * 1024 * 1024}
            />
            <input
              type="hidden"
              {...register("gstinFile", {
                validate: f => {
                  if (isGstinFileRequired) return f instanceof File || "GSTIN certificate is required";
                  return true;
                }
              })}
            />
          </FormField>
        </div>
        <FormField
          label="Signature"
          htmlFor="signatureFile"
          hint="Upload a clear signature image or PDF."
          error={errors.signatureFile?.message}
          required={isSignatureFileRequired}
        >
          <FileInput
            id="signatureFile"
            accept="image/*,.pdf"
            onChange={(e) => handleFileChange(e, "signatureFile")}
            viewUrl={signatureFilePreview || undefined}
            placeholder="Upload signature file"
          />
          <input
            type="hidden"
            {...register("signatureFile", {
              validate: f => {
                if (isSignatureFileRequired) return f instanceof File || "Signature file is required";
                return true;
              }
            })}
          />
        </FormField>
      </FormSection>
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
