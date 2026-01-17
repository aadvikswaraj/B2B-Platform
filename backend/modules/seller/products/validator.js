import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";
import { createListSchema } from "../../../utils/listQueryHandler.js";

export const listSchema = createListSchema({
  filters: Joi.object({
    status: Joi.string()
      .valid("active", "inactive", "rejected", "pending")
      .optional(),
    categoryId: objectIdValidator.optional(),
    isApproved: Joi.boolean().truthy("true").falsy("false").optional(),
  }),
  sortFields: ["title", "createdAt", "updatedAt", "price", "stock"],
});

export const createSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).required(),
  description: Joi.string().trim().max(5000).allow("", null).optional(),

  // Logic: if generic, brand is optional. If not generic, brand is required.
  isGeneric: Joi.boolean().default(false),
  brand: objectIdValidator.when("isGeneric", {
    is: true,
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),

  categoryId: objectIdValidator.optional(),
  category: objectIdValidator.optional(),
  priceType: Joi.string().valid("single", "slab").default("single"),
  singlePrice: Joi.number().min(0).optional(),
  priceSlabs: Joi.array()
    .items(
      Joi.object({
        minQty: Joi.number().integer().min(1).required(),
        price: Joi.number().min(0).required(),
      })
    )
    .optional(),
  moq: Joi.number().integer().min(1).default(1),
  stock: Joi.number().integer().min(0).default(0),
  specs: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().required(),
        value: Joi.string().trim().required(),
        unit: Joi.string().trim().allow("", null).optional(),
      })
    )
    .optional(),
  // Logistics - nested structure matching model
  packagingLevels: Joi.array()
    .items(
      Joi.object({
        level: Joi.number().required(),
        name: Joi.string().required(),
        containsQty: Joi.alternatives()
          .try(Joi.number(), Joi.string().allow(""))
          .optional(),
        weight: Joi.alternatives()
          .try(Joi.number(), Joi.string().allow(""))
          .required(),
        dimensions: Joi.object({
          l: Joi.alternatives()
            .try(Joi.number(), Joi.string().allow(""))
            .optional(),
          w: Joi.alternatives()
            .try(Joi.number(), Joi.string().allow(""))
            .optional(),
          h: Joi.alternatives()
            .try(Joi.number(), Joi.string().allow(""))
            .optional(),
        }).optional(),
        isStackable: Joi.boolean().optional(),
        isShippingUnit: Joi.boolean().optional(),
        type: Joi.string().optional(),
        isFragile: Joi.boolean().optional(),
      })
    )
    .optional(),

  // Logistics object with correct nested dispatchTime structure
  logistics: Joi.object({
    dispatchTime: Joi.object({
      parcel: Joi.object({
        type: Joi.string().valid("single", "slab").optional(),
        days: Joi.number().integer().min(0).optional(),
        slabs: Joi.array()
          .items(
            Joi.object({
              maxQty: Joi.number().integer().min(1).required(),
              days: Joi.number().integer().min(0).required(),
            }).unknown(true)
          )
          .optional(),
      }).optional(),
      freight: Joi.object({
        type: Joi.string().valid("single", "slab").optional(),
        days: Joi.number().integer().min(0).optional(),
        slabs: Joi.array()
          .items(
            Joi.object({
              maxQty: Joi.number().integer().min(1).required(),
              days: Joi.number().integer().min(0).required(),
            }).unknown(true)
          )
          .optional(),
      }).optional(),
    }).optional(),
    originCountry: Joi.string().allow("", null).optional(),
    packagingDetails: Joi.string().allow("", null).optional(),
  }).optional(),

  // Standalone fields for backwards compatibility
  originCountry: Joi.string().allow("", null).optional(),
  packagingDetails: Joi.string().allow("", null).optional(),
  productionCapacity: Joi.string().allow("", null).optional(),

  // Support object with correct nested structure
  support: Joi.object({
    freight: Joi.object({
      type: Joi.string().valid("single", "slab").optional(),
      amount: Joi.number().min(0).optional(),
      slabs: Joi.array()
        .items(
          Joi.object({
            minQty: Joi.number().integer().min(1).required(),
            amount: Joi.number().min(0).required(),
          }).unknown(true)
        )
        .optional(),
    }).optional(),
    paymentFee: Joi.object({
      type: Joi.string().valid("single", "slab").optional(),
      percent: Joi.number().min(0).max(100).optional(),
      slabs: Joi.array()
        .items(
          Joi.object({
            minQty: Joi.number().integer().min(1).required(),
            percent: Joi.number().min(0).max(100).required(),
          }).unknown(true)
        )
        .optional(),
    }).optional(),
  }).optional(),

  // Individual support field inputs for flexibility
  freightSupport: Joi.object({
    type: Joi.string().valid("single", "slab").optional(),
    amount: Joi.number().min(0).optional(),
    slabs: Joi.array()
      .items(
        Joi.object({
          minQty: Joi.number().integer().min(1).required(),
          amount: Joi.number().min(0).required(),
        }).unknown(true)
      )
      .optional(),
  }).optional(),
  paymentFeeSupport: Joi.object({
    type: Joi.string().valid("single", "slab").optional(),
    percent: Joi.number().min(0).max(100).optional(),
    slabs: Joi.array()
      .items(
        Joi.object({
          minQty: Joi.number().integer().min(1).required(),
          percent: Joi.number().min(0).max(100).required(),
        }).unknown(true)
      )
      .optional(),
  }).optional(),

  images: Joi.array().min(1).required(),
  video: objectIdValidator.allow(null).optional(),
  brochure: objectIdValidator.allow(null).optional(),

  weight: Joi.any().optional(),
  catSpecs: Joi.object().optional(),
  taxPercent: Joi.number().min(0).max(100).optional(),

  // Legacy/Synonym fields (kept optional for robustness)
  productName: Joi.string().optional(),
  shortDesc: Joi.string().optional(),
  detailedDesc: Joi.string().optional(),
  attributes: Joi.object().optional(),
  brandId: objectIdValidator.optional(),
}).unknown(true);

