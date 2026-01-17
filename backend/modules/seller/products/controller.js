import * as productService from "./service.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";
import { createListController } from "../../../utils/listQueryHandler.js";

/**
 * List products with pagination, search, and filters
 */
export const list = createListController({
  service: productService.list,
  searchFields: ["title", "description"],
  filterMap: {
    status: (v) => ({ status: v }),
    categoryId: (v) => ({ category: v }),
    isApproved: (v) => ({ isApproved: v }),
  },
  callService: (service, { query, skip, pageSize, sort, req }) =>
    service(req.user._id, query, skip, pageSize, sort),
});

/**
 * Get product by ID
 */
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getById(id, req.user._id);

    if (!product) {
      res.locals.response = {
        success: false,
        message: "Product not found",
        status: 404,
      };
      return sendResponse(res);
    }

    res.locals.response = {
      success: true,
      message: "Product fetched successfully",
      status: 200,
      data: product,
    };
  } catch (error) {
    console.error("Error in getById:", error);
    res.locals.response = {
      success: false,
      message: error.message,
      status: 500,
    };
  }
  return sendResponse(res);
};

/**
 * Create new product
 */
export const create = async (req, res) => {
  try {
    const {
      categoryId,
      // Map legacy fields to standard model fields
      title,
      productName,
      description,
      detailedDesc,
      shortDesc,
      brand,
      brandId,

      isGeneric,
      priceType,
      singlePrice,
      priceSlabs,
      moq,
      stock,
      catSpecs,
      attributes, // alias for catSpecs
      specs,
      // New fields
      packagingLevels,
      logistics,
      originCountry,
      packagingDetails,
      productionCapacity,
      // Support fields
      support,
      freightSupport,
      paymentFeeSupport,
      images,
      video,
      brochure,
      taxPercent,
    } = req.body;

    // Resolve fields
    const productTitle = title || productName;
    const productDesc = description || detailedDesc || shortDesc;
    const brandRef = brand || brandId;
    const categorySpecs = catSpecs || attributes;

    // Validate category exists
    const category = await productService.getCategoryById(categoryId);
    if (!category) {
      res.locals.response = {
        success: false,
        message: "Category not found",
        status: 404,
      };
      return sendResponse(res);
    }

    // Validate brand if not generic
    let brandObj = null;
    const genericFlag = !!isGeneric;
    if (!genericFlag && brandRef) {
      brandObj = await productService.getVerifiedBrand(brandRef, req.user._id);
      if (!brandObj) {
        res.locals.response = {
          success: false,
          message:
            "Brand not found or not verified. Submit brand proof in seller panel and wait for approval.",
          status: 400,
        };
        return sendResponse(res);
      }
    }

    // Construct Price Object
    const priceObj = {
      type: priceType,
      moq: Number(moq || 1) || 1,
      slabs: [],
    };

    if (priceType === "single") {
      priceObj.singlePrice = Number(singlePrice || 0);
    } else if (priceType === "slab" && Array.isArray(priceSlabs)) {
      priceObj.slabs = priceSlabs.map((s) => ({
        minQuantity: Number(s.minQty),
        price: Number(s.price),
      }));
    }

    // Build specifications
    const productSpecs = [];
    if (categorySpecs && typeof categorySpecs === "object") {
      Object.entries(categorySpecs).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v).trim() !== "") {
          productSpecs.push({ specification: k, value: String(v) });
        }
      });
    }
    if (Array.isArray(specs)) {
      specs.forEach((s) => {
        const name = (s?.name || "").trim();
        const value = (s?.value || "").trim();
        const unit = (s?.unit || "").trim();
        if (name && value) {
          productSpecs.push({
            specification: name,
            value: unit ? `${value} ${unit}` : value,
          });
        }
      });
    }

    // Create product
    const product = await productService.create({
      title: String(productTitle).trim(),
      isGeneric: genericFlag,
      brand: brandObj?._id || undefined,
      category: category._id,
      description: String(productDesc || "").trim(),
      stock: Number(stock || 0),
      specifications: productSpecs,
      images: images || [], // Passed from frontend if uploaded
      video,
      pdf: brochure,
      price: priceObj,
      taxPercent: Number(taxPercent || 0),
      status: "active", // defaulting to active primarily
      moderation: { status: "pending" },
      seller: req.user._id,

      // Packaging Levels
      packagingLevels: packagingLevels || [],

      // Logistics - using correct nested structure from model
      logistics: logistics || {
        dispatchTime: {
          parcel: { type: "single", days: 0, slabs: [] },
          freight: { type: "single", days: 0, slabs: [] },
        },
        originCountry: originCountry || "",
        packagingDetails: packagingDetails || "",
      },

      // Production
      production: {
        capacity: productionCapacity || "",
      },

      // Support - using correct structure from model
      support: support || {
        freight: freightSupport || { type: "single", amount: 0, slabs: [] },
        paymentFee: paymentFeeSupport || {
          type: "single",
          percent: 0,
          slabs: [],
        },
      },
    });

    res.locals.response = {
      success: true,
      message: "Product created successfully",
      status: 201,
      data: { id: product._id },
    };
  } catch (error) {
    console.error("Error in create:", error);
    res.locals.response = {
      success: false,
      message: error.message,
      status: 500,
    };
  }
  return sendResponse(res);
};

