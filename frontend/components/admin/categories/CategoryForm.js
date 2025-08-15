"use client";
import { useState, useMemo, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { slugify } from "./useCategoryStore";
import {
  XMarkIcon,
  PlusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

const fieldTypes = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
  { value: "multiselect", label: "Multi Select" },
  { value: "boolean", label: "Boolean" },
];

/* CategoryForm
Props:
  mode: 'create' | 'edit'
  initial? { name, description, parent, specifications }
  parentCategory? (object) if editing/creating under a parent (for read-only parent specs)
  categories: all categories list (for parent selection and uniqueness checks)
  onCancel()
  onSubmit(categoryData) // no id or slug (handled by store)
Sections: Basics, Specifications, Preview, Meta
Mobile responsive with stacking layout.
*/
export default function CategoryForm({
  mode = "create",
  initial,
  parentCategory,
  categories,
  onCancel,
  onSubmit,
}) {
  // react-hook-form for main fields and specs (useFieldArray)
  const { register, control, handleSubmit, watch, setValue, formState } =
    useForm({
      mode: "onBlur",
      defaultValues: {
        name: initial?.name || "",
        description: initial?.description || "",
        parent: initial?.parent || "",
        specifications: initial?.specifications || [],
      },
    });

  const {
    fields: specs,
    append,
    remove,
    move,
  } = useFieldArray({ control, name: "specifications" });
  const [draft, setDraft] = useState({
    name: "",
    type: "text",
    required: false,
    options: "",
    min: "",
    max: "",
    maxLength: "",
  });
  const [touched, setTouched] = useState(false);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const parentVal = watch("parent");
  const nameVal = watch("name");
  const parentObj = useMemo(
    () => categories.find((c) => c.id === parentVal) || parentCategory,
    [parentVal, categories, parentCategory]
  );
  const parentSpecs = parentObj?.specifications || [];

  const slug = useMemo(() => slugify(nameVal || ""), [nameVal]);

  // Reset parent if it's itself (avoid cyc dependency)
  useEffect(() => {
    if (initial?.id && watch("parent") === initial.id) setValue("parent", "");
  }, [initial, setValue, watch]);

  const addSpec = () => {
    if (!draft.name.trim()) return;
    const base = {
      name: draft.name.trim(),
      type: draft.type,
      required: draft.required,
    };
    if (["select", "multiselect"].includes(draft.type))
      base.options = draft.options
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);
    if (draft.type === "number") {
      if (draft.min !== "") base.min = Number(draft.min);
      if (draft.max !== "") base.max = Number(draft.max);
    }
    if (draft.type === "text") {
      if (draft.maxLength !== "") base.maxLength = Number(draft.maxLength);
    }
    append(base);
    setDraft({
      name: "",
      type: "text",
      required: false,
      options: "",
      min: "",
      max: "",
      maxLength: "",
    });
  };
  const removeSpec = (idx) => remove(idx);

  const editSpec = (idx) => {
    const s = specs[idx];
    setDraft({
      name: s.name || "",
      type: s.type || "text",
      required: !!s.required,
      options: (s.options || []).join(", "),
      min: s.min ?? "",
      max: s.max ?? "",
      maxLength: s.maxLength ?? "",
    });
    remove(idx);
  };

  const moveSpec = (from, to) => {
    if (from < 0 || to < 0 || from >= specs.length || to >= specs.length)
      return;
    move(from, to);
  };

  // Drag handlers for reordering
  const onDragStart = (e, idx) => {
    e.dataTransfer.setData("text/plain", String(idx));
  };
  const onDragOver = (e, idx) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };
  const onDrop = (e, idx) => {
    e.preventDefault();
    const from = Number(e.dataTransfer.getData("text/plain"));
    const to = idx;
    if (!Number.isNaN(from)) moveSpec(from, to);
    setDragOverIdx(null);
  };

  const valid = (nameVal || "").trim() && !nameTaken;

  const submit = (data) => {
    setTouched(true);
    if (!valid) return;
    onSubmit({
      name: data.name.trim(),
      description: data.description?.trim() || "",
      parent: data.parent || null,
      specifications: data.specifications || [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* BASICS */}
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <header>
          <h2 className="text-lg font-semibold">Basics</h2>
          <p className="text-xs text-gray-500">
            Core information about the category.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 md:col-span-1">
            <label className="text-xs font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name", {
                required: true,
                validate: (v) =>
                  !categories.some(
                    (c) =>
                      c.name.toLowerCase() === String(v || "").toLowerCase() &&
                      c.id !== initial?.id
                  ),
              })}
              onBlur={() => setTouched(true)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Smartphones"
            />
            {touched && !nameVal.trim() && (
              <p className="text-[11px] text-red-600">Name is required.</p>
            )}
            {nameTaken && (
              <p className="text-[11px] text-red-600">
                Another category with this name exists.
              </p>
            )}
          </div>
          <div className="space-y-1 md:col-span-1">
            <label className="text-xs font-medium text-gray-700">
              Parent Category
            </label>
            <select
              {...register("parent")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Top Level —</option>
              {categories
                .filter((c) => c.id !== initial?.id)
                .filter((c) => !c.parent)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
            {parentVal && parentSpecs.length > 0 && (
              <p className="text-[11px] text-gray-500">
                Inherits {parentSpecs.length} spec
                {parentSpecs.length !== 1 && "s"}.
              </p>
            )}
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Short internal description"
            />
          </div>
          <div className="space-y-1 md:col-span-1">
            <label className="text-xs font-medium text-gray-700">
              Slug (auto)
            </label>
            <input
              value={slug}
              disabled
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
            />
          </div>
        </div>
      </section>

      {/* PARENT SPECS READ ONLY */}
      {parentSpecs.length > 0 && (
        <section className="rounded-lg border border-blue-200 bg-blue-50 p-5 shadow-sm space-y-4">
          <header>
            <h2 className="text-lg font-semibold text-blue-800">
              Inherited Specifications
            </h2>
            <p className="text-xs text-blue-700">
              These come from the parent category and are read-only here.
            </p>
          </header>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {parentSpecs.map((s, i) => (
              <li
                key={i}
                className="rounded border border-blue-200 bg-white px-3 py-2 text-xs flex flex-col gap-0.5"
              >
                <span className="font-medium">{s.name}</span>
                <span className="text-[10px] text-gray-500">
                  {s.type} {s.required && "• required"}
                </span>
                {s.options && (
                  <span className="text-[10px] text-gray-400 truncate">
                    {s.options.join(", ")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* SPECIFICATIONS BUILDER */}
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">Specifications</h2>
            <p className="text-xs text-gray-500">
              Define structured data fields required for products.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex flex-wrap gap-2">
              <input
                value={draft.name}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, name: e.target.value }))
                }
                placeholder="Spec name"
                className="rounded-md border border-gray-300 px-2 py-1 text-xs w-32"
              />
              <select
                value={draft.type}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, type: e.target.value }))
                }
                className="rounded-md border border-gray-300 px-2 py-1 text-xs"
              >
                {fieldTypes.map((ft) => (
                  <option key={ft.value} value={ft.value}>
                    {ft.label}
                  </option>
                ))}
              </select>
              {["select", "multiselect"].includes(draft.type) && (
                <input
                  value={draft.options}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, options: e.target.value }))
                  }
                  placeholder="Comma options"
                  className="rounded-md border border-gray-300 px-2 py-1 text-xs w-40"
                />
              )}
              {draft.type === "number" && (
                <div className="flex items-center gap-2">
                  <input
                    value={draft.min}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, min: e.target.value }))
                    }
                    placeholder="min"
                    type="number"
                    className="rounded-md border border-gray-300 px-2 py-1 text-xs w-20"
                  />
                  <input
                    value={draft.max}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, max: e.target.value }))
                    }
                    placeholder="max"
                    type="number"
                    className="rounded-md border border-gray-300 px-2 py-1 text-xs w-20"
                  />
                </div>
              )}
              {draft.type === "text" && (
                <input
                  value={draft.maxLength}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, maxLength: e.target.value }))
                  }
                  placeholder="max length"
                  type="number"
                  className="rounded-md border border-gray-300 px-2 py-1 text-xs w-28"
                />
              )}
              <label className="inline-flex items-center gap-1 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={draft.required}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, required: e.target.checked }))
                  }
                  className="h-3 w-3"
                />{" "}
                Req
              </label>
              <button
                type="button"
                onClick={addSpec}
                className="inline-flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
              >
                <PlusIcon className="h-3 w-3" />
                Add
              </button>
            </div>
          </div>
        </header>
        {specs.length === 0 && (
          <p className="text-xs italic text-gray-400">
            No custom specifications added.
          </p>
        )}
        {specs.length > 0 && (
          <ul className="flex flex-col divide-y divide-gray-100 rounded border border-gray-200 overflow-hidden">
            {specs.map((s, i) => (
              <li
                key={i}
                draggable
                onDragStart={(e) => onDragStart(e, i)}
                onDragOver={(e) => onDragOver(e, i)}
                onDrop={(e) => onDrop(e, i)}
                className={`flex items-center gap-3 px-3 py-2 text-xs bg-white ${
                  dragOverIdx === i ? "bg-gray-50" : ""
                }`}
              >
                <div className="flex items-center gap-2 mr-2">
                  <button
                    type="button"
                    onClick={() => moveSpec(i, Math.max(0, i - 1))}
                    title="Move up"
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <ChevronUpIcon className="h-4 w-4 text-gray-500" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      moveSpec(i, Math.min(specs.length - 1, i + 1))
                    }
                    title="Move down"
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                  </button>
                  <span className="p-1 rounded bg-gray-50 text-gray-400">
                    <Bars3Icon className="h-4 w-4" />
                  </span>
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex items-baseline justify-between">
                    <span className="font-medium text-gray-800">{s.name}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => editSpec(i)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSpec(i)}
                        className="rounded p-1 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500">
                    {s.type}
                    {s.required ? " • required" : ""}
                  </span>
                  {s.options && (
                    <span className="text-[10px] text-gray-400 truncate">
                      Options: {s.options.join(", ")}
                    </span>
                  )}
                  {s.type === "number" && (
                    <span className="text-[10px] text-gray-400">
                      {typeof s.min !== "undefined" ? `min: ${s.min}` : ""}
                      {typeof s.max !== "undefined"
                        ? ` ${s.max !== undefined ? `• max: ${s.max}` : ""}`
                        : ""}
                    </span>
                  )}
                  {s.type === "text" && s.maxLength && (
                    <span className="text-[10px] text-gray-400">
                      Max length: {s.maxLength}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* PREVIEW */}
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <header>
          <h2 className="text-lg font-semibold">Preview & Meta</h2>
          <p className="text-xs text-gray-500">
            Quick overview of the final structure.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1 space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Summary
            </h3>
            <ul className="text-[11px] text-gray-600 leading-relaxed">
              <li>
                Name:{" "}
                <span className="font-medium text-gray-900">{name || "—"}</span>
              </li>
              <li>
                Slug:{" "}
                <span className="font-medium text-gray-900">{slug || "—"}</span>
              </li>
              <li>
                Parent:{" "}
                <span className="font-medium text-gray-900">
                  {parentObj ? parentObj.name : "Top Level"}
                </span>
              </li>
              <li>Total Specs: {parentSpecs.length + specs.length}</li>
            </ul>
          </div>
          <div className="md:col-span-2 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              All Specifications
            </h3>
            <div className="flex flex-wrap gap-2">
              {parentSpecs.map((s, i) => (
                <span
                  key={"p" + i}
                  className="inline-flex items-center rounded bg-blue-100 text-blue-700 px-2 py-0.5 text-[10px]"
                >
                  {s.name}
                </span>
              ))}
              {specs.map((s, i) => (
                <span
                  key={"c" + i}
                  className="inline-flex items-center rounded bg-gray-100 text-gray-700 px-2 py-0.5 text-[10px]"
                >
                  {s.name}
                </span>
              ))}
              {parentSpecs.length + specs.length === 0 && (
                <span className="text-[10px] italic text-gray-400">None</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!valid}
          className="disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          {mode === "edit" ? "Save Changes" : "Create Category"}
        </button>
      </div>
    </form>
  );
}
