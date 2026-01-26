"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { useAlert } from "@/components/ui/AlertManager";
import PostBuyRequirementSuccess from "./PostBuyRequirementSuccess";
import buyerBuyRequirementAPI from "@/utils/api/buyer/buyRequirement";

import {
  CubeIcon,
  DocumentTextIcon,
  HashtagIcon,
  CurrencyRupeeIcon,
  MapPinIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

const UNITS = [
  { value: "pcs", label: "Pieces" },
  { value: "box", label: "Boxes" },
  { value: "kg", label: "Kilograms" },
  { value: "ton", label: "Tons" },
  { value: "ltr", label: "Liters" },
  { value: "unit", label: "Units" },
];

export default function PostBuyRequirementDialog({
  open,
  onClose,
  defaultProductName = "",
}) {
  const pushAlert = useAlert();
  const [showSuccess, setShowSuccess] = useState(false);
  const [postedRequirement, setPostedRequirement] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      productName: "",
      description: "",
      quantity: "",
      unit: "pcs",
      budgetMin: "",
      budgetMax: "",
      city: "",
    },
  });

  const description = watch("description");

  useEffect(() => {
    if (open) {
      reset({
        productName: defaultProductName || "",
        description: "",
        quantity: "",
        unit: "pcs",
        budgetMin: "",
        budgetMax: "",
        city: "",
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
        budget: {
          min: Number(data.budgetMin),
          max: Number(data.budgetMax),
        },
        city: data.city.trim(),
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
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Posting…" : "Post Requirement"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Product Name */}
          <div className="sm:col-span-2">
            <FormField
              label="Product Name"
              htmlFor="productName"
              required
              error={errors.productName?.message}
            >
              <Input
                id="productName"
                {...register("productName", {
                  required: "Please enter the product name",
                  minLength: {
                    value: 2,
                    message: "Min 2 chars",
                  },
                  maxLength: {
                    value: 200,
                    message: "Max 200 chars",
                  },
                })}
                placeholder="e.g. Stainless steel bolts"
                invalid={!!errors.productName}
              />
            </FormField>
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <FormField
              label="Requirement Details"
              htmlFor="description"
              required
              error={errors.description?.message}
              hint={
                <div className="flex items-center justify-between w-full">
                  <span>Be specific to get relevant quotes faster.</span>
                  <span>{Math.max(0, description?.length || 0)}/500</span>
                </div>
              }
            >
              <Textarea
                id="description"
                rows={4}
                {...register("description", {
                  required: "Describe your requirement (min 10 chars)",
                  validate: (value) => {
                    const trimmed = value?.trim() || "";
                    return (
                      trimmed.length >= 10 ||
                      "Describe your requirement (min 10 chars)"
                    );
                  },
                  maxLength: {
                    value: 2000,
                    message: "Maximum 2000 characters allowed",
                  },
                })}
                placeholder="Size, material, grade, packaging, delivery location…"
                invalid={!!errors.description}
              />
            </FormField>
          </div>

          {/* Quantity */}
          <div className="">
            <FormField
              label="Order Quantity"
              htmlFor="quantity"
              required
              error={errors.quantity?.message}
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <HashtagIcon className="h-4 w-4" />
                </div>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  className="pl-9"
                  {...register("quantity", {
                    required: "Enter quantity",
                    validate: (value) =>
                      Number(value) > 0 || "Enter valid quantity",
                  })}
                  placeholder="e.g. 1000"
                  invalid={!!errors.quantity}
                />
              </div>
            </FormField>
          </div>

          {/* Unit */}
          <div className="">
            <FormField
              label="Unit"
              htmlFor="unit"
              required
              error={errors.unit?.message}
            >
              <Select
                id="unit"
                {...register("unit", { required: "Select a unit" })}
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          {/* City */}
          <div className="sm:col-span-1">
            <FormField
              label="Delivery City"
              htmlFor="city"
              required
              error={errors.city?.message}
            >
              <Input
                id="city"
                {...register("city", {
                  required: "Please enter your city",
                  minLength: { value: 2, message: "Invalid city" },
                })}
                placeholder="e.g. Mumbai, Delhi"
                invalid={!!errors.city}
              />
            </FormField>
          </div>

          {/* Budget - Min/Max */}
          <div className="sm:col-span-1">
            <FormField
              label="Budget (Min - Max)"
              required
              error={errors.budgetMin?.message || errors.budgetMax?.message}
            >
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <span className="text-sm font-semibold">₹</span>
                  </div>
                  <Input
                    className="pl-7"
                    type="number"
                    placeholder="Min"
                    {...register("budgetMin", {
                      required: "Min budget required",
                      validate: (value) => {
                        const max = watch("budgetMax");
                        return (
                          !max ||
                          Number(value) < Number(max) ||
                          "Min must be less than Max"
                        );
                      },
                    })}
                    invalid={!!errors.budgetMin}
                  />
                </div>
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <span className="text-sm font-semibold">₹</span>
                  </div>
                  <Input
                    className="pl-7"
                    type="number"
                    placeholder="Max"
                    {...register("budgetMax", {
                      required: "Max budget required",
                      validate: (value) => {
                        const min = watch("budgetMin");
                        return (
                          !min ||
                          Number(value) > Number(min) ||
                          "Max must be greater than Min"
                        );
                      },
                    })}
                    invalid={!!errors.budgetMax}
                  />
                </div>
              </div>
            </FormField>
          </div>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4 flex gap-3 items-start shadow-sm">
          <ShoppingBagIcon className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-800 leading-5">
            <span className="font-semibold block mb-0.5">
              Posting is Free & Fast
            </span>
            We'll notify verified suppliers matching your requirement and share
            their competitive quotes directly with you.
          </div>
        </div>
      </form>
    </Modal>
  );
}
