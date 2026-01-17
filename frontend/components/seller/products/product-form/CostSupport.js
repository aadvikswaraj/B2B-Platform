import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import TieredInput from "@/components/ui/TieredInput";
import { Controller } from "react-hook-form";

export default function CostSupport({
  register,
  control,
  errors,
  shippingTiers,
  addShippingTier,
  removeShippingTier,
}) {
  return (
    <div className="space-y-8">
      {/* Freight Support */}
      <Controller
        control={control}
        name="freightSupportSlabs"
        defaultValue={[]}
        render={({ field: { value, onChange } }) => (
          <TieredInput
            title="Freight Support"
            description='"Free Shipping" or "Capped Shipping" works best for B2B.'
            orderBy="minOrderVal"
            renderSingle={
              <div className="max-w-md">
                <FormField label="Flat Discount Amount (₹)">
                  <Input
                    type="number"
                    {...register("freightSupportFlat")}
                    placeholder="0.00"
                  />
                </FormField>
              </div>
            }
            value={value || []}
            onChange={onChange}
            columns={[
              {
                key: "minOrderVal",
                label: "Min Order Value",
                type: "number",
                prefix: "₹",
                required: true,
                min: 0,
              },
              {
                key: "supportAmount",
                label: "Support Amount",
                type: "number",
                prefix: "₹",
                required: true,
                min: 0,
              },
            ]}
            defaultSlab={{ minOrderVal: "", supportAmount: "" }}
            showSortButton={true}
            sortButtonLabel="Sort by value"
            previewRenderer={(s) =>
              renderSimplePreview(
                s,
                (slab) => `Orders > ₹${slab.minOrderVal}`,
                (slab) => (
                  <span className="text-green-600 font-medium">
                    - ₹{slab.supportAmount}
                  </span>
                ),
                "minOrderVal"
              )
            }
          />
        )}
      />
      {/* Payment Gateway Support */}
      <Controller
        control={control}
        name="paymentSupportSlabs"
        defaultValue={[]}
        render={({ field: { value, onChange } }) => (
          <TieredInput
            title="Payment Gateway Fee Support"
            description="Encourage prepaid orders by absorbing gateway fees."
            orderBy="minOrderVal"
            renderSingle={
              <div className="max-w-md">
                <FormField label="Absorb Percentage (%)">
                  <Input
                    type="number"
                    step="0.1"
                    {...register("paymentSupportFlat")}
                    placeholder="0.0"
                  />
                </FormField>
              </div>
            }
            value={value || []}
            onChange={onChange}
            columns={[
              {
                key: "minOrderVal",
                label: "Min Order Value",
                type: "number",
                prefix: "₹",
                required: true,
                min: 0,
              },
              {
                key: "supportPercent",
                label: "Absorb %",
                type: "number",
                suffix: "%",
                required: true,
                min: 0,
                max: 100,
              },
            ]}
            defaultSlab={{ minOrderVal: "", supportPercent: "" }}
            showSortButton={true}
            sortButtonLabel="Sort by value"
            previewRenderer={(s) =>
              renderSimplePreview(
                s,
                (slab) => `Orders > ₹${slab.minOrderVal}`,
                (slab) => (
                  <span className="text-purple-600 font-medium">
                    {slab.supportPercent}% covered
                  </span>
                ),
                "minOrderVal"
              )
            }
          />
        )}
      />
    </div>
  );
}
