"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BrandsAPI from "@/utils/api/seller/brands";
import BrandForm from "@/components/seller/brands/BrandForm";
import Button from "@/components/ui/Button";

export default function BrandEditPage() {
	const params = useParams();
	const router = useRouter();
	const id = params?.id;
	const [brand, setBrand] = useState(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	async function load() {
		if (!id) return;
		setLoading(true);
		try {
			const json = await BrandsAPI.get(id);
			if (json?.success) {
				setBrand(json.data);
			} else {
				setBrand(null);
			}
		} catch (error) {
			console.error("Failed to load brand:", error);
			setBrand(null);
		}
		setLoading(false);
	}

	useEffect(() => {
		load();
	}, [id]);

	const handleSubmit = async (data) => {
		setSubmitting(true);
		try {
			const res = await BrandsAPI.update(id, data);
			if (res.success) {
				router.push("/seller/brands");
			} else {
				alert(res.message || "Failed to update brand");
			}
		} catch (error) {
			console.error("Update failed:", error);
			alert("An error occurred while updating");
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) return <div className="p-8">Loading...</div>;
	if (!brand) return <div className="p-8">Brand not found</div>;

	const proofFileId = brand.kyc?.file?._id || brand.kyc?.file;

	const initialData = {
		name: brand.name,
		proofFile: proofFileId,
	};

	return (
		<div className="p-6 max-w-3xl mx-auto">
			<h1 className="text-2xl font-bold mb-6">Edit Brand</h1>
			<div className="bg-white p-6 rounded-lg shadow">
				<BrandForm
					initial={initialData}
					onSubmit={handleSubmit}
					formId="brand-edit-form"
				/>
				<div className="mt-6 flex justify-end gap-3">
					<Button
						variant="secondary"
						onClick={() => router.back()}
						disabled={submitting}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						form="brand-edit-form"
						disabled={submitting}
						loading={submitting}
					>
						Save Changes
					</Button>
				</div>
			</div>
		</div>
	);
}
