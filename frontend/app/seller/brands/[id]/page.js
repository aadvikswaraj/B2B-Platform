"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BrandsAPI from "@/utils/api/seller/brands";
import BrandPreview from "@/components/seller/brands/BrandPreview";

export default function BrandPreviewPage() {
  const params = useParams();
  const id = params?.id;

  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!id) return;
    setLoading(true);
    const json = await BrandsAPI.get(id);
    if (json?.success) {
      setBrand(json.data);
    } else {
      setBrand(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="p-4">
        <p className="text-sm text-gray-500">Brand not found.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <BrandPreview brand={brand} />
    </div>
  );
}
