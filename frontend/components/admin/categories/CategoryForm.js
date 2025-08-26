"use client";
import { useCallback } from "react";
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
export default function CategoryForm({ mode, initial, onCancel, onSubmit }) {
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
      parent: initial?.parent || "",
      specs: initial?.specifications || [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "specs",
  });

  const onFormSubmit = (data) => {
    onSubmit(data);
  };

  // Demo parent categories (UI only)
  const parentCategories = [
    { id: "1", name: "Electronics" },
    { id: "2", name: "Apparel" },
    { id: "3", name: "Home" },
  ];

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
            <Select {...register("parent")}> 
              <option value="">— Top Level —</option>
              {parentCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
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
              const type = watch(`specs.${index}.type`);
              return (
                <li key={field.id} className="group rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 p-4 shadow-sm hover:shadow transition relative">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <div className="flex-1 grid gap-4 sm:grid-cols-2">
                      <FormField label="Name" required error={errors?.specs?.[index]?.name?.message}>
                        <Input
                          placeholder="e.g. Battery Capacity"
                          invalid={!!errors?.specs?.[index]?.name}
                          {...register(`specs.${index}.name`, { required: "Required" })}
                        />
                      </FormField>
                      <FormField label="Type">
                        <Select {...register(`specs.${index}.type`)}>
                          {fieldTypes.map((ft) => (
                            <option key={ft.value} value={ft.value}>{ft.label}</option>
                          ))}
                        </Select>
                      </FormField>
                      {type === "text" && (
                        <FormField label="Max Length" hint="Optional">
                          <Input type="number" min={1} {...register(`specs.${index}.maxLength`)} />
                        </FormField>
                      )}
                      {type === "number" && (
                        <div className="grid grid-cols-2 gap-4">
                          <FormField label="Min" hint="Optional">
                            <Input type="number" {...register(`specs.${index}.min`)} />
                          </FormField>
                          <FormField label="Max" hint="Optional">
                            <Input type="number" {...register(`specs.${index}.max`)} />
                          </FormField>
                        </div>
                      )}
                      {(type === "select" || type === "multiselect") && (
                        <FormField label="Options" hint="Comma separated">
                          <Textarea rows={2} placeholder="e.g. Red, Blue, Green" {...register(`specs.${index}.options`)} />
                        </FormField>
                      )}
                      <FormField label="Required" hint="Mark if mandatory">
                        <input type="checkbox" className="h-4 w-4" {...register(`specs.${index}.required`)} />
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

  <FormSection title="Preview" description="Review before saving.">
        <div className="grid gap-6 md:grid-cols-3 text-sm">
          <div className="space-y-3 md:col-span-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Summary</h3>
            <ul className="space-y-1 text-gray-700 dark:text-gray-300 text-xs">
              <li><span className="font-medium">Name:</span> {watch("name") || "—"}</li>
              <li><span className="font-medium">Slug:</span> {slug || "—"}</li>
              <li><span className="font-medium">Parent:</span> {parentCategories.find(p=>p.id===watch("parent"))?.name || "Top Level"}</li>
              <li><span className="font-medium">Total Specs:</span> {fields.length}</li>
            </ul>
          </div>
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Specifications</h3>
            <div className="flex flex-wrap gap-2">
              {fields.map((f, i) => (
                <span key={f.id} className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 px-2.5 py-0.5 text-[10px] font-medium">
                  {watch(`specs.${i}.name`) || "(unnamed)"}
                </span>
              ))}
              {fields.length === 0 && <span className="text-[11px] italic text-gray-400">None</span>}
            </div>
          </div>
        </div>
  </FormSection>

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end pb-10">
        <Button type="button" variant="outline" onClick={onCancel} size="md">Cancel</Button>
        <Button type="submit" variant="solid" size="md">{mode === "edit" ? "Save Changes" : "Create Category"}</Button>
      </div>
    </form>
  );
}
