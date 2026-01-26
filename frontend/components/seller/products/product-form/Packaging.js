import { Input } from "@/components/ui/Input";
import { useFieldArray } from "react-hook-form";
import {
  PlusIcon,
  TrashIcon,
  CubeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ArrowDownIcon } from "lucide-react";

// Extracted Component to fix focus issue
const PackagingLevelRow = ({
  index,
  register,
  watch,
  remove,
  getTotalUnits,
  isLast,
  onShippingChange,
  isLocked,
}) => {
  const isBase = index === 0;
  const levelData = watch(`packagingLevels.${index}`);
  const isShipping = levelData?.isShippingUnit;
  const prevLevelName =
    index > 0 ? watch(`packagingLevels.${index - 1}.name`) || `L${index}` : "";

  // Auto-calc weight hint
  const prevWeight =
    index > 0
      ? parseFloat(watch(`packagingLevels.${index - 1}.weight`)) || 0
      : 0;
  const qty = parseFloat(levelData?.containsQty) || 0;
  const suggestedWeight =
    index > 0 && prevWeight && qty ? (prevWeight * qty).toFixed(2) : "";

  return (
    <div className="flex gap-4 group/row">
      {/* Left Rail: Hierarchy Connector & Badge */}
      <div className="flex flex-col items-center w-8 shrink-0 relative pt-6 md:pt-10">
        {/* Top Connector (connects to previous row) */}
        {index > 0 && (
          <div className="absolute top-0 h-10 w-0.5 bg-gray-200"></div>
        )}

        {/* The Badge (L0, L1...) - Acts as the node */}
        <div
          className={`
                    z-10 relative flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2
                    ${
                      isShipping
                        ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
                        : "bg-white border-gray-200 text-gray-400"
                    }
                 `}
        >
          L{index + 1}
        </div>

        {/* Bottom Connector (connects to next row) */}
        {!isLast && (
          <div className="flex-1 w-0.5 bg-gray-200 min-h-[2rem]"></div>
        )}
      </div>

      {/* Main Card Content */}
      <div
        className={`
                flex-1 relative transition-all duration-200
                bg-white border rounded-xl mb-4
                ${isShipping ? "border-blue-300 shadow-md ring-1 ring-blue-50" : "border-gray-200 shadow-sm hover:border-blue-300"}
            `}
      >
        {/* Shipping Label Tag (Absolute) */}
        {isShipping && (
          <div className="absolute -top-3 left-4 px-2.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm z-20 flex items-center gap-1.5">
            <CubeIcon className="w-3 h-3" />
            <span>Shipping Unit</span>
          </div>
        )}

        {/* Delete Button (floating top-right) */}
        {!isBase && (
          <button
            type="button"
            onClick={() => remove(index)}
            className="absolute -top-2 -right-2 p-1.5 bg-white text-gray-400 border border-gray-200 rounded-full hover:text-red-600 hover:border-red-200 hover:bg-red-50 shadow-sm transition-all z-30"
            title="Remove Level"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}

        <div className="p-4 pt-6 md:p-5 grid grid-cols-1 md:grid-cols-12 gap-y-4 gap-x-6 items-start">
          {/* 1. Identity Name - Spans 3 cols */}
          <div className="md:col-span-3">
            <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
              {isBase ? "Base Unit Name" : "Packaging Type"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <Input
              {...register(`packagingLevels.${index}.name`, {
                required: "Name is required",
              })}
              className="h-9 text-sm font-semibold border-gray-200 focus:border-blue-500 bg-gray-50/30 hover:bg-white transition-colors"
              placeholder={isBase ? "e.g. Bottle" : "e.g. Box"}
            />
          </div>

          {/* 2. Quantity (Contains) - Spans 3 cols */}
          <div className="md:col-span-3">
            <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
              Contains {!isBase && <span className="text-red-500">*</span>}
            </label>
            {isBase ? (
              <div className="h-9 flex items-center px-3 text-xs text-gray-400 bg-gray-50 rounded border border-dashed border-gray-200">
                1 (Base Item)
              </div>
            ) : (
              <div className="flex shadow-sm rounded-md ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-blue-600">
                <input
                  type="number"
                  {...register(`packagingLevels.${index}.containsQty`, {
                    required: true,
                    min: 1,
                  })}
                  className="block w-full min-w-0 flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 font-semibold"
                  placeholder="1"
                />
                <div className="flex items-center px-3 bg-gray-50 border-l border-gray-200 rounded-r-md">
                  <span className="text-xs text-gray-500 mr-1">of</span>
                  <span
                    className="text-xs font-medium text-gray-700 max-w-[60px] truncate"
                    title={prevLevelName}
                  >
                    {prevLevelName || `L${index}`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 3. Weight - Spans 2 cols */}
          <div className="md:col-span-2">
            <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
              Weight <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="number"
                step="0.001"
                {...register(`packagingLevels.${index}.weight`, {
                  required: "Weight is required",
                })}
                className="block w-full rounded-md border-0 py-1.5 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder={suggestedWeight || "0.00"}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 sm:text-xs">kg</span>
              </div>
            </div>
          </div>

          {/* 4. Dimensions - Spans 4 cols (Expanded to fill row) */}
          <div className="md:col-span-4">
            <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
              Dimensions{" "}
              <span className="normal-case font-normal text-gray-400">
                (L × W × H cm)
              </span>{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                {...register(`packagingLevels.${index}.dimensions.l`, {
                  required: true,
                })}
                placeholder="L"
                className="block w-full rounded-md border-0 py-1.5 text-center text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-xs"
              />
              <input
                type="number"
                {...register(`packagingLevels.${index}.dimensions.w`, {
                  required: true,
                })}
                placeholder="W"
                className="block w-full rounded-md border-0 py-1.5 text-center text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-xs"
              />
              <input
                type="number"
                {...register(`packagingLevels.${index}.dimensions.h`, {
                  required: true,
                })}
                placeholder="H"
                className="block w-full rounded-md border-0 py-1.5 text-center text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-xs"
              />
            </div>
          </div>

          {/* 5. Properties Row (Full Width on desktop now, to separate from inputs) */}
          <div className="md:col-span-12 flex items-center justify-end gap-4 pt-2 border-t border-gray-50 mt-1">
            {/* Stackable Toggle */}
            <label className="flex items-center gap-2 cursor-pointer group">
              <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors select-none">
                Stackable?
              </span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register(`packagingLevels.${index}.isStackable`)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>

            {/* Shipping Unit Checkbox */}
            <label
              className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-full transition-colors border ${isShipping ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-transparent hover:bg-gray-100"} ${isLocked ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-75" : ""}`}
            >
              <input
                type="checkbox"
                {...register(`packagingLevels.${index}.isShippingUnit`, {
                  onChange: (e) =>
                    onShippingChange &&
                    onShippingChange(index, e.target.checked),
                })}
                disabled={isLocked}
                className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:text-gray-400 disabled:cursor-not-allowed"
              />
              <span
                className={`text-xs select-none font-bold uppercase tracking-wide ${isShipping ? "text-blue-700" : "text-gray-500"} ${isLocked ? "text-gray-400" : ""}`}
              >
                {isLocked ? "Shipping Unit (Locked)" : "Is Shipping Unit"}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Packaging({
  control,
  register,
  errors,
  watch,
  setValue,
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "packagingLevels",
  });

  const levels = watch("packagingLevels");

  // Auto-set shipping units for lower levels (visually below / higher index)
  const onShippingChange = (index, isChecked) => {
    if (isChecked) {
      // If a level is marked as shipping unit, all containing levels (higher index)
      // should likely also be shipping units.
      for (let i = index + 1; i < fields.length; i++) {
        setValue(`packagingLevels.${i}.isShippingUnit`, true, {
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    }
    // Removed "Upward Unckeck" logic to respect user request to not uncheck upper levels automatically.
    // Instead, we lock the checkbox.
  };

  // Helper to get total units
  const getTotalUnits = (index) => {
    if (index === 0) return 1;
    const current = levels?.[index];
    const prevTotal = getTotalUnits(index - 1);
    const qty = parseFloat(current?.containsQty) || 1;
    return prevTotal * qty;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      {/* Main List */}
      <div className="lg:col-span-3">
        {/* Header Row (Desktop) */}
        <div className="hidden md:flex gap-4 px-0 mb-2">
          <div className="w-8 shrink-0"></div>{" "}
          {/* Spacer for alignment with Badge Rail */}
          <div className="flex-1 grid grid-cols-12 gap-6 px-5 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <div className="col-span-3">Identity</div>
            <div className="col-span-3">Contains</div>
            <div className="col-span-2">
              Weight <span className="normal-case font-normal">(kg)</span>
            </div>
            <div className="col-span-4 text-center">
              Dimensions <span className="normal-case font-normal">(cm)</span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          {fields.map((field, index) => {
            const prevIsShipping =
              index > 0 ? levels?.[index - 1]?.isShippingUnit || false : false;
            return (
              <PackagingLevelRow
                key={field.id}
                index={index}
                register={register}
                watch={watch}
                remove={remove}
                getTotalUnits={getTotalUnits}
                isLast={index === fields.length - 1}
                onShippingChange={onShippingChange}
                isLocked={prevIsShipping}
              />
            );
          })}
        </div>

        <div className="mt-4 flex gap-4">
          <div className="w-8 shrink-0"></div>{" "}
          {/* Spacer for alignment with rail */}
          <button
            type="button"
            onClick={() => {
              const lastLvl =
                levels && levels.length > 0 ? levels[levels.length - 1] : null;
              const isPrevShipping = lastLvl?.isShippingUnit || false;

              append({
                level: fields.length,
                name: "",
                containsQty: "",
                weight: "",
                dimensions: { l: "", w: "", h: "" },
                isStackable: true,
                isShippingUnit: isPrevShipping,
              });
            }}
            className="flex-1 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 font-medium hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Next Level</span>
          </button>
        </div>
      </div>

      {/* Compact Summary Side Panel */}
      <div className="lg:col-span-1">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 sticky top-4">
          <div className="flex items-center gap-2 mb-3 text-gray-900 font-semibold text-sm">
            <CubeIcon className="w-4 h-4 text-blue-600" />
            <span>Hierarchy</span>
          </div>

          <div className="relative space-y-0">
            {/* Vertical line through items */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />

            {levels?.map((lvl, i) => {
              const totalUnits = getTotalUnits(i);
              const name = lvl.name || (i === 0 ? "Unit" : `L${i + 1}`);

              return (
                <div key={i} className="relative pl-4 py-1.5 text-xs">
                  {/* Dot */}
                  <div
                    className={`
                                absolute left-[4px] top-[14px] w-1.5 h-1.5 rounded-full ring-2 ring-white
                                ${lvl.isShippingUnit ? "bg-blue-600 z-10 w-2 h-2 -left-[4.5px]" : "bg-gray-400"}
                            `}
                  />

                  <div className="flex justify-between items-start">
                    <div>
                      <div
                        className={`font-medium ${lvl.isShippingUnit ? "text-blue-700" : "text-gray-700"}`}
                      >
                        {name}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {i === 0 ? "Base" : `x${lvl.containsQty || 1}`} (
                        {totalUnits})
                      </div>
                    </div>
                    {lvl.weight && (
                      <span className="text-[10px] text-gray-400 font-mono bg-white px-1 rounded border border-gray-100">
                        {lvl.weight}kg
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
