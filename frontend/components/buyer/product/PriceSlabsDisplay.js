"use client";

/**
 * PriceSlabsDisplay - Visualizes bulk quantity discounts
 * Minimal Design: Price + Quantity Range
 */
export default function PriceSlabsDisplay({ price }) {
  if (price?.type !== "slab" || !price?.slabs?.length) {
    return null;
  }

  // Sort slabs by quantity
  const slabs = [...price.slabs].sort((a, b) => a.minQuantity - b.minQuantity);

  // Calculate ranges (e.g., 1-9, 10-49, 50+)
  const slabsWithRanges = slabs.map((slab, index) => {
    const nextSlab = slabs[index + 1];
    let rangeLabel = "";
    
    if (nextSlab) {
        if(nextSlab.minQuantity - slab.minQuantity === 1) {
            rangeLabel = `${slab.minQuantity} Unit`;
        } else {
            rangeLabel = `${slab.minQuantity} - ${nextSlab.minQuantity - 1} Units`;
        }
    } else {
      rangeLabel = `≥ ${slab.minQuantity} Units`;
    }
    
    return { ...slab, rangeLabel };
  });

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="w-full">
      <div className="flex flex-row flex-wrap justify-between gap-y-2 gap-x-4">
        {slabsWithRanges.map((slab, idx) => (
          <div
            key={idx}
            className="flex flex-col items-start min-w-[80px]"
          >
            <span className="text-lg font-bold text-gray-900 tracking-tight leading-none">
              {formatPrice(slab.price)}
            </span>
            <span className="text-xs font-medium text-gray-500 mt-1">
              {slab.rangeLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
