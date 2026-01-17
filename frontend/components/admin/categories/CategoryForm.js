"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import slugify from "slugify";
import { useForm, useFieldArray } from "react-hook-form";
import {
  XMarkIcon,
  PlusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { 
  ShieldCheck, 
  AlertTriangle, 
  Fingerprint, 
  Type, 
  Hash, 
  CheckSquare, 
  List,
  Info,
  ChevronRight,
  Home,
  Folder,
  Lock
} from "lucide-react";
import Button from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import FormSection from "@/components/ui/FormSection";
import PageHeader from "@/components/ui/PageHeader";
import ParentPicker from "./ParentPicker";
import CommissionEditor from "./editor/CommissionEditor";
import SpecsPreview from "./editor/SpecsPreview";
import CategoryAPI from "@/utils/api/admin/categories";
import FileInput from "@/components/ui/FileInput";
import { Shimmer } from "@/components/ui/skeletons/SkeletonUtilities";
import { Ban, Store } from "lucide-react";
import {
  buildCategoryPath,
  resolveAcceptOrders,
  resolveSpecifications,
} from "@/utils/category";
import { set } from "nprogress";
import { resolve } from "styled-jsx/css";

const fieldTypes = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
  { value: "multiselect", label: "Multi Select" },
  { value: "boolean", label: "Boolean" },
];

