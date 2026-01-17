"use client";
import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import SellerProductsAPI from "@/utils/api/seller/products";
import BrandsAPI from "@/utils/api/seller/brands";
import CatalogAPI from "@/utils/api/catalog";
import { Tabs } from "@/components/ui/Tabs";
import FormSection from "@/components/ui/FormSection";
import ParentPicker from "@/components/admin/categories/ParentPicker";
import { 
  TagIcon, 
  PhotoIcon, 
  CubeIcon, 
  CurrencyRupeeIcon, 
  TruckIcon, 
  ClipboardDocumentCheckIcon,
  BanknotesIcon,
  PresentationChartLineIcon
} from "@heroicons/react/24/outline";

import TechSpecs from "@/components/seller/products/product-form/TechSpecs";
import Packaging from "@/components/seller/products/product-form/Packaging";
import TradePricing from "@/components/seller/products/product-form/TradePricing";
import DispatchLogistics from "@/components/seller/products/product-form/DispatchLogistics";
import CostSupport from "@/components/seller/products/product-form/CostSupport";
import ProfitabilitySimulator from "@/components/seller/products/product-form/ProfitabilitySimulator";
import BasicIdentity from "@/components/seller/products/product-form/BasicIdentity";
import MediaDocs from "@/components/seller/products/product-form/MediaDocs";
import SalesMode from "@/components/seller/products/product-form/SalesMode";
import { resolveSpecifications, resolveCommission, resolveAcceptOrders } from "@/utils/category";
import { useAlert } from "@/components/ui/AlertManager";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";

