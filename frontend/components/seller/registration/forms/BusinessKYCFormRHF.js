import { useForm } from "react-hook-form";
import { useEffect } from "react";
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

  // Ensure any incoming defaultValues IDs are hydrated into RHF state
  useEffect(() => {
    ["panFile", "gstinFile", "signatureFile"].forEach((key) => {
      const current = watch(key);
      if (!current && typeof defaultValues?.[key] === "string") {
        setValue(key, defaultValues[key], { shouldValidate: false });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  const handleFileChange = (value, type) => {
    if (typeof value === "string" || value === null) {
      setValue(type, value, { shouldValidate: true });
      return;
    }
    const file = value?.target?.files?.[0] || null;
    setValue(type, file, { shouldValidate: true });
  };

  // Helper: only require file if neither file nor preview URL exists
  const isPanFileRequired = !(watch("panFile") || defaultValues?.panFileUrl);
  const isGstinFileRequired = !(
    watch("gstinFile") || defaultValues?.gstinFileUrl
  );
  const isSignatureFileRequired = !(
    watch("signatureFile") || defaultValues?.signatureFileUrl
  );

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
              upload
              folder="kyc"
              value={watch("panFile")}
              onChange={(v) => handleFileChange(v, "panFile")}
              viewUrl={defaultValues?.panFileUrl || undefined}
              placeholder="Upload PAN proof"
              maxSizeBytes={5 * 1024 * 1024}
            />
            {/* RHF validation for required file only if not present */}
            <input
              type="hidden"
              {...register("panFile", {
                validate: (f) => {
                  if (isPanFileRequired) {
                    return (
                      (typeof f === "string" && !!f) || "PAN proof is required"
                    );
                  }
                  return true;
                },
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
              upload
              folder="kyc"
              value={watch("gstinFile")}
              onChange={(v) => handleFileChange(v, "gstinFile")}
              viewUrl={defaultValues?.gstinFileUrl || undefined}
              placeholder="Upload GSTIN certificate"
              maxSizeBytes={5 * 1024 * 1024}
            />
            <input
              type="hidden"
              {...register("gstinFile", {
                validate: (f) => {
                  if (isGstinFileRequired) {
                    return (
                      (typeof f === "string" && !!f) ||
                      "GSTIN certificate is required"
                    );
                  }
                  return true;
                },
              })}
            />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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
              upload
              folder="kyc"
              value={watch("signatureFile")}
              onChange={(v) => handleFileChange(v, "signatureFile")}
              viewUrl={defaultValues?.signatureFileUrl || undefined}
              placeholder="Upload signature file"
            />
            <input
              type="hidden"
              {...register("signatureFile", {
                validate: (f) => {
                  if (isSignatureFileRequired) {
                    return (
                      (typeof f === "string" && !!f) ||
                      "Signature file is required"
                    );
                  }
                  return true;
                },
              })}
            />
          </FormField>
          <FormField
            label="Company Name"
            htmlFor="companyName"
            required
            error={errors.companyName?.message}
          >
            <Input
              id="companyName"
              placeholder="Enter Company Name"
              invalid={!!errors.companyName}
              {...register("companyName", {
                required: "Company Name is required",
              })}
            />
          </FormField>
        </div>
      </FormSection>
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-200 z-10 flex gap-4 md:static md:w-full md:p-0 md:bg-transparent md:border-none md:z-0 md:mt-4 md:justify-start">
        <Button
          type="button"
          variant="outline"
          size="md"
          className="w-1/2 md:w-auto"
          onClick={onBack}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="solid"
          size="md"
          className="w-1/2 md:w-auto"
          loading={loading}
        >
          Next
        </Button>
      </div>
      <div className="h-20 md:hidden" />{" "}
      {/* Spacer for fixed footer on mobile only */}
    </form>
  );
}
