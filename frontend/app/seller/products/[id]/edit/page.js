"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import {
  ArrowLeftIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CubeIcon,
  PhotoIcon,
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
import TechSpecs from "@/components/seller/products/product-form/TechSpecs";

import { resolveSpecifications } from "@/utils/category";
import { useAlert } from "@/components/ui/AlertManager";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [brands, setBrands] = useState({ list: [], loading: false });
  const [categorySpecs, setCategorySpecs] = useState([]);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState(null);
  const [productStatus, setProductStatus] = useState("pending");

  const pushAlert = useAlert();

  // Media State (BasicIdentity uses form, others use form, MediaDocs uses controlled state)
  const [images, setImages] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [mediaError, setMediaError] = useState(null);

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
      await loadProduct();
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Removed separate loadBrands function - we set it from product data

  const loadProduct = async () => {
    try {
      const res = await SellerProductsAPI.get(id);
      if (res?.success && res.data) {
        const p = res.data;
        setProductStatus(p.moderation?.status || "pending");

        let dataToLoad = p;

        if (p.pendingUpdates?.updates) {
          setPendingUpdates(p.pendingUpdates);
          dataToLoad = { ...p, ...p.pendingUpdates.updates };
        }

        // Resolve Specifications
        const categorySpecsResolved =
          dataToLoad.category && typeof dataToLoad.category === "object"
            ? resolveSpecifications(dataToLoad.category)
            : [];
        setCategorySpecs(categorySpecsResolved);

        const attributes = {};
        const customSpecs = [];

        (dataToLoad.specifications || []).forEach((spec) => {
          if (spec.type === "existing") {
            const specId =
              typeof spec.existing?.specification === "object"
                ? spec.existing?.specification._id
                : spec.existing?.specification;
            const match = categorySpecsResolved.find((cs) => cs._id === specId);
            if (match) {
              const key = match._id; // Use ID as key
              attributes[key] = spec.existing.value;
            }
          } else if (spec.type === "custom") {
            const key = spec.custom.key;
            // Check if matches category spec (legacy fix)
            // Try matching by name
            const match = categorySpecsResolved.find(
              (cs) => cs.name.toLowerCase() === key.toLowerCase(),
            );
            if (match) {
              const normalizedKey = match._id; // Use ID
              attributes[normalizedKey] = spec.custom.value;
            } else {
              customSpecs.push({
                name: spec.custom.key,
                value: spec.custom.value,
              });
            }
          }
        });

        // Set Brand List for Read-Only Display
        if (dataToLoad.brand && typeof dataToLoad.brand === "object") {
          setBrands({
            list: [{ _id: dataToLoad.brand._id, name: dataToLoad.brand.name }],
            loading: false,
          });
        }

        // Map data to form fields
        reset({
          productName: dataToLoad.title || dataToLoad.name || "",
          brandId:
            typeof dataToLoad.brand === "object"
              ? dataToLoad.brand._id
              : dataToLoad.brand || "",
          shortDesc: dataToLoad.description || "",

          category: dataToLoad.category, // Keep category for display info
          attributes: attributes, // Use resolved attributes
          specs: customSpecs, // Use separated custom specs
        });

        // Map Media
        // images might be objects with _id. MediaDocs expects IDs?
        // Based on analysis, MediaDocs uses FileInput which takes fileId.
        // So we need to map objects to IDs.
        const imgIds = (dataToLoad.images || []).map((img) =>
          typeof img === "object" ? img._id : img,
        );

        setImages(imgIds);
        setVideoFile(
          dataToLoad.video
            ? typeof dataToLoad.video === "object"
              ? dataToLoad.video._id
              : dataToLoad.video
            : null,
        );
        setPdfFile(
          dataToLoad.brochure
            ? typeof dataToLoad.brochure === "object"
              ? dataToLoad.brochure._id
              : dataToLoad.brochure
            : null,
        );
      }
    } catch (e) {
      console.error("Failed to load product", e);
    }
  };

  const fetchCategorySpecs = async (catInput) => {
    // Optimization: If category object is already fully populated (has parentCategory or specifications array), use it
    if (
      catInput &&
      typeof catInput === "object" &&
      (Array.isArray(catInput.specifications) ||
        catInput.parentCategory !== undefined)
    ) {
      const specs = resolveSpecifications(catInput);
      setCategorySpecs(specs);
      return;
    }

    // Fallback: Fetch by ID
    const catId = typeof catInput === "object" ? catInput._id : catInput;

    if (!catId) return;

    setLoadingSpecs(true);
    try {
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

      // Only send fields allowed by updateCore validator
      const payload = {
        title: data.productName,
        description: data.shortDesc,
        catSpecs: data.attributes,
        specs: data.specs,
        images: images,
        video: videoFile,
        pdf: pdfFile,
      };

      const res = await SellerProductsAPI.updateCore(id, payload);
      if (res?.success) {
        pushAlert(
          "success",
          "Product updates submitted for approval successfully!",
        );
        loadProduct(); // Reload to show pending state
      } else {
        pushAlert("error", res?.message || "Failed to save changes");
      }
    } catch (e) {
      console.error(e);
      pushAlert("error", "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (!confirm("Are you sure you want to discard pending changes?")) return;
    try {
      await SellerProductsAPI.discardDraft(id, {
        onSuccess: () => {
          pushAlert("success", "Draft discarded successfully!");
          loadProduct();
          setPendingUpdates(null);
        },
        onError: (e) => {
          console.error(e);
          pushAlert("error", "Error discarding draft");
        },
      });
    } catch (e) {
      console.error(e);
      pushAlert("error", "Error discarding draft");
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

          {/* Pending Updates Status Banner */}
          {pendingUpdates && pendingUpdates.status === "pending" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">
                      Updates Pending Approval
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Your changes are waiting for verification. You can discard
                      them to revert to the live version.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="text-sm text-red-600 hover:text-red-800 font-medium hover:underline bg-white px-3 py-1.5 rounded border border-red-200 shadow-sm"
                >
                  Discard Changes
                </button>
              </div>
            </div>
          )}

          {pendingUpdates && pendingUpdates.status === "rejected" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-red-900">
                      Updates Rejected
                    </h4>
                    <p className="text-sm text-red-700 mt-1 mb-2">
                      Your recent changes were rejected. Please review the
                      reason below and modify your changes or discard them.
                    </p>
                    {pendingUpdates.rejectedReason && (
                      <div className="bg-white p-3 rounded border border-red-100 text-sm text-red-800">
                        <strong>Reason:</strong> {pendingUpdates.rejectedReason}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="flex-shrink-0 text-sm text-red-700 hover:text-red-900 font-medium hover:underline border border-red-300 bg-white px-3 py-1.5 rounded"
                >
                  Discard Changes
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