/**
 * Update product
 */
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      categoryId,
      productName,
      detailedDesc,
      shortDesc,
      isGeneric,
      brandId,
      priceType,
      singlePrice,
      priceSlabs,
      moq,
      stock,
      catSpecs,
      specs,
      status,
    } = req.body;
    const updateData = {};

    // Validate category if provided
    if (categoryId) {
      const category = await productService.getCategoryById(categoryId);
      if (!category) {
        res.locals.response = {
          success: false,
          message: "Category not found",
          status: 404,
        };
        return sendResponse(res);
      }
      updateData.category = category._id;
    }

    // Validate brand if provided
    if (brandId) {
      const brand = await productService.getVerifiedBrand(
        brandId,
        req.user._id
      );
      if (!brand) {
        res.locals.response = {
          success: false,
          message: "Brand not found or not verified",
          status: 400,
        };
        return sendResponse(res);
      }
      updateData.brand = brand._id;
    }

    // Update basic fields
    if (productName) updateData.title = String(productName).trim();
    if (detailedDesc !== undefined)
      updateData.description = String(detailedDesc).trim();
    if (isGeneric !== undefined) updateData.isGeneric = !!isGeneric;
    if (moq !== undefined) updateData.minOrderQuantity = Number(moq) || 1;
    if (stock !== undefined) updateData.stock = Number(stock);
    if (status) updateData.status = status;

    // Calculate price if price data provided
    if (priceType) {
      let price = 0;
      if (priceType === "single") {
        price = Number(singlePrice || 0);
      } else if (
        priceType === "slab" &&
        Array.isArray(priceSlabs) &&
        priceSlabs.length
      ) {
        const prices = priceSlabs
          .map((s) => Number(s?.price || 0))
          .filter((n) => Number.isFinite(n) && n > 0);
        price = prices.length ? Math.min(...prices) : 0;
      }
      if (Number.isFinite(price) && price >= 0) {
        updateData.price = price;
      }
    }

    // Build specifications if provided
    if (catSpecs || specs) {
      const productSpecs = [];
      if (catSpecs && typeof catSpecs === "object") {
        Object.entries(catSpecs).forEach(([k, v]) => {
          if (v !== undefined && v !== null && String(v).trim() !== "") {
            productSpecs.push({ specification: k, value: String(v) });
          }
        });
      }
      if (Array.isArray(specs)) {
        specs.forEach((s) => {
          const name = (s?.name || "").trim();
          const value = (s?.value || "").trim();
          const unit = (s?.unit || "").trim();
          if (name && value) {
            productSpecs.push({
              specification: name,
              value: unit ? `${value} ${unit}` : value,
            });
          }
        });
      }
      if (productSpecs.length > 0) {
        updateData.specifications = productSpecs;
      }
    }

    // Update product (service handles reverification logic)
    const product = await productService.update(id, req.user._id, updateData);

    if (!product) {
      res.locals.response = {
        success: false,
        message: "Product not found",
        status: 404,
      };
      return sendResponse(res);
    }

    res.locals.response = {
      success: true,
      message:
        product.moderation?.status === "pending"
          ? "Product updated and sent for reverification"
          : "Product updated successfully",
      status: 200,
      data: { id: product._id },
    };
  } catch (error) {
    console.error("Error in update:", error);
    res.locals.response = {
      success: false,
      message: error.message,
      status: 500,
    };
  }
  return sendResponse(res);
};

/**
 * Delete product (soft delete)
 */
export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.remove(id, req.user._id);

    if (!product) {
      res.locals.response = {
        success: false,
        message: "Product not found",
        status: 404,
      };
      return sendResponse(res);
    }

    res.locals.response = {
      success: true,
      message: "Product deleted successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Error in remove:", error);
    res.locals.response = {
      success: false,
      message: error.message,
      status: 500,
    };
  }
  return sendResponse(res);
};

/**
 * Update Trade Info (Price, Stock, Logistics) - Instant
 */