export const updateSchema = Joi.object({
  categoryId: objectIdValidator.optional(),
  productName: Joi.string().trim().min(2).max(200).optional(),
  detailedDesc: Joi.string().trim().max(5000).allow("", null).optional(),
  shortDesc: Joi.string().trim().max(500).allow("", null).optional(),
  isGeneric: Joi.boolean().optional(),
  brandId: objectIdValidator.optional(),
  priceType: Joi.string().valid("single", "slab").optional(),
  singlePrice: Joi.number().min(0).optional(),
  priceSlabs: Joi.array()
    .items(
      Joi.object({
        minQty: Joi.number().integer().min(1).required(),
        price: Joi.number().min(0).required(),
      })
    )
    .optional(),
  moq: Joi.number().integer().min(1).optional(),
  stock: Joi.number().integer().min(0).optional(),
  catSpecs: Joi.object().unknown(true).optional(),
  specs: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().required(),
        value: Joi.string().trim().required(),
        unit: Joi.string().trim().allow("", null).optional(),
      })
    )
    .optional(),
  status: Joi.string().valid("active", "inactive").optional(),
})
  .min(1)
  .unknown(false);

export const updateTradeSchema = Joi.object({
  priceType: Joi.string().valid("single", "slab").optional(),
  singlePrice: Joi.number().min(0).optional(),
  priceSlabs: Joi.array()
    .items(
      Joi.object({
        minQty: Joi.number().integer().min(1).optional(),
        minQuantity: Joi.number().integer().min(1).optional(),
        price: Joi.number().min(0).required(),
      })
    )
    .optional(),
  moq: Joi.number().integer().min(1).optional(),
  stock: Joi.number().integer().min(0).optional(),
  taxPercent: Joi.number().min(0).max(100).optional(),

  packagingLevels: Joi.array().items(Joi.object()).optional(),

  // Logistics object with correct nested structure
  logistics: Joi.object({
    dispatchTime: Joi.object({
      parcel: Joi.object({
        type: Joi.string().valid("single", "slab").optional(),
        days: Joi.number().integer().min(0).optional(),
        slabs: Joi.array()
          .items(
            Joi.object({
              maxQty: Joi.number().integer().min(1).required(),
              days: Joi.number().integer().min(0).required(),
            }).unknown(true)
          )
          .optional(),
      }).optional(),
      freight: Joi.object({
        type: Joi.string().valid("single", "slab").optional(),
        days: Joi.number().integer().min(0).optional(),
        slabs: Joi.array()
          .items(
            Joi.object({
              maxQty: Joi.number().integer().min(1).required(),
              days: Joi.number().integer().min(0).required(),
            }).unknown(true)
          )
          .optional(),
      }).optional(),
    }).optional(),
    originCountry: Joi.string().allow("", null).optional(),
    packagingDetails: Joi.string().allow("", null).optional(),
  }).optional(),

  // Standalone fields for backwards compatibility
  originCountry: Joi.string().allow("", null).optional(),
  packagingDetails: Joi.string().allow("", null).optional(),

  // Support object with correct nested structure
  support: Joi.object({
    freight: Joi.object({
      type: Joi.string().valid("single", "slab").optional(),
      amount: Joi.number().min(0).optional(),
      slabs: Joi.array()
        .items(
          Joi.object({
            minQty: Joi.number().integer().min(1).required(),
            amount: Joi.number().min(0).required(),
          }).unknown(true)
        )
        .optional(),
    }).optional(),
    paymentFee: Joi.object({
      type: Joi.string().valid("single", "slab").optional(),
      percent: Joi.number().min(0).max(100).optional(),
      slabs: Joi.array()
        .items(
          Joi.object({
            minQty: Joi.number().integer().min(1).required(),
            percent: Joi.number().min(0).max(100).required(),
          }).unknown(true)
        )
        .optional(),
    }).optional(),
  }).optional(),

  // Individual support field inputs
  freightSupport: Joi.object({
    type: Joi.string().valid("single", "slab").optional(),
    amount: Joi.number().min(0).optional(),
    slabs: Joi.array()
      .items(
        Joi.object({
          minQty: Joi.number().integer().min(1).required(),
          amount: Joi.number().min(0).required(),
        }).unknown(true)
      )
      .optional(),
  }).optional(),
  paymentFeeSupport: Joi.object({
    type: Joi.string().valid("single", "slab").optional(),
    percent: Joi.number().min(0).max(100).optional(),
    slabs: Joi.array()
      .items(
        Joi.object({
          minQty: Joi.number().integer().min(1).required(),
          percent: Joi.number().min(0).max(100).required(),
        }).unknown(true)
      )
      .optional(),
  }).optional(),

  // Production
  production: Joi.object({
    capacity: Joi.string().allow("", null).optional(),
  }).optional(),

  status: Joi.string().valid("active", "inactive").optional(),
})
  .min(1)
  .unknown(true);

export const updateCoreSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).optional(),
  description: Joi.string().trim().max(5000).allow("", null).optional(),
  isGeneric: Joi.boolean().optional(),
  brand: objectIdValidator.optional(),
  categoryId: objectIdValidator.optional(),

  specs: Joi.array().items(Joi.object()).optional(),
  catSpecs: Joi.object().unknown(true).optional(),

  images: Joi.array().min(1).optional(),
  video: objectIdValidator.allow(null).optional(),
  brochure: objectIdValidator.allow(null).optional(),

  productionCapacity: Joi.string().allow("", null).optional(),
  originCountry: Joi.string().allow("", null).optional(),

  // Aliases
  productName: Joi.string().optional(),
  detailedDesc: Joi.string().optional(),
  shortDesc: Joi.string().optional(),
  brandId: objectIdValidator.optional(),
})
  .min(1)
  .unknown(true);
