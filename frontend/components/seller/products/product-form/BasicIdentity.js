import { Controller } from "react-hook-form";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import ParentPicker from "@/components/admin/categories/ParentPicker";
import CatalogAPI from "@/utils/api/catalog";
import { useMemo } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export default function BasicIdentity({
  control,
  register,
  errors,
  brands,
  onReloadBrands,
  disableBrand = false
}) {
  const categoryApiClient = useMemo(
    () => ({
      list: async (params) => {
        let filters = {};
        try {
          filters = params.filters ? JSON.parse(params.filters) : {};
        } catch (e) {}
        const catalogParams = {
          parent: filters.parentCategory || "root",
          depth: filters.depth,
          search: params.search,
          page: 1,
          pageSize: 100,
          sort: "name",
        };
        return await CatalogAPI.categories(catalogParams);
      },
    }),
    []
  );

  // Use local register if not passed (though page.js passes it)
  const reg = register || (control && control.register) || (() => {});

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product Name */}
        <FormField label="Product Name" error={errors.productName?.message} required={true}>
          <Input
            {...reg("productName", {
              required: "Product name is required",
              minLength: { value: 3, message: "Name must be at least 3 chars" },
            })}
            placeholder="e.g. Cotton T-Shirt, Industrial Valve"
          />
        </FormField>

        {/* Brand */}
        <FormField
          label="Brand"
          error={errors.brandId?.message}
          required={true}
        >
          {brands.loading ? (
            <div className="h-10 bg-gray-100 rounded-md animate-pulse w-full border border-gray-200" />
          ) : (
            <div className="flex items-center gap-1">
              <Select
                disabled={disableBrand}
                {...reg("brandId", {
                  required: !disableBrand && "Brand is required",
                })}
              >
                <option value="">Select Brand</option>
                {brands.list.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </Select>
              {onReloadBrands && (
                <button
                  type="button"
                  onClick={onReloadBrands}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                  title="Reload Brands"
                >
                  <ArrowPathIcon className="w-4 h-4"/>
                </button>
              )}
            </div>
          )}
        </FormField>
      </div>

      {/* Short Description */}
      <FormField
        label="Description"
        error={errors.shortDesc?.message}
        required={true}
        hint={`Example: \"Premium cotton blend, shrink-resistant, suitable for summer
          wear.\"`}
      >
        <Textarea
          {...reg("shortDesc", { required: "Short description is required" })}
          placeholder="Key selling points, material summary, etc."
          rows={3}
        />
      </FormField>
    </div>
  );
}
