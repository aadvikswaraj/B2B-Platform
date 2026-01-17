"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { useAlert } from "@/components/ui/AlertManager";
import SellerProductsAPI from "@/utils/api/seller/products";
import PageHeader from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import FormSection from "@/components/ui/FormSection";
import {
  CurrencyRupeeIcon,
  TruckIcon,
  BanknotesIcon,
  ArchiveBoxIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

import TradePricing from "@/components/seller/products/product-form/TradePricing";
import Packaging from "@/components/seller/products/product-form/Packaging";
import DispatchLogistics from "@/components/seller/products/product-form/DispatchLogistics";
import CostSupport from "@/components/seller/products/product-form/CostSupport";

export default function EditTradeInfoPage() {
  const { id } = useParams();
  const router = useRouter();
  const showAlert = useAlert();
  const [loading, setLoading] = useState(true);
  const [priceType, setPriceType] = useState("single");
  const [parcelMode, setParcelMode] = useState("single");
  const [freightMode, setFreightMode] = useState("single");

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      priceType: "single",
      singlePrice: "",
      priceSlabs: [],
      taxPercent: "",
      moq: 1,
      stock: 0,
      packagingLevels: [
        { levelType: "Item", containsQty: 1, isShippingUnit: false },
        { levelType: "Box", containsQty: 12, isShippingUnit: true },
      ],
      dispatchTimeParcel: 24,
      dispatchTimeParcelSlabs: [],
      dispatchTimeFreight: 48,
      dispatchTimeFreightSlabs: [],
      packagingDetails: "",
      originCountry: "India",
      productionCapacity: "",
      // Support fields matching CostSupport component
      freightSupportFlat: "",
      freightSupportSlabs: [],
      paymentSupportFlat: "",
      paymentSupportSlabs: [],
    },
  });

  // Fetch Product Data
  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data } = await SellerProductsAPI.get(id);

        // Flatten logistics - use new nested structure
        const logistics = data.logistics || {};
        const dispatchTime = logistics.dispatchTime || {};
        const pData = dispatchTime.parcel;
        const fData = dispatchTime.freight;

        setParcelMode(pData?.type || "single");
        setFreightMode(fData?.type || "single");

        // Flatten Support - use new nested structure
        const support = data.support || {};
        const freightSupport = support.freight || {};
        const paymentSupport = support.paymentFee || {};

        // Flatten Price
        const price = data.price || { type: "single" };
        setPriceType(price.type);

        reset({
          priceType: price.type,
          price: price.singlePrice || "", // for TradePricing component
          singlePrice: price.singlePrice || "",
          priceSlabs: price.slabs || [],
          taxPercent:
            data.taxPercent !== undefined ? String(data.taxPercent) : "", // convert to string for select
          moq: price.moq || 1,
          stock: data.stock || 0,

          packagingLevels: data.packagingLevels || [
            { levelType: "Item", containsQty: 1, isShippingUnit: false },
            { levelType: "Box", containsQty: 12, isShippingUnit: true },
          ],

          dispatchTimeParcel: pData?.days || 24,
          dispatchTimeParcelSlabs: pData?.slabs || [],

          dispatchTimeFreight: fData?.days || 48,
          dispatchTimeFreightSlabs: fData?.slabs || [],

          packagingDetails: logistics.packagingDetails || "",
          originCountry: logistics.originCountry || "India",
          productionCapacity: data.production?.capacity || "",

          // Support - transform backend field names to CostSupport component format
          freightSupportFlat: freightSupport.amount || "",
          freightSupportSlabs: (freightSupport.slabs || []).map((s) => ({
            minOrderVal: s.minQty || "",
            supportAmount: s.amount || "",
          })),
          paymentSupportFlat: paymentSupport.percent || "",
          paymentSupportSlabs: (paymentSupport.slabs || []).map((s) => ({
            minOrderVal: s.minQty || "",
            supportPercent: s.percent || "",
          })),
        });
      } catch (error) {
        console.error("Failed to load product:", error);
        showAlert("error", "Failed to load product details");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id, reset, showAlert]);

  const onSubmit = async (formData) => {
    try {
      // Build the payload with correct structure for backend
      const payload = {
        priceType,
        singlePrice: formData.price || formData.singlePrice,
        priceSlabs: formData.priceSlabs,
        taxPercent: formData.taxPercent
          ? Number(formData.taxPercent)
          : undefined,
        moq: formData.moq,
        stock: formData.stock,
        packagingLevels: formData.packagingLevels,

        // Logistics with correct nested structure
        logistics: {
          dispatchTime: {
            parcel: {
              type: parcelMode,
              days: Number(formData.dispatchTimeParcel) || 0,
              slabs: (formData.dispatchTimeParcelSlabs || []).map((s) => ({
                maxQty: Number(s.maxQty) || 0,
                days: Number(s.days) || 0,
              })),
            },
            freight: {
              type: freightMode,
              days: Number(formData.dispatchTimeFreight) || 0,
              slabs: (formData.dispatchTimeFreightSlabs || []).map((s) => ({
                maxQty: Number(s.maxQty) || 0,
                days: Number(s.days) || 0,
              })),
            },
          },
          originCountry: formData.originCountry,
          packagingDetails: formData.packagingDetails,
        },

        // Production capacity
        production: {
          capacity: formData.productionCapacity || "",
        },

        // Support with correct nested structure
        // Transform from CostSupport field names to backend field names
        support: {
          freight: {
            type: formData.freightSupportSlabs?.length > 0 ? "slab" : "single",
            amount: Number(formData.freightSupportFlat) || 0,
            slabs: (formData.freightSupportSlabs || []).map((s) => ({
              minQty: Number(s.minOrderVal) || 0,
              amount: Number(s.supportAmount) || 0,
            })),
          },
          paymentFee: {
            type: formData.paymentSupportSlabs?.length > 0 ? "slab" : "single",
            percent: Number(formData.paymentSupportFlat) || 0,
            slabs: (formData.paymentSupportSlabs || []).map((s) => ({
              minQty: Number(s.minOrderVal) || 0,
              percent: Number(s.supportPercent) || 0,
            })),
          },
        },
      };

      await SellerProductsAPI.updateTrade(id, payload);
      showAlert("success", "Trade settings updated instantly!");
      router.push("/seller/products");
    } catch (error) {
      console.error("Update failed:", error);
      showAlert("error", error.message || "Failed to update trade settings");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          backHref={`/seller/products/${id}/edit`}
          backLabel="Back to Edit"
          title="Edit Trade Settings"
          subtitle="Changes made here are applied instantly to your live listing."
          primaryLabel="Save Changes"
          primaryIcon={BoltIcon}
          primaryDisabled={isSubmitting}
          onPrimary={handleSubmit(onSubmit)}
        />

        <div className="mt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <p className="text-sm font-medium text-green-800">
              Changes to Trade Settings are applied <strong>instantly</strong>{" "}
              to your live product listing.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <FormSection
              title="Pricing & Stock"
              description="Manage your pricing strategy, taxes, and inventory"
              icon={CurrencyRupeeIcon}
            >
              <TradePricing
                register={register}
                control={control}
                errors={errors}
                watch={watch}
                priceType={priceType}
                setPriceType={setPriceType}
              />
            </FormSection>

            <FormSection
              title="Packaging Configuration"
              description="Define how your product is packed for shipping"
              icon={ArchiveBoxIcon}
            >
              <Packaging
                register={register}
                control={control}
                errors={errors}
                watch={watch}
                setValue={setValue}
              />
            </FormSection>

            <FormSection
              title="Dispatch & Logistics"
              description="Set processing times and shipping origin"
              icon={TruckIcon}
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
              title="Cost Support"
              description="Configure freight and payment support tiers"
              icon={BanknotesIcon}
            >
              <CostSupport
                register={register}
                control={control}
                errors={errors}
              />
            </FormSection>

            {/* Actions */}
            <div className="flex justify-end pt-2 pb-20">
              <Button type="submit" loading={isSubmitting} icon={BoltIcon}>
                Save Updates
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
