import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Controller } from "react-hook-form";
import TieredInput from "@/components/ui/TieredInput";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export default function TradePricing({
  register,
  control,
  errors,
  watch,
  priceType,
  setPriceType,
  salesMode = 'orders', // 'orders' | 'inquiry'
}) {
  const packagingLevels = watch("packagingLevels") || [];
  const shippingIndex = packagingLevels.reduce(
    (lastIdx, lvl, idx) => (lvl.isShippingUnit ? idx : lastIdx),
    -1
  );
  let unitsPerCarton = 1;
  if (shippingIndex > 0) {
    for (let i = 1; i <= shippingIndex; i++) {
      unitsPerCarton *= parseFloat(packagingLevels[i].containsQty) || 1;
    }
  }

  // --- Rendering Helpers ---

  const renderSimplePreview = (
    slabs,
    labelFn,
    valueFn,
    keyField = "minQty"
  ) => {
    const sorted = [...slabs].sort(
      (a, b) => (parseFloat(a[keyField]) || 0) - (parseFloat(b[keyField]) || 0)
    );
    return (
      <div className="space-y-2">
        {sorted.map((slab, i) => {
          const label = labelFn(slab, sorted[i + 1]);
          const value = valueFn(slab);
          if (!label || !value) return null;
          return (
            <div
              key={i}
              className="flex justify-between items-center text-sm border-b border-gray-100 last:border-0 py-1"
            >
              <span className="text-gray-600 font-medium">{label}</span>
              <span className="font-semibold">{value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const isInquiryMode = salesMode === 'inquiry';

  return (
    <div className="space-y-8">
      {/* Inquiry Mode Notice */}
      {isInquiryMode && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <InformationCircleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Inquiry-Only Pricing
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Set indicative pricing for buyers. Stock is not tracked in inquiry mode—negotiations happen offline.
            </p>
          </div>
        </div>
      )}

      {/* Basic Setup */}
      <div className={`grid grid-cols-1 ${isInquiryMode ? '' : 'md:grid-cols-2'} gap-6`}>
        <FormField
          label="Minimum Order Quantity (Units)"
          error={errors.moq?.message}
        >
          <Input
            type="number"
            {...register("moq", {
              required: "MOQ is required",
              min: { value: 1, message: "Min 1" },
            })}
          />
          {!isInquiryMode && (
            <p className="text-xs text-gray-500 mt-1">
              Recommended: Multiple of carton size ({unitsPerCarton})
            </p>
          )}
        </FormField>
        
        {/* Stock field - only show for orders mode */}
        {!isInquiryMode && (
          <FormField label="Stock (Units)" error={errors.stock?.message}>
            <Input
              type="number"
              {...register("stock", {
                required: salesMode === 'orders' ? "Stock is required" : false,
                min: { value: 0, message: "Min 0" },
              })}
              placeholder="100"
            />
          </FormField>
        )}
      </div>

      <div className="h-px bg-gray-200" />

      {/* Pricing Strategy */}
      <div>
        <Controller
          control={control}
          name="priceSlabs"
          defaultValue={[]}
          render={({ field: { value, onChange } }) => (
            <TieredInput
              title="Pricing Strategy"
              description="Set single price or volume-based price slabs."
              mode={priceType}
              onModeChange={setPriceType}
              singleLabel="Single"
              slabLabel="Slab"
              orderBy="minQty"
              // Single Mode Content
              renderSingle={
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Price per Unit (₹)"
                    error={errors.price?.message}
                  >
                    <Input
                      type="number"
                      step="0.01"
                      {...register("price", {
                        required: priceType === "single" && "Price is required",
                      })}
                      placeholder="0.00"
                    />
                  </FormField>
                  <FormField
                    label="Tax % (GST)"
                    error={errors.taxPercent?.message}
                  >
                    <select
                      {...register("taxPercent", {
                        required: "Tax is required",
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select GST Rate</option>
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="40">40%</option>
                    </select>
                  </FormField>
                </div>
              }
              // Slab Mode Content
              value={value || []}
              onChange={onChange}
              columns={[
                {
                  key: "minQty",
                  label: "Min Qty",
                  type: "number",
                  placeholder: "10",
                  required: true,
                  min: 1,
                },
                {
                  key: "price",
                  label: "Unit Price",
                  type: "number",
                  prefix: "₹",
                  placeholder: "0.00",
                  required: true,
                  min: 0,
                },
              ]}
              defaultSlab={{ minQty: "", price: "" }}
              showSortButton={true}
              sortButtonLabel="Sort by quantity"
              previewRenderer={(s) =>
                renderSimplePreview(
                  s,
                  (slab, next) => {
                    const min = slab.minQty || 0;
                    const max = next ? parseInt(next.minQty) - 1 : null;
                    return max ? `${min} – ${max} units` : `${min}+ units`;
                  },
                  (slab) => (
                    <span className="text-blue-700">₹{slab.price}</span>
                  ),
                  "minQty"
                )
              }
              renderSlabBottom={
                <div className="max-w-xs">
                  <FormField
                    label="Tax % (GST)"
                    error={errors.taxPercent?.message}
                  >
                    <select
                      {...register("taxPercent", {
                        required: "Tax is required",
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select GST Rate</option>
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="40">40%</option>
                    </select>
                  </FormField>
                </div>
              }
            />
          )}
        />
      </div>
    </div>
  );
}
