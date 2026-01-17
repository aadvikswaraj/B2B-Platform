import { Input } from "@/components/ui/Input";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function TechSpecs({ 
  control, 
  register, 
  categorySpecs, 
  specFields, 
  appendSpec, 
  removeSpec,
  loadingSpecs 
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Category Presets */}
        {loadingSpecs && <p className="text-sm text-gray-500 animate-pulse">Loading industry standards...</p>}
        
        {!loadingSpecs && categorySpecs.length > 0 && (
            <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categorySpecs.map((spec) => {
                        const label = typeof spec === 'string' ? spec : spec.name;
                        const isRequired = typeof spec === 'object' && spec.required;
                        
                        return (
                            <div key={label} className="space-y-1">
                                <label className="block text-xs font-medium text-gray-500 capitalize">
                                    {label} {isRequired && <span className="text-red-500">*</span>}
                                </label>
                                <Input 
                                    {...register(`attributes.${label}`, { required: isRequired })} 
                                    placeholder={typeof spec === 'object' && spec.value ? spec.value : `Enter ${label}`}
                                    className="text-sm"
                                />
                            </div>
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
