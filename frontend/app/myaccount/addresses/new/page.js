"use client";

import { useState } from "react";
import AddressesAPI from "@/utils/api/common/addresses";
import PageHeader from "@/components/ui/PageHeader";
import AddressForm, {
  FIELD_SPECS_SECTIONS,
} from "@/components/buyer/addresses/AddressForm";
import { useRouter } from "next/navigation";
import { useAlert } from "@/components/ui/AlertManager";

export default function NewAddressPage() {
  const router = useRouter();
  const pushAlert = useAlert();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      const res = await AddressesAPI.add(values);
      if (res.success) {
        pushAlert("success", "Address added successfully!");
        router.push("/myaccount/addresses");
      } else {
        pushAlert("error", "Failed to add address!");
      }
    } catch (e) {
      pushAlert("error", "Internal server error!");
    } finally {
      setSaving(false);
    };
  };

  return (
    <div className="max-w-3xl mx-auto pb-24 space-y-10 mt-5">
      <PageHeader
        backHref="/myaccount/addresses"
        backLabel="Addresses"
        title="Add Address"
        subtitle="Create a new saved address for faster checkout."
        primaryLabel={saving ? "Saving..." : "Save Address"}
        primaryDisabled={saving}
        onPrimary={() =>
          document.getElementById("address-form")?.requestSubmit()
        }
        hideStickyBar
      />

      <AddressForm
        submitting={saving}
        submitLabel="Save Address"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