export const updateTradeInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      priceType,
      singlePrice,
      priceSlabs,
      taxPercent,
      moq,
      stock,
      status,
      packagingLevels,
      // Logistics fields with correct nesting
      logistics: logisticsInput,
      originCountry,
      packagingDetails,
      // Production
      production,
      // Support fields
      support: supportInput,
      freightSupport,
      paymentFeeSupport,
    } = req.body;

    const product = await productService.getById(id, req.user._id);
    if (!product) {
      res.locals.response = {
        success: false,
        message: "Product not found",
        status: 404,
      };
      return sendResponse(res);
    }

    const updateData = {};

    // Status
    if (status) updateData.status = status;
    if (stock !== undefined) updateData.stock = Number(stock);
    if (taxPercent !== undefined) updateData.taxPercent = Number(taxPercent);

    // Price Updating - ensure price object is always complete
    if (priceType || singlePrice !== undefined || priceSlabs || moq) {
      // Get current price or default
      const currentPrice = product.price || {
        type: "single",
        singlePrice: 0,
        moq: 1,
        slabs: [],
      };

      // Build new price object - always include type
      const newPrice = {
        type: priceType || currentPrice.type || "single",
        moq: moq !== undefined ? Number(moq) : currentPrice.moq || 1,
        singlePrice: currentPrice.singlePrice || 0,
        slabs: currentPrice.slabs || [],
      };

      // Update based on price type
      if (newPrice.type === "single") {
        if (singlePrice !== undefined) {
          newPrice.singlePrice = Number(singlePrice);
        }
        // Clear slabs for single price type
        newPrice.slabs = [];
      } else if (newPrice.type === "slab") {
        if (priceSlabs && Array.isArray(priceSlabs)) {
          newPrice.slabs = priceSlabs.map((s) => ({
            minQuantity: Number(s.minQuantity || s.minQty),
            price: Number(s.price),
          }));
        }
        // Ensure singlePrice is set to 0 for slab type
        newPrice.singlePrice = 0;
      }

      updateData.price = newPrice;
    }

    // Logistics - use correct nested structure: logistics.dispatchTime.parcel/freight
    if (
      logisticsInput ||
      originCountry !== undefined ||
      packagingDetails !== undefined
    ) {
      // Start from existing logistics if available
      const logistics = {
        ...(product.logistics || {}),
        dispatchTime: {
          ...(product.logistics?.dispatchTime || {}),
        },
      };

      // If full logistics object is provided, use it directly
      if (logisticsInput) {
        if (logisticsInput.dispatchTime) {
          if (logisticsInput.dispatchTime.parcel) {
            logistics.dispatchTime.parcel = {
              type: logisticsInput.dispatchTime.parcel.type || "single",
              days: Number(logisticsInput.dispatchTime.parcel.days || 0),
              slabs: (logisticsInput.dispatchTime.parcel.slabs || []).map(
                (s) => ({
                  maxQty: Number(s.maxQty),
                  days: Number(s.days),
                })
              ),
            };
          }
          if (logisticsInput.dispatchTime.freight) {
            logistics.dispatchTime.freight = {
              type: logisticsInput.dispatchTime.freight.type || "single",
              days: Number(logisticsInput.dispatchTime.freight.days || 0),
              slabs: (logisticsInput.dispatchTime.freight.slabs || []).map(
                (s) => ({
                  maxQty: Number(s.maxQty),
                  days: Number(s.days),
                })
              ),
            };
          }
        }
        if (logisticsInput.originCountry !== undefined) {
          logistics.originCountry = logisticsInput.originCountry;
        }
        if (logisticsInput.packagingDetails !== undefined) {
          logistics.packagingDetails = logisticsInput.packagingDetails;
        }
      }

      // Handle standalone field updates
      if (originCountry !== undefined) logistics.originCountry = originCountry;
      if (packagingDetails !== undefined)
        logistics.packagingDetails = packagingDetails;

      updateData.logistics = logistics;
    }

    if (packagingLevels) updateData.packagingLevels = packagingLevels;

    // Support - use correct nested structure: support.freight and support.paymentFee
    if (supportInput || freightSupport || paymentFeeSupport) {
      const support = { ...(product.support || {}) };

      // If full support object is provided, use it
      if (supportInput) {
        if (supportInput.freight) {
          support.freight = {
            type: supportInput.freight.type || "single",
            amount: Number(supportInput.freight.amount || 0),
            slabs: (supportInput.freight.slabs || []).map((s) => ({
              minQty: Number(s.minQty),
              amount: Number(s.amount),
            })),
          };
        }
        if (supportInput.paymentFee) {
          support.paymentFee = {
            type: supportInput.paymentFee.type || "single",
            percent: Number(supportInput.paymentFee.percent || 0),
            slabs: (supportInput.paymentFee.slabs || []).map((s) => ({
              minQty: Number(s.minQty),
              percent: Number(s.percent),
            })),
          };
        }
      }

      // Handle individual field updates
      if (freightSupport) {
        support.freight = {
          type: freightSupport.type || "single",
          amount: Number(freightSupport.amount || 0),
          slabs: (freightSupport.slabs || []).map((s) => ({
            minQty: Number(s.minQty),
            amount: Number(s.amount),
          })),
        };
      }
      if (paymentFeeSupport) {
        support.paymentFee = {
          type: paymentFeeSupport.type || "single",
          percent: Number(paymentFeeSupport.percent || 0),
          slabs: (paymentFeeSupport.slabs || []).map((s) => ({
            minQty: Number(s.minQty),
            percent: Number(s.percent),
          })),
        };
      }

      updateData.support = support;
    }

    // Production capacity
    if (production) {
      updateData.production = {
        capacity: production.capacity || "",
      };
    }

    const result = await productService.updateTradeInfo(
      id,
      req.user._id,
      updateData
    );

    res.locals.response = {
      success: true,
      message: "Trade info updated successfully",
      status: 200,
      data: { id: result._id },
    };
  } catch (error) {
    console.error("Error in updateTradeInfo:", error);
    res.locals.response = {
      success: false,
      message: error.message,
      status: 500,
    };
  }
  return sendResponse(res);
};

