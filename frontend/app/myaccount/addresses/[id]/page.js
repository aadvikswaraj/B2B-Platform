"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import AddressesAPI from "@/utils/api/common/addresses";
import AddressForm, {
  FIELD_SPECS_SECTIONS,
} from "@/components/buyer/addresses/AddressForm";
import PageSkeleton from "./skeleton/pageSkeleton";

export default function EditAddressPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);  
  const [error, setError] = useState(null);
  const [form, setForm] = useState(() => {
    const acc = {};
    FIELD_SPECS_SECTIONS.forEach((section) => {
      Object.entries(section.fields).forEach(([name, spec]) => {
        acc[name] = spec.defaultValue || "";
      });
    });
    acc.isDefault = false;
    return acc;
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await AddressesAPI.get(id);
        if (res.success && res.data?.address && mounted) {
          const a = res.data.address;
          // Set form fields using FIELD_SPECS_SECTIONS
          setForm((f) => {
            const updated = { ...f };
            FIELD_SPECS_SECTIONS.forEach((section) => {
              Object.entries(section.fields).forEach(([name, spec]) => {
                updated[name] =
                  a[name] !== undefined && a[name] !== null
                    ? a[name]
                    : spec.defaultValue || "";
              });
            });
            updated.isDefault = !!a.isDefault;
            return updated;
          });
        } else if (!res.success) {
          setError(res.message || "Failed to load address");
        }
      } catch (e) {
        setError(e.message || "Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSubmit = async (values) => {
    setSaving(true);
    setError(null);
    try {
      const res = await AddressesAPI.update(id, values);
      if (res.success) {
        router.push("/myaccount/addresses");
        router.refresh?.();
        return { success: true };
      } else {
        return {
          success: false,
          message: res.message || "Failed to update address",
        };
      }
    } catch (e) {
      return { success: false, message: e.message || "Update failed" };
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-24 space-y-10 mt-5">
      {loading ? (
        <PageSkeleton />
      ) : (
        <>
          <PageHeader
            backHref="/myaccount/addresses"
            backLabel="Addresses"
            title="Edit Address"
            subtitle="Modify the selected saved address."
            primaryLabel={saving ? "Saving..." : "Save Changes"}
            primaryDisabled={saving}
            onPrimary={() =>
              document.getElementById("address-form")?.requestSubmit()
            }
          />
          <AddressForm
            initial={form}
            onSubmit={handleSubmit}
            submitting={saving}
            submitLabel="Save Changes"
            onCancel={() => router.push("/myaccount/addresses")}
          />
        </>
      )}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
    </div>
  );
}
