"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import {
  ArrowLeftIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CubeIcon,
  PhotoIcon,
  ClipboardDocumentCheckIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import FormSection from "@/components/ui/FormSection";

// API
import SellerProductsAPI from "@/utils/api/seller/products";
import SellerBrandsAPI from "@/utils/api/seller/brands";
import CatalogAPI from "@/utils/api/catalog";

// Product Form Components
import BasicIdentity from "@/components/seller/products/product-form/BasicIdentity";
import MediaDocs from "@/components/seller/products/product-form/MediaDocs";
import DispatchLogistics from "@/components/seller/products/product-form/DispatchLogistics";
import TechSpecs from "@/components/seller/products/product-form/TechSpecs";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [brands, setBrands] = useState({ list: [], loading: false });
  const [categorySpecs, setCategorySpecs] = useState([]);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState(null);

  // Media State (BasicIdentity uses form, others use form, MediaDocs uses controlled state)
  const [images, setImages] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [mediaError, setMediaError] = useState(null);

  // Logistics Modes
  const [parcelMode, setParcelMode] = useState("single");
  const [freightMode, setFreightMode] = useState("single");

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      productName: "",
      brandId: "",
      shortDesc: "",
      productionCapacity: "",
      originCountry: "",
      packagingDetails: "",
      attributes: {},
      specs: [],
    },
  });

  // For Custom Specs
  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
  } = useFieldArray({
    control,
    name: "specs",
  });

  const category = watch("category");

  // Load Data
  useEffect(() => {
    if (id) {
      loadInitialData();
    }
  }, [id]);

  // Load specs when category is loaded/changed
  useEffect(() => {
    // If we have a category ID, we could fetch specs.
    // In this implementation, we assume category is part of loaded product.
    // If we need to fetch specs based on category:
    if (category && typeof category === "object" && category._id) {
      fetchCategorySpecs(category._id);
    } else if (category && typeof category === "string") {
      fetchCategorySpecs(category);
    }
  }, [category]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadProduct(), loadBrands()]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadBrands = async () => {
    setBrands((prev) => ({ ...prev, loading: true }));
    try {
      const res = await SellerBrandsAPI.list({ limit: 100 });
      if (res.success) {
        setBrands({ list: res.data.docs || [], loading: false });
      }
    } catch (e) {
      console.error("Failed to load brands", e);
      setBrands((prev) => ({ ...prev, loading: false }));
    }
  };

  const loadProduct = async () => {
    try {
      const res = await SellerProductsAPI.get(id);
      if (res?.success && res.data) {
        const p = res.data;

        let dataToLoad = p;
        if (p.pendingUpdates) {
          setPendingUpdates(p.pendingUpdates);
          // Prioritize pending updates for display?
          // Usually yes, so user can edit their draft.
          dataToLoad = { ...p, ...p.pendingUpdates };
        }

        const logistics = dataToLoad.logistics || {};
        const production = dataToLoad.production || {};

        // Handle Modes
        const parcelData = logistics.dispatchTimeParcel;
        const freightData = logistics.dispatchTimeFreight;

        setParcelMode(
          typeof parcelData === "object" && parcelData?.mode
            ? parcelData.mode
            : "single"
        );
        setFreightMode(
          typeof freightData === "object" && freightData?.mode
            ? freightData.mode
            : "single"
        );

        // Map data to form fields
        reset({
          productName: dataToLoad.title || dataToLoad.name || "",
          brandId:
            typeof dataToLoad.brand === "object"
              ? dataToLoad.brand._id
              : dataToLoad.brand || "",
          shortDesc: dataToLoad.description || "",

          productionCapacity:
            production.capacity || dataToLoad.productionCapacity || "",
          originCountry:
            logistics.originCountry || dataToLoad.originCountry || "",
          packagingDetails:
            logistics.packagingDetails || dataToLoad.packagingDetails || "",

          dispatchTimeParcel:
            typeof parcelData === "object"
              ? parcelData.days || ""
              : parcelData || "",
          dispatchTimeParcelSlabs:
            typeof parcelData === "object" ? parcelData.slabs || [] : [],

          dispatchTimeFreight:
            typeof freightData === "object"
              ? freightData.days || ""
              : freightData || "",
          dispatchTimeFreightSlabs:
            typeof freightData === "object" ? freightData.slabs || [] : [],

          category: dataToLoad.category, // Keep category for display info
          attributes: dataToLoad.attributes || {},
          specs: dataToLoad.specs || [], // Ensure it is array of {name, value}
        });

        // Map Media
        // images might be objects with _id. MediaDocs expects IDs?
        // Based on analysis, MediaDocs uses FileInput which takes fileId.
        // So we need to map objects to IDs.
        const imgIds = (dataToLoad.images || []).map((img) =>
          typeof img === "object" ? img._id : img
        );
        setImages(imgIds);
        setVideoFile(
          dataToLoad.video
            ? typeof dataToLoad.video === "object"
              ? dataToLoad.video._id
              : dataToLoad.video
            : null
        );
        setPdfFile(
          dataToLoad.brochure
            ? typeof dataToLoad.brochure === "object"
              ? dataToLoad.brochure._id
              : dataToLoad.brochure
            : null
        );
      }
    } catch (e) {
      console.error("Failed to load product", e);
    }
  };

  const fetchCategorySpecs = async (catId) => {
    setLoadingSpecs(true);
    try {
      // Assuming CatalogAPI has a way to get category details or specs
      // If not, we might skip this.
      // For now, let's assume we can get it via getById or similar if attributes are defined there.
      // Or strictly relying on what's saved in product.
      // Ideally: const res = await CatalogAPI.getCategory(catId);
      // setCategorySpecs(res.data.attributes || []);
      setCategorySpecs([]); // Placeholder if no API
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSpecs(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      // Validate Media
      if (images.length === 0) {
        setMediaError("At least one image is required");
        setIsSaving(false);
        // Scroll to top or media section
        return;
      }
      setMediaError(null);

      const payload = {
        title: data.productName,
        description: data.shortDesc,
        brand: data.brandId,
        productionCapacity: data.productionCapacity,
        originCountry: data.originCountry,
        packagingDetails: data.packagingDetails,
        attributes: data.attributes,
        specs: data.specs,
        images: images,
        video: videoFile,
        brochure: pdfFile,
        // Category is usually read-only in edit
      };

      const res = await SellerProductsAPI.updateCore(id, payload);
      if (res?.success) {
        alert("Product updates submitted for approval successfully!");
        loadProduct(); // Reload to show pending state
      } else {
        alert(res?.message || "Failed to save changes");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (!confirm("Are you sure you want to discard pending changes?")) return;
    try {
      await SellerProductsAPI.discardDraft(id);
      loadProduct();
      setPendingUpdates(null);
    } catch (e) {
      alert("Error discarding draft");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          backHref="/seller/products"
          backLabel="Back to Products"
          title="Edit Product Details"
          primaryLabel="Save Changes"
          primaryIcon={CloudArrowUpIcon}
          primaryDisabled={isSaving}
          onPrimary={handleSubmit(onSubmit)}
          secondaryActions={[
            {
              label: "Trade Settings",
              href: `/seller/products/${id}/trade`,
              icon: DocumentTextIcon,
              variant: "outline",
            },
          ]}
        />

        <div className="mt-6">
          {/* Helper Banner */}
          <div className="bg-white border-l-4 border-blue-500 p-4 rounded-r-lg shadow-sm mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  This page allows you to edit <strong>Core Information</strong>
                  . Updates to these fields require admin approval and will
                  verify the product again.
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  For Price, Stock, and MOQ updates (which are instant), use the{" "}
                  <Link
                    href={`/seller/products/${id}/trade`}
                    className="text-blue-600 hover:underline"
                  >
                    Trade Settings
                  </Link>{" "}
                  page.
                </p>
              </div>
            </div>
          </div>

          {pendingUpdates && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></div>
                  <p className="text-sm font-medium text-yellow-800">
                    You have pending updates waiting for approval.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="text-sm text-red-600 hover:text-red-800 hover:underline"
                >
                  Discard Draft
                </button>
              </div>
            </div>
          )}

          {mediaError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 text-sm">
              {mediaError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <FormSection
              title="Basic Identity"
              description="Essential product information"
              icon={CubeIcon}
            >
              {/* Read-only Category Display */}
              <div className="mb-6">
                <FormField label="Category">
                  <Input
                    value={
                      typeof watch("category") === "object"
                        ? watch("category").name
                        : watch("category") || "Unknown"
                    }
                    disabled
                    className="bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Category cannot be changed to prevent data inconsistencies.
                  </p>
                </FormField>
              </div>

              <BasicIdentity
                control={control}
                register={register}
                errors={errors}
                brands={brands}
                onReloadBrands={loadBrands}
                disableBrand={true}
              />
            </FormSection>

            <FormSection
              title="Media & Documents"
              description="Images, videos, and brochures"
              icon={PhotoIcon}
            >
              <MediaDocs
                images={images}
                setImages={setImages}
                videoFile={videoFile}
                setVideoFile={setVideoFile}
                pdfFile={pdfFile}
                setPdfFile={setPdfFile}
                error={mediaError}
              />
            </FormSection>

            <FormSection
              title="Production & Logistics"
              description="Capacity, origin, packaging and dispatch times"
              icon={ClipboardDocumentCheckIcon}
            >
              <DispatchLogistics
                register={register}
                control={control}
                errors={errors}
                parcelMode={parcelMode}
                setParcelMode={setParcelMode}
                freightMode={freightMode}
                setFreightMode={setFreightMode}
              />
            </FormSection>

            <FormSection
              title="Technical Specifications"
              description="Detailed attributes and properties"
              icon={WrenchScrewdriverIcon}
            >
              <TechSpecs
                control={control}
                register={register}
                categorySpecs={categorySpecs}
                specFields={specFields}
                appendSpec={appendSpec}
                removeSpec={removeSpec}
                loadingSpecs={loadingSpecs}
              />
            </FormSection>

            {/* Actions */}
            <div className="flex justify-end pt-2 pb-20">
              <Button type="submit" loading={isSaving} icon={CloudArrowUpIcon}>
                Save Updates
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
