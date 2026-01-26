import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import FormSection from "@/components/ui/FormSection";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import AddressCard from "@/components/common/address/AddressCard";
import AddressModal from "@/components/common/address/AddressModal";
import { getAddresses, addAddress } from "@/utils/api/user/addresses";

export default function PickupAddressFormRHF({
  defaultValues = {},
  loading,
  onBack,
  onSubmit,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
    resetField,
  } = useForm({
    defaultValues: {
      addresses: defaultValues.addresses || [],
      pickupAddressId: defaultValues.pickupAddressId || "",
      newAddress: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        pincode: "",
        contactName: "",
        contactPhone: "",
      },
    },
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const addresses = watch("addresses");
  const pickupAddressId = watch("pickupAddressId");

  const isAddingNew = pickupAddressId === "new";

  // Load saved addresses from backend on first mount if not present
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setAddressesLoading(true);
        const list = await getAddresses();
        if (!mounted) return;
        const normalized = (list || []).map((a) => ({
          ...a,
          id: a.id || a._id,
        }));
        setValue("addresses", normalized, { shouldDirty: false });
        // Preselect default if exists
        const def = normalized.find((a) => a.isDefault);
        if (def) setValue("pickupAddressId", def.id, { shouldValidate: true });
      } catch (e) {
        // Non-blocking: keep local addresses
      } finally {
        if (mounted) setAddressesLoading(false);
      }
    }
    if (!addresses || addresses.length === 0) load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addAddressNow = async () => {
    const ok = await trigger([
      "newAddress.line1",
      "newAddress.city",
      "newAddress.state",
      "newAddress.pincode",
      "newAddress.contactName",
      "newAddress.contactPhone",
    ]);
    if (!ok) return;
    const id = `addr_${Date.now()}`;
    const addr = { id, ...watch("newAddress") };
    setValue("addresses", [...(addresses || []), addr], { shouldDirty: true });
    setValue("pickupAddressId", id, { shouldValidate: true });
    // Clear form for adding another if needed
    resetField("newAddress.line1");
    resetField("newAddress.line2");
    resetField("newAddress.city");
    resetField("newAddress.state");
    resetField("newAddress.pincode");
    resetField("newAddress.contactName");
    resetField("newAddress.contactPhone");
  };

  const submit = (data) => {
    let final = { ...defaultValues };
    if (isAddingNew) {
      const id = `addr_${Date.now()}`;
      const addr = { id, ...data.newAddress };
      final.addresses = [...(addresses || []), addr];
      final.pickupAddressId = id;
    } else {
      final.pickupAddressId = data.pickupAddressId;
      final.addresses = addresses || [];
    }
    onSubmit?.(final);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(submit)}>
      <FormSection
        dense
        title="Pickup Address"
        description="Choose a saved address or add a new one."
      >
        {/* Actions */}
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Select one address to schedule pickups.
          </p>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setModalOpen(true)}
            disabled={loading}
          >
            + Add Address
          </Button>
        </div>

        {/* Address cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(addresses || []).map((a) => {
            const id = a.id || a._id;
            const selected = pickupAddressId === id;
            return (
              <AddressCard
                key={id}
                address={{ ...a, id }}
                selected={selected}
                onSelect={(id) =>
                  setValue("pickupAddressId", id, { shouldValidate: true })
                }
              />
            );
          })}

          {/* Add new address card */}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className={`flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition hover:border-blue-400 hover:bg-blue-50/40 ${
              isAddingNew
                ? "border-blue-600 bg-blue-50/40"
                : "border-gray-300 bg-white"
            }`}
          >
            <span className="mb-1 text-xl text-blue-600">＋</span>
            <span className="text-sm font-medium text-blue-700">
              Add Address
            </span>
            <span className="mt-1 text-xs text-gray-500">
              Create a new pickup location
            </span>
          </button>
        </div>

        {/* Validation message for selection */}
        {errors.pickupAddressId?.message && (
          <p className="mt-2 text-xs text-red-600">
            {errors.pickupAddressId.message}
          </p>
        )}

        {/* Hidden field to keep RHF validation for selection */}
        <input
          type="hidden"
          {...register("pickupAddressId", {
            required: "Please choose or add an address",
          })}
        />

        {/* Add new address form */}
        {/* Add Address modal via portal */}
        <AddressModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          loading={loading || addressSaving}
          onSave={async (data) => {
            console.log("Saving address:", data);
            try {
              setAddressSaving(true);
              // Persist address via API
              const saved = await addAddress({
                addressLine1: data.addressLine1,
                addressLine2: data.addressLine2,
                city: data.city,
                state: data.state,
                pincode: data.pincode,
                name: data.name,
                phone: data.phone,
              });
              const id = saved.id || saved._id;
              const addr = { ...saved, id };
              setValue("addresses", [...(addresses || []), addr], {
                shouldDirty: true,
              });
              setValue("pickupAddressId", id, { shouldValidate: true });
              setModalOpen(false);
            } catch (e) {
              // optional: surface error to UI later
            } finally {
              setAddressSaving(false);
            }
          }}
        />
      </FormSection>
      <div className="flex gap-2 mt-2">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onBack}
          disabled={loading || addressesLoading || addressSaving}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="solid"
          size="md"
          loading={loading || addressesLoading || addressSaving}
        >
          Finish
        </Button>
      </div>
    </form>
  );
}
