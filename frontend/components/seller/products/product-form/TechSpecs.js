import { Input, Select } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function TechSpecs({
  register,
  categorySpecs,
  specFields,
  appendSpec,
  removeSpec,
  loadingSpecs,
}) {
  // Render the appropriate input based on spec type
  const renderSpecInput = (spec, fieldName, isRequired) => {
    const type = spec?.value?.type || "text";
    const options = ["select", "multiselect"].includes(type)
      ? spec?.value?.options
      : [];
    const maxLength = spec?.value?.maxLength;
    const min = spec?.value?.min;
    const max = spec?.value?.max;

    switch (type) {
      case "select":
        return (
          <Select
            {...register(fieldName, { required: isRequired })}
            className="text-sm"
          >
            <option value="">Select an option</option>
            {(options || []).map((opt, i) => (
              <option
                key={i}
                value={typeof opt === "string" ? opt : opt.value || opt}
              >
                {typeof opt === "string" ? opt : opt.label || opt}
              </option>
            ))}
          </Select>
        );

      case "multiselect":
        return (
          <Select
            {...register(fieldName, { required: isRequired })}
            multiple
            className="text-sm min-h-[80px]"
          >
            {(options || []).map((opt, i) => (
              <option
                key={i}
                value={typeof opt === "string" ? opt : opt.value || opt}
              >
                {typeof opt === "string" ? opt : opt.label || opt}
              </option>
            ))}
          </Select>
        );

      case "boolean":
        return (
          <Select
            {...register(fieldName, { required: isRequired })}
            className="text-sm"
          >
            <option value="">Select</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Select>
        );

      case "number":
        return (
          <Input
            type="number"
            {...register(fieldName, {
              required: isRequired,
              min: min ? min : undefined,
              max: max ? max : undefined,
            })}
            placeholder="Enter value"
            className="text-sm"
          />
        );

      case "text":
      default:
        return (
          <Input
            {...register(fieldName, {
              required: isRequired,
              maxLength: maxLength ? maxLength : undefined,
            })}
            placeholder="Enter value"
            className="text-sm"
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Category Presets */}
        {loadingSpecs && (
          <p className="text-sm text-gray-500 animate-pulse">
            Loading industry standards...
          </p>
        )}

        {!loadingSpecs && categorySpecs.length > 0 && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categorySpecs.map((spec) => {
                const fieldName = `attributes.${spec._id}`;

                return (
                  <FormField
                    key={spec._id || spec.name}
                    label={spec.name}
                    required={spec.required}
                  >
                    {renderSpecInput(spec, fieldName, spec.required)}
                  </FormField>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom Specs */}
        <div className="space-y-3 pt-2">
          {specFields.map((field, index) => (
            <div key={field.id} className="flex space-x-2 items-start">
              <div className="flex-1">
                <Input
                  {...register(`specs.${index}.name`, { required: true })}
                  placeholder="Attribute (e.g. Finish)"
                  className="text-sm"
                />
              </div>
              <div className="flex-1">
                <Input
                  {...register(`specs.${index}.value`, { required: true })}
                  placeholder="Value (e.g. Matte)"
                  className="text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => removeSpec(index)}
                className="text-gray-400 hover:text-red-500 p-2"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}

          <div className="flex justify-start pt-2">
            <button
              type="button"
              onClick={() => appendSpec({ name: "", value: "" })}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium px-1"
            >
              <PlusIcon className="w-4 h-4 mr-1" /> Add Custom Specification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
