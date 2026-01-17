"use client";
import { useEffect, useMemo, useState } from "react";
import { resolveCommission } from "@/utils/category";
import TieredInput from "@/components/ui/TieredInput";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import clsx from "clsx";

export default function CommissionEditor({ parentCategoryObject, value, onChange }) {
  // Get inherited commission from parent (if any)
  const inheritedCommission = useMemo(() => {
    if (!parentCategoryObject) return null;
    const tempCategory = { 
      parentCategory: parentCategoryObject,
      commission: { mode: "inherit" }
    };
    return resolveCommission(tempCategory);
  }, [parentCategoryObject]);

  // Can only inherit if parent exists AND has commission set
  const canInherit = Boolean(parentCategoryObject && inheritedCommission);
  
  // Determine if inheriting from parent
  const [inheritFromParent, setInheritFromParent] = useState(
    canInherit && (!value || value.mode === "inherit")
  );
  
  // For non-inherit mode, determine single vs slab
  const getInitialMode = () => {
    if (!value || value.mode === "inherit" || value.mode === "exact") return "single";
    return "slab";
  };
  
  const [mode, setMode] = useState(getInitialMode());
  const [exact, setExact] = useState(value?.exact || "");
  
  // Normalize slabs for TieredInput (string values)
  const normalizeSlabs = (arr = []) =>
    arr.map((s) => ({
      upto: s.upto !== undefined ? String(s.upto) : s.max !== undefined ? String(s.max) : "",
      percent: s.percent !== undefined ? String(s.percent) : "",
    }));
  const [slabs, setSlabs] = useState(normalizeSlabs(value?.slabs || []));

  // Build friendly display for inherited commission
  const friendlyInherited = useMemo(() => {
    if (!inheritedCommission) return null;
    if (inheritedCommission.mode === "exact") {
      return { type: "exact", display: `${inheritedCommission.exact}%` };
    }
    if (inheritedCommission.mode === "slab" && Array.isArray(inheritedCommission.slabs)) {
      const sorted = [...inheritedCommission.slabs].sort(
        (a, b) => (a.upto ?? a.max) - (b.upto ?? b.max)
      );
      const rows = [];
      let prev = 0;
      sorted.forEach((s) => {
        const upto = Number(s.upto ?? s.max);
        const pct = Number(s.percent) || 0;
        if (!Number.isFinite(upto)) return;
        rows.push({ label: `₹${prev} – ₹${upto}`, percent: pct });
        prev = upto;
      });
      if (sorted.length > 0) {
        const last = sorted[sorted.length - 1];
        const lastUpto = Number(last.upto ?? last.max);
        rows.push({ label: `≥ ₹${lastUpto}`, percent: Number(last.percent) || 0, overflow: true });
      }
      return { type: "slab", rows };
    }
    return null;
  }, [inheritedCommission]);

  // Push changes to parent
  const pushChange = () => {
    if (canInherit && inheritFromParent) {
      onChange?.({ mode: "inherit" });
      return;
    }
    
    if (mode === "single") {
      onChange?.({
        mode: "exact",
        exact: Number(exact) || 0,
        slabs: undefined,
      });
    } else {
      const numericSlabs = slabs.map(s => ({
        upto: parseFloat(s.upto) || 0,
        percent: parseFloat(s.percent) || 0,
      }));
      const sorted = [...numericSlabs].sort((a, b) => a.upto - b.upto);
      onChange?.({
        mode: "slab",
        exact: undefined,
        slabs: sorted,
      });
    }
  };
  
  useEffect(() => {
    pushChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inheritFromParent, mode, exact, slabs, canInherit]);

  // Columns for TieredInput
  const slabColumns = [
    { 
      key: "upto", 
      label: "Up to (₹)", 
      type: "number", 
      prefix: "₹", 
      placeholder: "0.00",
      required: true,
      min: 0,
    },
    { 
      key: "percent", 
      label: "Commission %", 
      type: "number", 
      suffix: "%", 
      placeholder: "0.00",
      required: true,
      min: 0,
      max: 100,
    },
  ];

  // Preview for slabs
  const renderSlabPreview = (slabData) => {
    const sorted = [...slabData]
      .filter(s => s.upto !== "" && s.percent !== "")
      .sort((a, b) => parseFloat(a.upto) - parseFloat(b.upto));
    
    if (sorted.length === 0) return null;
    
    const rows = [];
    let prev = 0;
    sorted.forEach((s) => {
      const upto = parseFloat(s.upto);
      const pct = parseFloat(s.percent);
      if (isNaN(upto) || isNaN(pct)) return;
      rows.push({ label: `₹${prev} – ₹${upto}`, percent: pct });
      prev = upto;
    });
    if (sorted.length > 0) {
      const last = sorted[sorted.length - 1];
      rows.push({ label: `≥ ₹${parseFloat(last.upto)}`, percent: parseFloat(last.percent), overflow: true });
    }
    
    return (
      <div className="space-y-1">
        {rows.map((row, i) => (
          <div key={i} className={clsx(
            "flex justify-between text-xs py-1 px-2 rounded",
            row.overflow ? "bg-gray-100" : "bg-white"
          )}>
            <span className="text-gray-600">{row.label}</span>
            <span className="font-medium">{row.percent}%</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Inherit Toggle - Always show, disable appropriately */}
      <label className={clsx(
        "flex items-start gap-3 p-3 rounded-lg border transition-colors border-gray-200 bg-gray-50",
        canInherit 
          ? "cursor-pointer hover:bg-gray-100" 
          : "cursor-not-allowed opacity-80"
      )}>
        <input
          type="checkbox"
          checked={canInherit && inheritFromParent}
          onChange={(e) => canInherit && setInheritFromParent(e.target.checked)}
          disabled={!canInherit}
          className="mt-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
        />
        <div className="flex-1">
          <span className={clsx(
            "text-sm font-medium",
            canInherit ? "text-gray-900" : "text-gray-600"
          )}>
            Inherit from parent
          </span>
          <p className="text-xs text-gray-500 mt-0.5">
            {!parentCategoryObject 
              ? "Root categories cannot inherit commission. Set a commission rate below."
              : canInherit 
                ? "Use the same commission structure as the parent category"
                : "Parent category has no commission set. Set a commission on the parent first to enable inheritance."
            }
          </p>
        </div>
      </label>

      {/* Show inherited commission preview when inheriting */}
      {canInherit && inheritFromParent && friendlyInherited && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-blue-800 mb-2">
            Inherited Commission
          </h4>
          {friendlyInherited.type === "exact" ? (
            <p className="text-sm text-blue-900 font-medium">{friendlyInherited.display} (Fixed Rate)</p>
          ) : friendlyInherited.type === "slab" && friendlyInherited.rows ? (
            <div className="space-y-1">
              {friendlyInherited.rows.map((row, i) => (
                <div key={i} className={clsx(
                  "flex justify-between text-xs py-1 px-2 rounded",
                  row.overflow ? "bg-blue-100" : "bg-white/50"
                )}>
                  <span className="text-blue-700">{row.label}</span>
                  <span className="font-medium text-blue-900">{row.percent}%</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {/* Custom commission editor - show when not inheriting or can't inherit */}
      {(!canInherit || !inheritFromParent) && (
        <TieredInput
          title="Commission Rate"
          description={!parentCategoryObject 
            ? "Set the commission rate for this root category" 
            : "Set a custom commission rate for this category"
          }
          mode={mode}
          onModeChange={setMode}
          singleLabel="Fixed %"
          slabLabel="Tiered"
          orderBy="upto"
          showSortButton={true}
          sortButtonLabel="Sort by amount"
          
          renderSingle={
            <div className="max-w-xs">
              <FormField label="Commission Percentage">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={exact}
                    onChange={(e) => setExact(e.target.value)}
                    placeholder="0.00"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </FormField>
            </div>
          }
          
          value={slabs}
          onChange={setSlabs}
          columns={slabColumns}
          defaultSlab={{ upto: "", percent: "" }}
          previewRenderer={renderSlabPreview}
        />
      )}
    </div>
  );
}
