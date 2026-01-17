"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import ReviewPage, { ReviewSection, ReviewField } from '@/components/ui/review/ReviewPage';
import ParentPicker from "@/components/admin/categories/ParentPicker";
import BuyRequirementAPI from "@/utils/api/admin/buyRequirements";

const SUGGESTED_LABELS = ["Bulk", "Urgent", "Premium Quality", "Local Only", "Export", "Sample Required"];

export default function VerificationPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    const [requirement, setRequirement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        BuyRequirementAPI.get(id)
            .then((res) => {
                if (res?.data?.buyRequirement) {
                    setRequirement(res.data.buyRequirement);
                } else {
                    alert("Requirement not found");
                    router.push("/admin/buy-requirements");
                }
            })
            .catch((err) => {
                console.error(err);
                alert("Failed to load requirement");
            })
            .finally(() => setLoading(false));
    }, [id, router]);

    const handleDecision = async (decision, data) => {
        if (decision === 'verified' && !data.category) {
            alert("Please select a category to verify.");
            throw new Error("Category required");
        }
        
        setSubmitting(true);
        try {
            const payload = {
                status: decision,
                ...(decision === 'verified' ? {
                    category: data.category,
                    refineOptions: data.refineOptions || []
                } : {
                    rejectedReason: data.reason
                })
            };
            await BuyRequirementAPI.verifyDecision(id, payload);
            router.push("/admin/buy-requirements");
        } catch (error) {
            console.error(error);
            alert("Failed to update status");
            throw error;
        } finally {
            setSubmitting(false);
        }
    };

    const VerifyOptions = useMemo(() => ({ data, onChange }) => {
        const handleCategoryChange = (catId) => {
            onChange({ ...data, category: catId });
        };
        
        const toggleLabel = (label) => {
            const current = data.refineOptions || [];
            const newLabels = current.includes(label) 
                ? current.filter(l => l !== label) 
                : [...current, label];
            onChange({ ...data, refineOptions: newLabels });
        };
    
        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <ParentPicker 
                        value={data.category} 
                        onChange={handleCategoryChange} 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Labels</label>
                    <div className="flex flex-wrap gap-2">
                        {SUGGESTED_LABELS.map(label => (
                            <button
                                type="button"
                                key={label}
                                onClick={() => toggleLabel(label)}
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                    (data.refineOptions || []).includes(label)
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
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
    if (!requirement) return null;

    return (
        <div className="space-y-6">
            <PageHeader
                backHref="/admin/buy-requirements"
                title={`Verify Requirement: ${requirement.productName}`}
            />

            <ReviewPage 
                status={requirement.verification?.status || 'pending'}
                onDecision={handleDecision}
                isSubmitting={submitting}
                verifyOptions={VerifyOptions}
                title="Requirement Actions"
            >
                <ReviewSection title="Requirement Details" columns={2}>
                    <ReviewField label="Product Name" value={requirement.productName} />
                    <ReviewField label="Quantity" value={`${requirement.quantity} ${requirement.unit}`} />
                    <ReviewField label="Budget" value={requirement.budget ? `₹${requirement.budget}` : 'Negotiable'} />
                    <ReviewField label="Location" value={requirement.location || 'Anywhere'} />
                    <ReviewField label="Description" value={requirement.description} span={2} />
                </ReviewSection>

                <ReviewSection title="Buyer Info">
                    <ReviewField label="Name" value={requirement.user?.name} />
                    <ReviewField label="Email" value={requirement.user?.email} />
                    <ReviewField label="Phone" value={requirement.user?.phone} />
                </ReviewSection>
            </ReviewPage>
        </div>
    );
}