export default function AddProduct() {
  const [activeTab, setActiveTab] = useState(0); // 0: Category, 1: Product Info
  const [category, setCategory] = useState(null); // Full category with populated parentCategory
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // Just the ID for triggering fetch
  const [categorySpecs, setCategorySpecs] = useState([]);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [brands, setBrands] = useState({ loading: false, list: [] });
  
  // Sales Mode State
  const [salesMode, setSalesMode] = useState("orders"); // 'orders' | 'inquiry'
  
  // Media State (Managed here to pass down)
  const [images, setImages] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [imageError, setImageError] = useState(null);

  const pushAlert = useAlert();

  // Clear image error when images change
  useEffect(() => {
    if (images.length > 0) setImageError(null);
  }, [images]);

  // Pricing State
  const [priceType, setPriceType] = useState("single"); // 'single' | 'slab'
  
  // Logistics Modes
  const [parcelMode, setParcelMode] = useState("single");
  const [freightMode, setFreightMode] = useState("single");

  const {
    register,
    control,
    watch,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
    trigger
  } = useForm({
    mode: "onChange",
    defaultValues: {
      productName: "",
      shortDesc: "",
      brandId: "",
      specs: [], 
      attributes: {}, 
      moq: 1,
      stock: 0,
      taxPercent: "",
      price: "",
      priceSlabs: [],
      // Logistics
      packagingLevels: [{ 
          level: 0, 
          name: "Unit", 
          type: "base", 
          weight: "", 
          dimensions: {}, 
          isFragile: false, 
          isStackable: false, 
          isShippingUnit: true 
      }],
      dispatchTimeParcel: "",
      dispatchTimeParcelSlabs: [],
      dispatchTimeFreight: "",
      dispatchTimeFreightSlabs: [],
      // Support
      shippingSupportTiers: [],
      paymentFeeCoverLimit: "",
      // Ops
      productionCapacity: "",
      originCountry: "",
      packagingDetails: "",
      certifications: ""
    },
  });

  // Field Arrays
  const {
    fields: priceSlabs,
    append: addSlab,
    remove: removeSlab,
  } = useFieldArray({ name: "priceSlabs", control });

  const {
    fields: shippingTiers,
    append: addShippingTier,
    remove: removeShippingTier,
  } = useFieldArray({ name: "shippingSupportTiers", control });

  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
  } = useFieldArray({ name: "specs", control });
  
  // Category Picker logic
  const categoryApiClient = useMemo(() => ({
    list: async (params) => {
      let filters = {};
      try {
        filters = params.filters ? JSON.parse(params.filters) : {};
      } catch (e) {}
      const catalogParams = {
        parent: filters.parentCategory || "root",
        depth: filters.depth,
        search: params.search,
        page: 1, 
        pageSize: 100,
        sort: "name"
      };
      return await CatalogAPI.categories(catalogParams);
    }
  }), []);

  // Load Brands
  const loadBrands = async () => {
    setBrands(prev => ({ ...prev, loading: true }));
    try {
      const res = await BrandsAPI.list({ filters: JSON.stringify({ status: "verified" }) });
      setBrands({ loading: false, list: res?.data?.docs || [] });
    } catch (e) {
      setBrands(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  // Load Category Specs
  useEffect(() => {
    if (!selectedCategoryId) {
      setCategory(null);
      setCategorySpecs([]);
      return;
    }
    setLoadingSpecs(true);
    (async () => {
        try {
            const res = await CatalogAPI.category(selectedCategoryId);
            if (!res?.success) throw new Error("Failed to load category details.");
            const fullCategory = res.data;
            setCategory(fullCategory); // Now has full populated parentCategory chain
            setCategorySpecs(resolveSpecifications(fullCategory || []));
            console.log('Full category loaded:', fullCategory);
            console.log('Resolved Commission:', resolveCommission(fullCategory));
            console.log('Accept Orders Allowed:', resolveAcceptOrders(fullCategory));
        } catch (e) {
            console.error(e);
            pushAlert("error", e.message || "Failed to load category.");
        } finally {
            setLoadingSpecs(false);
        }
    })();
  }, [selectedCategoryId]);

  const onSubmit = async (data) => {
    // Basic validation
    if (!category) {
        alert("Please select a category");
        setActiveTab(0);
        return;
    }
    
    // Process Images - Now just an array of IDs
    if (images.length === 0) {
        setImageError("At least 1 image is required.");
        alert("Please upload at least one valid image");
        return;
    }

    const payload = {
        title: data.productName,
        description: data.detailedDesc || data.shortDesc,
        categoryId: category._id,
        
        isGeneric: !!data.isGeneric, // Ensure boolean
        brand: data.brandId || undefined,

        images: images, 
        video: videoFile, 
        brochure: pdfFile,

        // Sales Mode
        salesMode: salesMode, // 'orders' | 'inquiry'

        priceType,
        singlePrice: priceType === "single" ? (parseFloat(data.price) || 0) : undefined,
        priceSlabs: priceType === "slab" ? data.priceSlabs : undefined,
        moq: parseInt(data.moq) || 1,
        stock: salesMode === 'orders' ? (parseInt(data.stock) || 0) : undefined,
        
        // Logistics (only for orders mode)
        ...(salesMode === 'orders' && {
            weight: data.weight ? parseFloat(data.weight) : undefined,
            unitsPerBatch: parseInt(data.unitsPerBatch) || 1,
            packagingLevels: data.packagingLevels,
            
            // Logistics (Parcel)
            dispatchTimeParcel: {
                mode: parcelMode,
                days: parcelMode === "single" ? (parseInt(data.dispatchTimeParcel) || 0) : undefined,
                slabs: parcelMode === "slab" ? data.dispatchTimeParcelSlabs : undefined
            },

            // Logistics (Freight)
            dispatchTimeFreight: {
                mode: freightMode,
                days: freightMode === "single" ? (parseInt(data.dispatchTimeFreight) || 0) : undefined,
                slabs: freightMode === "slab" ? data.dispatchTimeFreightSlabs : undefined
            },

            // Support
            shippingSupportTiers: data.shippingSupportTiers,
            paymentFeeCoverLimit: data.paymentFeeCoverLimit,
        }),

        originCountry: data.originCountry,
        packagingDetails: salesMode === 'orders' ? data.packagingDetails : undefined,
        
        // Compliance
        productionCapacity: data.productionCapacity,
        certifications: data.certifications,
        
        // Specifications
        catSpecs: data.attributes,
        specs: data.specs,
    };
    
    console.log("Submitting Payload", payload);
    
    try {
        const res = await SellerProductsAPI.create(payload);
        if (res?.success) {
            window.location.href = `/seller/products`; 
        } else {
             alert(res?.message || "Failed to create product");
        }
    } catch (e) {
        console.error("Submission error", e);
        alert("An error occurred while creating the product.");
    }
  };

  const tabs = [
      {
          key: "category",
          label: "Select Category",
          disabled: false,
          content: ( // Tab Content 0: Category Selection
            <div className="space-y-6 animate-in fade-in duration-300">
                <FormSection 
                    title="Product Category" 
                    description="Select the most specific category for your product to ensure it appears in the right searches."
                    icon={TagIcon}
                >
                    <div className="border rounded-lg p-4 bg-gray-50 min-h-[300px]">
                        <ParentPicker
                            apiClient={categoryApiClient}
                            onChange={(node) => {
                                // Set just the ID to trigger fetch of full category data
                                setSelectedCategoryId(node?._id || null);
                                setActiveTab(1);
                            }}
                            value={category}
                            placeholder="Browse Categories..."
                            leafSelectionOnly={true}
                        />
                         {category && (
                            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-200 flex items-center justify-between">
                                <span>Selected: <strong>{category.name}</strong></span>
                                <Button size="sm" onClick={() => setActiveTab(1)}>Continue to Product Details →</Button>
                            </div>
                         )}
                    </div>
                </FormSection>
            </div>
          )
      },
      {
          key: "details",
          label: "Product Information",
          disabled: !category,
          content: ( // Tab Content 1: The Full Form
             <div className="space-y-8 animate-in fade-in duration-300">
                
                {/* 1. Basic Identity */}
                <FormSection title="Basic Identity" description="Commercial details and branding." icon={TagIcon}>
                    <BasicIdentity 
                        control={control} 
                        register={register}
                        errors={errors} 
                        brands={brands}
                        onReloadBrands={loadBrands}
                    />
                </FormSection>

                {/* 2. Media */}
                <FormSection title="Media & Documents" description="Product images, videos and datasheets." icon={PhotoIcon}>
                    <MediaDocs 
                        images={images} 
                        setImages={setImages} 
                        videoFile={videoFile} 
                        setVideoFile={setVideoFile} 
                        pdfFile={pdfFile} 
                        setPdfFile={setPdfFile}
                        error={imageError}
                    />
                </FormSection>

                {/* 3. Specs */}
                <FormSection title="Technical Specifications" description="Material, finishes, and industry attributes." icon={CubeIcon}>
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

                {/* 4. Sales Mode & Commission - NEW SECTION */}
                <FormSection 
                    title="Sales Mode" 
                    description="Choose how you want to sell this product and preview platform commissions."
                    icon={ShoppingBagIcon}
                >
                    <SalesMode 
                        category={category}
                        salesMode={salesMode}
                        setSalesMode={setSalesMode}
                        watch={watch}
                    />
                </FormSection>

                {/* 5. Packaging - Only show for Orders mode */}
                {salesMode === 'orders' && (
                    <FormSection title="Packaging & Physical Structure" description="How this product is grouped, stored, and shipped." icon={CubeIcon}>
                        <Packaging 
                            control={control}
                            register={register}
                            errors={errors}
                            watch={watch}
                            setValue={setValue}
                        />
                    </FormSection>
                )}

                {/* 6. Pricing */}
                <FormSection 
                    title="Trade & Pricing" 
                    description={salesMode === 'orders' ? "MOQ, Price slabs, and taxes." : "Set indicative pricing for inquiries."}
                    icon={CurrencyRupeeIcon}
                >
                    <TradePricing 
                        register={register}
                        control={control}
                        errors={errors}
                        watch={watch}
                        priceType={priceType}
                        setPriceType={setPriceType}
                        priceSlabs={priceSlabs}
                        addSlab={addSlab}
                        removeSlab={removeSlab}
                        salesMode={salesMode}
                    />
                </FormSection>

                {/* 7. Dispatch - Only show for Orders mode */}
                {salesMode === 'orders' && (
                    <FormSection title="Dispatch & Operations" description="Processing times for Parcel vs Freight modes." icon={TruckIcon}>
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
                )}

                {/* 8. Cost Support & Subsidies - Only show for Orders mode */}
                {salesMode === 'orders' && (
                    <FormSection title="Cost Support & Subsidies" description="Offer free shipping or payment fee absorption to boost sales." icon={BanknotesIcon}>
                        <CostSupport 
                            register={register}
                            control={control}
                            errors={errors}
                            shippingTiers={shippingTiers}
                            addShippingTier={addShippingTier}
                            removeShippingTier={removeShippingTier}
                        />
                    </FormSection>
                )}

                {/* 9. Profitability Simulator - Only show for Orders mode */}
                {salesMode === 'orders' && (
                    <div className="pt-4">
                        <ProfitabilitySimulator 
                            watch={watch} 
                            category={category}
                        />
                    </div>
                )}

                <div className="flex justify-end pt-6 pb-20">
                     <Button size="lg" onClick={handleSubmit(onSubmit)}>
                        {salesMode === 'orders' ? 'Publish Product' : 'Publish for Inquiries'}
                     </Button>
                </div>
             </div>
          )
      }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
            backHref="/seller/products"
            backLabel="Back to Products"
            title="Add New Product"
            subtitle="Create a rich product listing with accurate logistics data."
        />

        <div className="mt-6">
            <Tabs 
                tabs={tabs} 
                activeTab={activeTab} 
                onChange={(key) => {
                    const idx = tabs.findIndex(t => t.key === key);
                    if (idx !== -1) setActiveTab(idx);
                }}
                equalWidth={true}
            />
        </div>
      </div>
    </div>
  );
}
