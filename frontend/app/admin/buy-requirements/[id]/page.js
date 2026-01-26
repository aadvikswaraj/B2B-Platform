"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import VerificationPage from "@/components/admin/verification/VerificationPage";
import ParentPicker from "@/components/admin/categories/ParentPicker";
import BuyRequirementAPI from "@/utils/api/admin/buyRequirements";
import {
  ShoppingBagIcon,
  UserCircleIcon,
  CurrencyRupeeIcon,
  MapPinIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import { useAlert } from "@/components/ui/AlertManager";

const SUGGESTED_LABELS = {
  bulk:"Bulk",
  urgent:"Urgent",
  local:"Local Only",
  export:"Export",
  sample_required:"Sample Required",
};

export default function BuyRequirementVerificationPage() {
  const router = useRouter();
  const params = useParams();
  const pushAlert = useAlert();
  const id = params?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    BuyRequirementAPI.get(id)
      .then((res) => {
        if (res?.data?.buyRequirement) {
          setData(res.data.buyRequirement);
        } else {
          router.push("/admin/buy-requirements");
        }
      })
      .catch((err) => {
        console.error(err);
        pushAlert("error", "Failed to load buy requirement data.");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleDecision = async (decision, decisionData) => {
    if (decision === "verified" && !decisionData.category) {
      pushAlert("error", "Please select a category to verify.");
      throw new Error("Category required");
    }

    setSubmitting(true);
    try {
      const payload = {
        status: decision,
        ...(decision === "verified"
          ? {
              category: decisionData.category._id,
              tags: decisionData.refineOptions || [], // Map refineOptions to tags
            }
          : {
              rejectedReason: decisionData.reason,
            }),
      };
      const resp = await BuyRequirementAPI.verifyDecision(id, payload);
      if (!resp.success) {
        throw new Error(resp.message || "Verification decision failed.");
      }
      else{
        pushAlert("success", "Verification decision submitted successfully.");
        router.push("/admin/buy-requirements");
      }
    } catch (error) {
      pushAlert("error", error || "Failed to submit verification decision.");
    } finally {
      setSubmitting(false);
    }
  };

  const VerifyOptions = useMemo(
    () =>
      ({ data, onChange }) => {
        const handleCategoryChange = (catId) => {
          onChange({ ...data, category: catId });
        };

        const toggleLabel = (label) => {
          const current = data.refineOptions || [];
          const newLabels = current.includes(label)
            ? current.filter((l) => l !== label)
            : [...current, label];
          onChange({ ...data, refineOptions: newLabels });
        };

        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <ParentPicker
                value={data.category}
                onChange={handleCategoryChange}
                leafSelectionOnly={true}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Labels
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(SUGGESTED_LABELS).map(([key, label]) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => toggleLabel(key)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      (data.refineOptions || []).includes(key)
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      },
    [],
  );

  const sections = [
    {
      title: "Requirement Details",
      icon: ShoppingBagIcon,
      columns: 2,
      fields: [
        { label: "Product Name", value: data?.productName },
        { label: "Quantity", value: `${data?.quantity} ${data?.unit}` },
        {
          label: "Budget",
          value: data?.budget
            ? `₹${data.budget.min} - ₹${data.budget.max}`
            : "Negotiable",
          icon: CurrencyRupeeIcon,
        },
        {
          label: "City",
          value: data?.city || "Anywhere",
          icon: MapPinIcon,
        },
        { label: "Description", value: data?.description, span: 2 },
      ],
    },
    {
      title: "Buyer Info",
      icon: UserCircleIcon,
      fields: [
        { label: "Name", value: data?.user?.name },
        { label: "Email", value: data?.user?.email },
        { label: "Phone", value: data?.user?.phone },
      ],
    },
  ];

  return (
    <>
      <VerificationPage
        loading={loading}
        title={data?.productName || "Loading..."}
        status={data?.verification?.status || "pending"}
        onDecision={handleDecision}
        isSubmitting={submitting}
        backHref="/admin/buy-requirements"
        verifyOptions={VerifyOptions}
        meta={[
          {
            label: "Created",
            value: new Date(data?.createdAt || Date.now()).toLocaleDateString(),
            icon: ListBulletIcon,
          },
          {
            label: "Buyer",
            value: data?.user?.name,
            icon: UserCircleIcon,
          },
        ]}
        sections={sections}
        skeletonConfig={{ sections: 2, fieldsPerSection: 4 }}
      />
    </>
  );
}