/* CategoryForm
Refactored to use existing UI primitives (Button, Input, Select, Textarea, FormField) and
react-hook-form with dynamic specification builder supporting conditional config fields.
Responsive grid + accessible controls (keyboard reorder + buttons).
*/
export default function CategoryForm({
  mode,
  initial,
  onSubmit,
  submitting = false,
  submitLabel,
}) {
  // Extract image ID from initial data (handles both populated and unpopulated cases)
  const initialImageId = initial?.image?._id || (typeof initial?.image === 'string' ? initial?.image : null);
  
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initial?.name || "",
      description: initial?.description || "",
      image: initialImageId || null,
      parentCategory: initial?.parentCategory?._id || null,
      specifications: initial?.specifications || [],
      commission: initial?.commission || { mode: "inherit" },
      // Convert boolean to string for radio buttons
      acceptOrders: initial?.acceptOrders === true ? "yes" : "no",
    },
  });

  let acceptOrdersWatch = watch("acceptOrders");

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "specifications",
  });

  const [parentInfo, setParentInfo] = useState(null);
  const [parentSpecs, setParentSpecs] = useState([]);
  const [parentAcceptOrders, setParentAcceptOrders] = useState(true);
  
  // Track original image for comparison (used to decide if cleanup is needed)
  const [originalImageId] = useState(initialImageId);

  const [imageUrl, setImageUrl] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const initialCommissionRef = initial?.commission;
  const onFormSubmit = async (data) => {
    const payload = { ...data };
    
    // Convert empty strings to null for ObjectId fields
    if (!payload.image || payload.image === "") payload.image = null;
    
    // Don't send parentCategory in edit mode - it's immutable after creation
    if (mode === "edit") {
      delete payload.parentCategory;
    } else {
      // For create mode, convert empty to null
      if (!payload.parentCategory || payload.parentCategory === "") payload.parentCategory = null;
    }
    
    // Handle image removal
    if (removeImage) {
      payload.image = null;
    }
    
    // Include original image ID so backend can clean it up if changed
    if (mode === "edit" && originalImageId) {
      payload._originalImageId = originalImageId;
    }
    
    await onSubmit?.(payload);
  };

  const parentCategoryId = watch("parentCategory");

  // Initialize parent info for edit mode
  useEffect(() => {
    if (mode === "edit" && initial?.parentCategory) {
      setParentInfo(initial.parentCategory);
      setParentSpecs(resolveSpecifications(initial.parentCategory) || []);
      setParentAcceptOrders(resolveAcceptOrders(initial.parentCategory));
    }
  }, [mode, initial]);

  // Fetch parent info for create mode when parent changes
  useEffect(() => {
    // Skip in edit mode - parent is immutable
    if (mode === "edit") return;
    
    let ignore = false;

    if (!parentCategoryId) {
      setParentInfo(null);
      setParentSpecs([]);
      setParentAcceptOrders(true);
      return;
    }
    
    setCategoryLoading(true);
    CategoryAPI.get(parentCategoryId).then((resp) => {
      if (ignore) return;
      if (resp.success) {
        const data = resp.data;
        setParentInfo(data);
        setParentSpecs(resolveSpecifications(data) || []);
        setParentAcceptOrders(resolveAcceptOrders(data));
      }
      setCategoryLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [parentCategoryId, mode]);

  useEffect(() => {
    !parentAcceptOrders && setValue("acceptOrders", "no");
  }, [parentAcceptOrders]);

  const commissionVal = watch("commission");
  const formSpecs = watch("specifications");

  // Initialize preview URL for edit mode when an image already exists
  useEffect(() => {
    if (initial) {
      if (initial.imageUrl) setImageUrl(initial.imageUrl);
      else if (initial.image?.relativePath)
        setImageUrl(makeAbsolute(initial.image.relativePath));
    }
  }, [initial]);

  // Slug derived from name
  const slug = slugify(watch("name") || "", { lower: true, strict: true });

  const reorder = useCallback(
    (from, to) => {
      if (to < 0 || to >= fields.length) return;
      move(from, to);
    },
    [fields.length, move]
  );

  return (
    <form
      id="category-form"
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-2 sm:space-y-10"
    >
      <PageHeader
        title={mode === "edit" ? "Edit Category" : "Create Category"}
        subtitle="Organize your catalog with structured, spec-rich categories."
        backHref="/admin/categories"
        backLabel="Categories"
        primaryLabel={
          submitLabel || (mode === "edit" ? "Save Changes" : "Create")
        }
        onPrimary={handleSubmit(onFormSubmit)}
      />
      {/* BASICS */}
      <FormSection
        title="Basics"
        description="Core information about the category."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="Name" required error={errors.name?.message}>
            <Input
              placeholder="e.g. Smartphones"
              invalid={!!errors.name}
              {...register("name", { required: "Name is required" })}
            />
          </FormField>
          <FormField label="Slug" hint="Auto-generated from name">
            <Input value={slug} disabled className="bg-gray-50 text-gray-500" />
          </FormField>
          <FormField
            label="Category Image"
            hint="Optional – used in listings and carousels"
            className="md:col-span-2"
          >
            <FileInput
              id="category-image"
              accept="image/*"
              upload
              folder="categories"
              value={watch("image")}
              viewUrl={!watch("image") && imageUrl ? imageUrl : undefined}
              onChange={(fileId) => {
                setValue("image", fileId || "", { shouldValidate: true });
                if (fileId) {
                  setRemoveImage(false);
                  setImageUrl(null);
                }
              }}
              onClear={() => {
                setRemoveImage(true);
                setValue("image", null, { shouldValidate: true });
                setImageUrl(null);
              }}
            />
            <div className="mt-2 flex items-center gap-4">
              {imageUrl && (
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-indigo-700 hover:underline"
                >
                  Preview in new tab
                  <svg
                    className="h-3.5 w-3.5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M5 4a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V9a1 1 0 10-2 0v5H6V6h5a1 1 0 100-2H5z" />
                    <path d="M9 3a1 1 0 000 2h4.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V11a1 1 0 102 0V4a1 1 0 00-1-1H9z" />
                  </svg>
                </a>
              )}
              {(imageUrl || watch("image")) && !removeImage && (
                <button
                  type="button"
                  onClick={() => {
                    setRemoveImage(true);
                    setValue("image", null, { shouldValidate: true });
                    setImageUrl(null);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
                >
                  Remove image
                </button>
              )}
              {removeImage && (
                <span className="inline-flex items-center gap-1 rounded bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 text-[11px] font-medium">
                  Image will be removed
                </span>
              )}
            </div>
          </FormField>
          <FormField label="Description" className="md:col-span-2">
            <Textarea
              placeholder="Short internal description"
              {...register("description")}
            />
          </FormField>
        </div>
      </FormSection>

      {/* PARENT CATEGORY - Read-only in edit mode */}
      <FormSection
        title="Parent Category"
        description={mode === "edit" 
          ? "Parent category cannot be changed after creation to maintain catalog structure."
          : "Select an optional parent category to position this in the tree."
        }
      >
        {mode === "edit" ? (
          <ParentCategoryReadOnly category={initial} />
        ) : (
          <div className="space-y-3">
            <ParentPicker
              value={parentInfo}
              onChange={(v) => {
                setValue("parentCategory", v?._id || "");
                setParentInfo(v);
              }}
            />
          </div>
        )}
      </FormSection>

      {/* SPECIFICATIONS BUILDER */}
      <FormSection
        title="Specifications"
        description="Add structured data fields products should supply when listed under this category."
      >
        <div className="space-y-5">
          {fields.length === 0 && (
            <div className="text-xs text-gray-500 italic">
              No custom specifications yet.
            </div>
          )}
          <ul className="space-y-4">
            {fields.map((field, index) => {
              const type = watch(`specifications.${index}.type`);
              return (
                <li
                  key={field.id}
                  className="group rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 p-4 shadow-sm hover:shadow transition relative"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <div className="flex-1 grid gap-4 sm:grid-cols-2">
                      <FormField
                        label="Name"
                        required
                        error={errors?.specs?.[index]?.name?.message}
                      >
                        <Input
                          placeholder="e.g. Battery Capacity"
                          invalid={!!errors?.specs?.[index]?.name}
                          {...register(`specifications.${index}.name`, {
                            required: "Required",
                          })}
                        />
                      </FormField>
                      <FormField label="Type">
                        <Select {...register(`specifications.${index}.type`)}>
                          {fieldTypes.map((ft) => (
                            <option key={ft.value} value={ft.value}>
                              {ft.label}
                            </option>
                          ))}
                        </Select>
                      </FormField>
                      {type === "text" && (
                        <FormField label="Max Length" hint="Optional">
                          <Input
                            type="number"
                            min={1}
                            {...register(`specifications.${index}.maxLength`)}
                          />
                        </FormField>
                      )}
                      {type === "number" && (
                        <div className="grid grid-cols-2 gap-4">
                          <FormField label="Min" hint="Optional">
                            <Input
                              type="number"
                              {...register(`specifications.${index}.min`)}
                            />
                          </FormField>
                          <FormField label="Max" hint="Optional">
                            <Input
                              type="number"
                              {...register(`specifications.${index}.max`)}
                            />
                          </FormField>
                        </div>
                      )}
                      {(type === "select" || type === "multiselect") && (
                        <FormField label="Options" hint="Comma separated">
                          <Textarea
                            rows={2}
                            placeholder="e.g. Red, Blue, Green"
                            {...register(`specifications.${index}.options`)}
                          />
                        </FormField>
                      )}
                      <FormField label="Required" hint="Mark if mandatory">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          {...register(`specifications.${index}.required`)}
                        />
                      </FormField>
                    </div>
                    <div className="flex md:flex-col gap-2 self-start">
                      <Button
                        type="button"
                        size="sm"
                        variant="subtle"
                        onClick={() => reorder(index, index - 1)}
                        title="Move up"
                      >
                        <ChevronUpIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="subtle"
                        onClick={() => reorder(index, index + 1)}
                        title="Move down"
                      >
                        <ChevronDownIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => remove(index)}
                        title="Remove"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="absolute -left-2 top-4 bottom-4 w-1 bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition" />
                </li>
              );
            })}
          </ul>
          <div className="pt-2">
            <Button
              type="button"
              variant="solid"
              size="sm"
              onClick={() =>
                append({ name: "", type: "text", required: false })
              }
            >
              <PlusIcon className="h-4 w-4" /> Add Specification
            </Button>
          </div>
        </div>
      </FormSection>

      {/* SPEC INHERITANCE PREVIEW */}
      <FormSection
        title="Spec Inheritance"
        description="Preview inherited specs from parent chain and distinguish new ones."
      >
        <InheritedSpecsPreview
          parentSpecs={parentSpecs}
          loading={categoryLoading}
          localSpecs={formSpecs}
        />
      </FormSection>
      <FormSection
        title="Trade Information"
        description="Configure commission or inherit from parent."
      >
        <FormField label="Accept Orders in this category?">
          <div className="flex items-center gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                value="no"
                disabled={!parentAcceptOrders}
                {...register("acceptOrders")}
              />{" "}
              No (Only Inquiries)
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                value="yes"
                disabled={!parentAcceptOrders}
                {...register("acceptOrders")}
              />{" "}
              Yes
            </label>
          </div>
        </FormField>
        {acceptOrdersWatch === "yes" && (
          <CommissionEditor
            parentCategoryObject={parentInfo}
            value={commissionVal}
            onChange={(v) => setValue("commission", v)}
          />
        )}
        {parentAcceptOrders === false ? (
          <div className="flex items-start gap-3 p-3 rounded-lg border border-red-200 bg-red-50">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-red-100 mt-0.5">
              <Ban className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-red-900">Orders Disabled by Parent</h5>
              <p className="text-xs text-red-700 mt-0.5">
                Since the parent category does not accept orders, this category cannot accept orders either.
              </p>
            </div>
          </div>
        ) : acceptOrdersWatch === "no" && (
          <div className="flex items-start gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50">
             <div className="bg-white p-1.5 rounded-md shadow-sm border border-amber-100 mt-0.5">
               <Store className="h-4 w-4 text-amber-600" />
             </div>
             <div>
               <h5 className="text-xs font-semibold text-amber-900 uppercase tracking-wide">Inquiry Only Mode</h5>
               <p className="text-xs text-amber-700 mt-0.5">
                 Orders are not accepted in this category. Sub-categories will also inherit this restriction.
               </p>
             </div>
          </div>
        )}
        {mode === "edit" && (
          <div className="mt-3 text-[11px]">
            {JSON.stringify(commissionVal) !==
            JSON.stringify(initialCommissionRef) ? (
              <span className="inline-flex items-center gap-1 rounded bg-amber-100 text-amber-800 px-2 py-0.5 font-medium">
                Modified
              </span>
            ) : (
              <span className="text-gray-400">Unchanged</span>
            )}
          </div>
        )}
      </FormSection>

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-end pt-2.5 pb-10">
        <Button disabled={submitting} type="submit" variant="solid" size="md">
          {submitting
            ? "Saving..."
            : submitLabel ||
              (mode === "edit" ? "Save Changes" : "Create Category")}
        </Button>
      </div>

      {/* Mobile sticky submit bar */}
      <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-4 py-3 flex items-center justify-end gap-3 shadow-lg">
        <Button size="sm" type="submit" disabled={submitting}>
          {submitting
            ? "Saving..."
            : submitLabel ||
              (mode === "edit" ? "Save Changes" : "Create Category")}
        </Button>
      </div>
    </form>
  );
}

function InheritedSpecsPreview({ parentSpecs, loading, localSpecs = [] }) {
  let effective = parentSpecs;
  if (!effective) effective = [];
  
  const localKeys = new Set(localSpecs.map((s) => s.name));
  const inherited = effective.filter((s) => !localKeys.has(s.name));
  const overridden = effective.filter((s) => localKeys.has(s.name));

  const getTypeIcon = (type) => {
    switch(type) {
      case 'text': return <Type className="h-3.5 w-3.5" />;
      case 'number': return <Hash className="h-3.5 w-3.5" />;
      case 'select': return <List className="h-3.5 w-3.5" />;
      case 'multiselect': return <CheckSquare className="h-3.5 w-3.5" />;
      case 'boolean': return <Fingerprint className="h-3.5 w-3.5" />;
      default: return <Info className="h-3.5 w-3.5" />;
    }
  };

  if (!parentSpecs || parentSpecs.length === 0) {
    if (loading) return <InheritedSpecsSkeleton />;
    
    return (
      <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 text-center">
        <div className="bg-gray-100 p-2 rounded-full mb-2">
           <ShieldCheck className="h-5 w-5 text-gray-400" />
        </div>
        <p className="text-xs font-medium text-gray-500">No inherited specifications</p>
        <p className="text-[10px] text-gray-400 mt-0.5">Specifications from parent categories will appear here.</p>
      </div>
    );
  }

  if (loading) {
    return <InheritedSpecsSkeleton />;
  }

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 overflow-hidden">
      {/* Header Summary */}
      <div className="flex items-center justify-between px-4 py-3 bg-indigo-50/80 border-b border-indigo-100">
        <div className="flex items-center gap-2">
           <ShieldCheck className="h-4 w-4 text-indigo-600" />
           <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Inherited Chain</h4>
        </div>
        <span className="text-[10px] font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
           {effective.length} Total
        </span>
      </div>

      <div className="p-3 space-y-4">
        {inherited.length > 0 && (
          <div className="space-y-2">
            {inherited.map((spec, i) => (
              <div
                key={i}
                className="group flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`
                    flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg
                    ${spec.required ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500'}
                  `}>
                    {getTypeIcon(spec.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-semibold text-gray-800 truncate">{spec.name}</span>
                       {spec.required && (
                         <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-1 rounded uppercase">Req</span>
                       )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5">
                       <span className="capitalize bg-gray-100 px-1.5 rounded">{spec.type}</span>
                       {spec.options && spec.options.length > 0 && (
                         <span className="truncate max-w-[150px] text-gray-400 pl-1 border-l border-gray-200">
                           {spec.options.join(", ")}
                         </span>
                       )}
                       {spec.min !== undefined && <span>Min: {spec.min}</span>}
                       {spec.max !== undefined && <span>Max: {spec.max}</span>}
                    </div>
                  </div>
                </div>
                
                <div className="hidden sm:block text-[10px] text-gray-400 font-medium">
                   Parent Spec
                </div>
              </div>
            ))}
          </div>
        )}

        {overridden.length > 0 && (
          <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
             <div className="flex items-center gap-2 mb-2 text-amber-800">
                <AlertTriangle className="h-3.5 w-3.5" />
                <h5 className="text-xs font-bold uppercase">Overridden ({overridden.length})</h5>
             </div>
             <div className="flex flex-wrap gap-2">
               {overridden.map((s, i) => (
                 <span
                   key={i}
                   className="inline-flex items-center gap-1.5 rounded-md bg-white border border-amber-200 pl-2 pr-2 py-1 text-xs font-medium text-amber-800 shadow-sm"
                 >
                   <span className="line-through opacity-70">{s.name}</span>
                   <span className="text-[10px] text-amber-600 bg-amber-100 px-1 rounded">Replaced</span>
                 </span>
               ))}
             </div>
             <p className="text-[10px] text-amber-600/80 mt-2 italic">
               These parent specifications are replaced by your local definitions above.
             </p>
          </div>
        )}
      </div>
    </div>
  );
}

function InheritedSpecsSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
       <div className="flex items-center justify-between mb-2">
          <Shimmer className="h-4 w-32 rounded" />
          <Shimmer className="h-4 w-8 rounded-full" />
       </div>
       {[1, 2, 3].map(i => (
         <div key={i} className="flex items-center gap-3 p-2 border border-gray-100 rounded-lg">
            <Shimmer className="h-8 w-8 rounded-lg" />
            <div className="flex-1 space-y-1.5">
               <Shimmer className="h-3.5 w-24 rounded" />
               <Shimmer className="h-2.5 w-32 rounded" />
            </div>
         </div>
       ))}
    </div>
  );
}
/**
 * Read-only display of parent category hierarchy for edit mode
 * Parent category cannot be changed after creation to maintain tree integrity
 */
function ParentCategoryReadOnly({ category }) {
  if (!category) return null;
  
  // Build the category path from the initial data
  const path = useMemo(() => {
    if (!category.parentCategory) return [];
    return buildCategoryPath(category.parentCategory);
  }, [category]);
  
  const isRootCategory = !category.parentCategory;
  
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
      {/* Lock indicator */}
      <div className="flex items-center gap-2 mb-3 text-gray-500">
        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-200">
          <Lock className="h-3.5 w-3.5" />
        </div>
        <span className="text-xs font-medium">
          Parent category is locked after creation
        </span>
      </div>
      
      {/* Hierarchy display */}
      <div className="flex items-center flex-wrap gap-1 p-3 bg-white rounded-lg border border-gray-200">
        {isRootCategory ? (
          <div className="flex items-center gap-2 text-gray-600">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-50">
              <Home className="h-4 w-4 text-indigo-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Position</p>
              <p className="text-sm font-semibold text-gray-900">Root Category</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center flex-wrap gap-1">
            {/* Root indicator */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 text-gray-500">
              <Home className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Root</span>
            </div>
            
            {/* Path breadcrumbs */}
            {path.map((cat, index) => (
              <div key={cat._id} className="flex items-center">
                <ChevronRight className="h-4 w-4 text-gray-300 mx-0.5 flex-shrink-0" />
                <div 
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${
                    index === path.length - 1 
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Folder className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="text-xs font-medium truncate max-w-[120px] sm:max-w-none">
                    {cat.name}
                  </span>
                  {index === path.length - 1 && (
                    <span className="text-[9px] font-bold bg-indigo-200 text-indigo-800 px-1 rounded uppercase ml-1">
                      Parent
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Depth info */}
      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="font-medium">Depth:</span>
          <span className="bg-gray-200 px-1.5 py-0.5 rounded font-semibold text-gray-700">
            {category.depth || 0}
          </span>
        </span>
        {path.length > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="font-medium">Ancestors:</span>
            <span className="text-gray-700">{path.length}</span>
          </span>
        )}
      </div>
    </div>
  );
}