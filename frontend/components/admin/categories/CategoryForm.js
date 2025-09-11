"use client";
import { useCallback, useEffect, useState } from "react";
import slugify from "slugify";
import { useForm, useFieldArray } from "react-hook-form";
import {
  XMarkIcon,
  PlusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import FormSection from "@/components/ui/FormSection";
import PageHeader from "@/components/ui/PageHeader";
import ParentCategorySelector from './editor/ParentCategorySelector';
import CommissionEditor from './editor/CommissionEditor';
import SpecsPreview from './editor/SpecsPreview';
import CategoryAPI from '@/utils/api/categories';

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
export default function CategoryForm({ mode, initial, onSubmit }) {
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
  parentCategory: initial?.parentCategory || initial?.parent || "",
  specifications: initial?.specifications || [],
  commission: initial?.commission || { mode:'inherit' },
    },
  });

  const { fields, append, remove, move } = useFieldArray({ control, name: "specifications" });

  const [submitting, setSubmitting] = useState(false);
  const [parentInfo, setParentInfo] = useState(null);
  const [parentPath, setParentPath] = useState([]);
  const initialCommissionRef = initial?.commission;
  const onFormSubmit = async (data) => {
    if(submitting) return;
    setSubmitting(true);
    try { await onSubmit(data); } finally { setSubmitting(false); }
  };

  // Demo parent categories (UI only)
  useEffect(()=>{
    const id = watch('parentCategory');
    if(!id){ setParentInfo(null); return; }
    let cancelled = false;
    Promise.all([
      CategoryAPI.get(id).catch(()=>null),
      CategoryAPI.path?.(id).catch(()=>[])
    ]).then(([info, path])=>{ if(!cancelled){ setParentInfo(info); setParentPath(path||[]); }});
    return ()=>{ cancelled = true; };
  }, [watch('parentCategory')]);
  const parentCategoryId = watch('parentCategory');
  const commissionVal = watch('commission');
  const formSpecs = watch('specifications');

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
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-10">
      <PageHeader
        title={mode === 'edit' ? 'Edit Category' : 'Create Category'}
        subtitle="Organize your catalog with structured, spec-rich categories."
        backHref="/admin/categories"
        backLabel="Categories"
        primaryLabel={mode === 'edit' ? 'Save Changes' : 'Create'}
        onPrimary={handleSubmit(onFormSubmit)}
      />
      {/* BASICS */}
      <FormSection title="Basics" description="Core information about the category." >
        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="Name" required error={errors.name?.message}>
            <Input
              placeholder="e.g. Smartphones"
              invalid={!!errors.name}
              {...register("name", { required: "Name is required" })}
            />
          </FormField>
          <FormField label="Parent Category" hint="Optional – choose a parent category">
            <ParentCategorySelector value={parentCategoryId} onChange={v=>setValue('parentCategory', v||'')} />
          </FormField>
          <FormField label="Description" className="md:col-span-2">
            <Textarea placeholder="Short internal description" {...register("description")} />
          </FormField>
          <FormField label="Slug" hint="Auto-generated from name">
            <Input value={slug} disabled className="bg-gray-50 text-gray-500" />
          </FormField>
        </div>
      </FormSection>

      {/* SPECIFICATIONS BUILDER */}
  <FormSection title="Specifications" description="Add structured data fields products should supply when listed under this category.">
        <div className="space-y-5">
          {fields.length === 0 && (
            <div className="text-xs text-gray-500 italic">No custom specifications yet.</div>
          )}
          <ul className="space-y-4">
            {fields.map((field, index) => {
              const type = watch(`specifications.${index}.type`);
              return (
                <li key={field.id} className="group rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 p-4 shadow-sm hover:shadow transition relative">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <div className="flex-1 grid gap-4 sm:grid-cols-2">
                      <FormField label="Name" required error={errors?.specs?.[index]?.name?.message}>
                        <Input
                          placeholder="e.g. Battery Capacity"
                          invalid={!!errors?.specs?.[index]?.name}
                          {...register(`specifications.${index}.name`, { required: "Required" })}
                        />
                      </FormField>
                      <FormField label="Type">
                        <Select {...register(`specifications.${index}.type`)}>
                          {fieldTypes.map((ft) => (
                            <option key={ft.value} value={ft.value}>{ft.label}</option>
                          ))}
                        </Select>
                      </FormField>
                      {type === "text" && (
                        <FormField label="Max Length" hint="Optional">
                          <Input type="number" min={1} {...register(`specifications.${index}.maxLength`)} />
                        </FormField>
                      )}
                      {type === "number" && (
                        <div className="grid grid-cols-2 gap-4">
                          <FormField label="Min" hint="Optional">
                            <Input type="number" {...register(`specifications.${index}.min`)} />
                          </FormField>
                          <FormField label="Max" hint="Optional">
                            <Input type="number" {...register(`specifications.${index}.max`)} />
                          </FormField>
                        </div>
                      )}
                      {(type === "select" || type === "multiselect") && (
                        <FormField label="Options" hint="Comma separated">
                          <Textarea rows={2} placeholder="e.g. Red, Blue, Green" {...register(`specifications.${index}.options`)} />
                        </FormField>
                      )}
                      <FormField label="Required" hint="Mark if mandatory">
                        <input type="checkbox" className="h-4 w-4" {...register(`specifications.${index}.required`)} />
                      </FormField>
                    </div>
                    <div className="flex md:flex-col gap-2 self-start">
                      <Button type="button" size="sm" variant="subtle" onClick={() => reorder(index, index - 1)} title="Move up">
                        <ChevronUpIcon className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="sm" variant="subtle" onClick={() => reorder(index, index + 1)} title="Move down">
                        <ChevronDownIcon className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="sm" variant="danger" onClick={() => remove(index)} title="Remove">
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
            <Button type="button" variant="solid" size="sm" onClick={() => append({ name: "", type: "text", required: false })}>
              <PlusIcon className="h-4 w-4" /> Add Specification
            </Button>
          </div>
        </div>
      </FormSection>

  <FormSection title="Commission" description="Configure commission or inherit from parent.">
        <CommissionEditor parentCategory={parentCategoryId} value={commissionVal} onChange={v=> setValue('commission', v)} />
        {mode==='edit' && (
          <div className="mt-3 text-[11px]">
            {JSON.stringify(commissionVal) !== JSON.stringify(initialCommissionRef) ? (
              <span className="inline-flex items-center gap-1 rounded bg-amber-100 text-amber-800 px-2 py-0.5 font-medium">Modified</span>
            ) : (
              <span className="text-gray-400">Unchanged</span>
            )}
          </div>
        )}
      </FormSection>

  {/* SPEC INHERITANCE PREVIEW */}
  <FormSection title="Spec Inheritance" description="Preview inherited specs from parent chain and distinguish new ones.">
        {parentPath.length===0 && (
          <div className="text-[11px] text-gray-500">No parent selected — all specs are local.</div>
        )}
        {parentPath.length>0 && (
          <div className="space-y-4">
            <div className="text-[11px] text-gray-600">Inheritance chain: {parentPath.map(p=>p.name).join(' / ')}</div>
            {(() => {
              // Build inherited spec map (earliest ancestor first, later can override)
              const inherited = {};
              parentPath.forEach(cat => {
                (cat.specifications||[]).forEach(sp => {
                  if(!inherited[sp.name]) inherited[sp.name] = { ...sp, origin: cat.name };
                });
              });
              const localSpecs = (formSpecs||[]).filter(s => !inherited[s.name]);
              const overridden = (formSpecs||[]).filter(s => inherited[s.name]);
              return (
                <div className="grid gap-6 md:grid-cols-3 text-xs">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Inherited ({Object.keys(inherited).length})</h4>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(inherited).map(([k,v]) => (
                        <span key={k} className="inline-flex items-center rounded bg-gray-100 text-gray-700 px-2 py-0.5">
                          {k}
                          <span className="ml-1 text-[9px] text-gray-400">{v.origin}</span>
                        </span>
                      ))}
                      {Object.keys(inherited).length===0 && <span className="italic text-gray-400">None</span>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Local New ({localSpecs.length})</h4>
                    <div className="flex flex-wrap gap-1">
                      {localSpecs.map((s,i)=>(
                        <span key={i} className="inline-flex items-center rounded bg-indigo-50 text-indigo-700 px-2 py-0.5">{s.name||'unnamed'}</span>
                      ))}
                      {localSpecs.length===0 && <span className="italic text-gray-400">None</span>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Overridden ({overridden.length})</h4>
                    <div className="flex flex-wrap gap-1">
                      {overridden.map((s,i)=>(
                        <span key={i} className="inline-flex items-center rounded bg-amber-100 text-amber-800 px-2 py-0.5">{s.name}</span>
                      ))}
                      {overridden.length===0 && <span className="italic text-gray-400">None</span>}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </FormSection>

  <FormSection title="Preview" description="Review before saving.">
        <div className="grid gap-6 md:grid-cols-3 text-sm">
          <div className="space-y-3 md:col-span-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Summary</h3>
            <ul className="space-y-1 text-gray-700 dark:text-gray-300 text-xs">
              <li><span className="font-medium">Name:</span> {watch("name") || "—"}</li>
              <li><span className="font-medium">Slug:</span> {slug || "—"}</li>
              <li><span className="font-medium">Parent:</span> {parentInfo ? parentInfo.name : 'Top Level'}</li>
              {parentPath.length>0 && (
                <li className="flex flex-wrap gap-1"><span className="font-medium">Path:</span>
                  <span className="text-[10px] text-gray-600">{parentPath.map(p=>p.name).join(' / ')}</span>
                </li>
              )}
              <li><span className="font-medium">Total Specs:</span> {fields.length}</li>
            </ul>
          </div>
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Specifications</h3>
            <div className="flex flex-wrap gap-2">
              {fields.map((f, i) => (
                <span key={f.id} className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 px-2.5 py-0.5 text-[10px] font-medium">
                  {watch(`specifications.${i}.name`) || "(unnamed)"}
                </span>
              ))}
              {fields.length === 0 && <span className="text-[11px] italic text-gray-400">None</span>}
            </div>
          </div>
        </div>
  </FormSection>

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-end pb-10">
  <Button disabled={submitting} type="submit" variant="solid" size="md">{submitting ? 'Saving...' : (mode === "edit" ? "Save Changes" : "Create Category")}</Button>
      </div>
    </form>
  );
}
