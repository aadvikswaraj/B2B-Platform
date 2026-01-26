"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import CategoryAPI from "@/utils/api/admin/categories";
import CategoryForm from "@/components/admin/categories/CategoryForm";
import { useAlert } from "@/components/ui/AlertManager";

import PageHeaderSkeleton from "@/components/ui/skeletons/PageHeaderSkeleton";
import FormSectionSkeleton from "@/components/ui/skeletons/FormSectionSkeleton";

function EditCategoryPageSkeleton() {
  return (
    <>
      <PageHeaderSkeleton showBack withActions lines={1} />
      <div className="space-y-8">
        {/* Basics (Name, Description, Image, Slug) */}
        <FormSectionSkeleton type="form" fields={4} />

        {/* Hierarchy (Parent picker area) */}
        <FormSectionSkeleton type="form" fields={1} />

        {/* Specifications builder (list/grid feel) */}
        <FormSectionSkeleton type="matrix" />

        {/* Commission (mode + inputs) */}
        <FormSectionSkeleton type="form" fields={2} />

        {/* Spec Inheritance Preview */}
        <FormSectionSkeleton type="matrix" />

        {/* Final Preview */}
        <FormSectionSkeleton type="matrix" />
      </div>
    </>
  );
}

export default function EditCategoryPage() {
  const { id } = useParams();
  const pushAlert = useAlert();
  const router = useRouter();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    CategoryAPI.get(id).then((resp) => {
      if (ignore) return;
      if (resp.success) {
        if (resp.data) {
          console.log(resp.data);
          console.log(resp.data?.specifications);
          for (let i = 0; i < resp.data?.specifications.length; i++) {
            resp.data.specifications[i] = {
              ...resp.data.specifications[i],
              ...resp.data.specifications[i].value,
            };
            delete resp.data.specifications[i].value;
            delete resp.data.specifications[i].createdAt;
            delete resp.data.specifications[i].updatedAt;
            delete resp.data.specifications[i].__v;
          }
          setCategory(resp.data);
          setLoading(false);
        } else {
          pushAlert("error", "Category not found.");
          router.push("/admin/categories");
        }
      } else {
        pushAlert("error", "Failed to load category.");
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {loading ? (
        <EditCategoryPageSkeleton />
      ) : (
        <CategoryForm
          mode="edit"
          initial={category}
          onCancel={() => router.push("/admin/categories")}
          onSubmit={async (data) => {
            try {
              // specifications is already an array from the form

              if (data.acceptOrders === "yes") {
                data.acceptOrders = true;
                // commission is already an object from the form
              } else {
                data.acceptOrders = false;
                data.commission = null;
              }
              for (const spec of data.specifications) {
                if (spec.type === "select" || spec.type === "multiselect") {
                  spec.options = spec.options.map((option) => option.trim());
                  delete spec.maxLength;
                  delete spec.range;
                } else if (spec.type === "range" || spec.type === "number") {
                  spec.range = {
                    min: Number(spec.range.min),
                    max: Number(spec.range.max),
                  };
                  delete spec.options;
                  delete spec.maxLength;
                } else if (spec.type === "text") {
                  delete spec.options;
                  delete spec.range;
                  spec.maxLength = Number(spec.maxLength);
                } else if (spec.type === "boolean") {
                  delete spec.options;
                  delete spec.range;
                  delete spec.maxLength;
                }
              }
              const resp = await CategoryAPI.update(category._id, data);
              if (resp.success) {
                pushAlert("success", "Category updated successfully!");
                router.push("/admin/categories");
              } else {
                pushAlert(
                  "error",
                  resp.message || "Failed to update category.",
                );
              }
            } catch (e) {
              pushAlert("error", e.message || "Failed to update category.");
            }
          }}
        />
      )}
    </div>
  );
}
