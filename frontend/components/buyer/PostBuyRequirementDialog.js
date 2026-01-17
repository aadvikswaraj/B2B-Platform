"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { useAlert } from "@/components/ui/AlertManager";
import PostBuyRequirementSuccess from "./PostBuyRequirementSuccess";
import buyerBuyRequirementAPI from "@/utils/api/buyer/buyRequirement";

const UNITS = [
  { value: "pcs", label: "Pieces" },
  { value: "box", label: "Boxes" },
  { value: "kg", label: "Kilograms" },
  { value: "ton", label: "Tons" },
  { value: "ltr", label: "Liters" },
  { value: "unit", label: "Units" },
];

export default function PostBuyRequirementDialog({ open, onClose, defaultProductName = "" }) {
  const pushAlert = useAlert();
  const [showSuccess, setShowSuccess] = useState(false);
  const [postedRequirement, setPostedRequirement] = useState(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm({
    mode: 'onChange',
    defaultValues: {
      productName: "",
      description: "",
      quantity: "",
      unit: "pcs",
    }
  });

  const description = watch('description');

  useEffect(() => {
    if (open) {
      reset({
        productName: defaultProductName || "",
        description: "",
        quantity: "",
        unit: "pcs",
      });
      setShowSuccess(false);
      setPostedRequirement(null);
    }
  }, [open, defaultProductName, reset]);

  async function onSubmit(data) {
    try {
      const payload = {
        productName: data.productName.trim(),
        description: data.description.trim(),
        quantity: Number(data.quantity),
        unit: data.unit,
      };

      // Direct fetch for now as BuyerAPI might not be set up
      const response = await buyerBuyRequirementAPI.create(payload);
      
      if (response.success) {
        pushAlert("success", "Buy requirement posted successfully");
        setPostedRequirement(payload);
        setShowSuccess(true);
      } else {  
        pushAlert("error", response.message || "Failed to post requirement");
      }
    } catch (err) {
      console.error(err);
      pushAlert("error", err?.message || "Failed to post requirement");
    }
  }

  if (showSuccess) {
    return (
      <PostBuyRequirementSuccess 
        open={true} 
        onClose={() => {
          setShowSuccess(false);
          onClose?.();
        }} 
        requirement={postedRequirement} 
      />
    );
  }

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      title="Post Buy Requirement"
      size="lg"
      mobileMode="fullscreen"
      actions={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? "Posting…" : "Post Requirement"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Product name</label>
            <Input
              {...register("productName", {
                required: "Please enter the product name"
              })}
              placeholder="e.g. Stainless steel bolts"
              invalid={!!errors.productName}
            />
            {errors.productName && (
              <p className="mt-1 text-[11px] text-rose-600">{errors.productName.message}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Describe your requirement</label>
            <Textarea
              rows={4}
              {...register("description", {
                required: "Describe your requirement (min 10 chars)",
                validate: (value) => {
                  const trimmed = value?.trim() || "";
                  return trimmed.length >= 10 || "Describe your requirement (min 10 chars)";
                },
                maxLength: { value: 500, message: "Maximum 500 characters allowed" }
              })}
              placeholder="Size, material, grade, packaging, delivery location…"
              invalid={!!errors.description}
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-gray-500">
              <span>Be specific to get relevant quotes faster.</span>
              <span>{Math.max(0, description?.length || 0)}/500</span>
            </div>
            {errors.description && (
              <p className="mt-1 text-[11px] text-rose-600">{errors.description.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Order quantity</label>
            <Input
              type="number"
              min={1}
              inputMode="numeric"
              {...register("quantity", {
                required: "Enter a valid quantity",
                validate: (value) => {
                  const num = Number(value);
                  return (Number.isFinite(num) && num > 0) || "Enter a valid quantity";
                }
              })}
              placeholder="e.g. 1000"
              invalid={!!errors.quantity}
            />
            {errors.quantity && (
              <p className="mt-1 text-[11px] text-rose-600">{errors.quantity.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
            <Select {...register("unit", { required: "Select a unit" })}>
              {UNITS.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </Select>
            {errors.unit && (
              <p className="mt-1 text-[11px] text-rose-600">{errors.unit.message}</p>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-[11px] text-indigo-700">
          We'll notify verified suppliers and share their quotes with you. Posting is free.
        </div>
      </form>
    </Modal>
  );
}