/**
 * Update Core Product Info (Draft Mode)
 */
export const updateCoreDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      productName,
      description,
      detailedDesc,
      shortDesc,
      brand,
      brandId,
      categoryId,
      category,
      isGeneric,
      specs,
      catSpecs,
      attributes,
      images,
      video,
      brochure,
      productionCapacity,
      certifications,
      originCountry,
      packagingDetails,
    } = req.body;

    const draftData = {};

    // Resolve Title/Desc
    if (title || productName)
      draftData.title = String(title || productName).trim();
    if (description || detailedDesc)
      draftData.description = String(description || detailedDesc).trim();
    if (isGeneric !== undefined) draftData.isGeneric = !!isGeneric;

    // Resolve Category
    const catId = categoryId || category;
    if (catId) {
      const catObj = await productService.getCategoryById(catId);
      if (!catObj) {
        res.locals.response = {
          success: false,
          message: "Category not found",
          status: 400,
        };
        return sendResponse(res);
      }
      draftData.category = catObj._id;
    }

    // Resolve Brand
    const bId = brand || brandId;
    if (bId) {
      const brandObj = await productService.getVerifiedBrand(bId, req.user._id);
      if (!brandObj) {
        res.locals.response = {
          success: false,
          message: "Brand not found or not verified",
          status: 400,
        };
        return sendResponse(res);
      }
      draftData.brand = brandObj._id;
    } else if (isGeneric === true) {
      // Handle switching to generic if needed (frontend logic mostly)
    }

    // Specs
    const rawSpecs = specs || [];
    if (catSpecs || attributes) {
      const obj = catSpecs || attributes;
      Object.entries(obj).forEach(([k, v]) => {
        if (v) rawSpecs.push({ name: k, value: String(v) });
      });
    }

    if (rawSpecs.length > 0) {
      draftData.specifications = rawSpecs.map((s) => ({
        specification: s.name || s.specification,
        value: s.value,
      }));
    }

    if (images) draftData.images = images;
    if (video !== undefined) draftData.video = video;
    if (brochure !== undefined) draftData.brochure = brochure;

    // Production & Compliance
    if (productionCapacity !== undefined || certifications !== undefined) {
      draftData.production = {
        capacity: productionCapacity,
        certifications: certifications,
      };
    }
    if (originCountry !== undefined || packagingDetails !== undefined) {
      // Storing as nested object in pendingUpdates
      draftData.logistics = {};
      if (originCountry !== undefined)
        draftData.logistics.originCountry = originCountry;
      if (packagingDetails !== undefined)
        draftData.logistics.packagingDetails = packagingDetails;
    }

    const updated = await productService.updateCoreDraft(
      id,
      req.user._id,
      draftData
    );

    res.locals.response = {
      success: true,
      message: "Product draft saved. Waiting for approval.",
      status: 200,
      data: { id: updated._id },
    };
  } catch (error) {
    console.error("Error in updateCoreDraft:", error);
    res.locals.response = {
      success: false,
      message: error.message,
      status: 500,
    };
  }
  return sendResponse(res);
};

export const discardDraft = async (req, res) => {
  try {
    const { id } = req.params;
    await productService.discardDraft(id, req.user._id);
    res.locals.response = {
      success: true,
      message: "Draft discarded",
      status: 200,
    };
  } catch (err) {
    res.locals.response = { success: false, message: err.message, status: 500 };
  }
  return sendResponse(res);
};
