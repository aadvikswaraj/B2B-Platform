import Joi from "joi";
import { objectIdValidator } from "../../../utils/customValidators.js";

const slab = Joi.array()
  .items(
    Joi.object({
      upto: Joi.number().min(1).required(),
      percent: Joi.number().min(0).required(),
    }),
  )
  .min(1)
  .custom((slabs, helpers) => {
    for (let i = 0; i < slabs.length; i++) {
      const curr = slabs[i];
      const prev = slabs[i - 1];

      if (prev) {
        // upto must be strictly increasing
        if (curr.upto <= prev.upto) {
          return helpers.error("any.custom", {
            message: "`upto` must be strictly increasing",
          });
        }

        // percent must be non-decreasing
        if (curr.percent < prev.percent) {
          return helpers.error("any.custom", {
            message: "`percent` must be non-decreasing",
          });
        }
      }
    }
    return slabs;
  }, "Slab continuity validation");

// Specification schema - reusable for both create and update
const specificationSchema = Joi.object({
  _id: objectIdValidator.optional(),
  name: Joi.string().required(),
  required: Joi.boolean().required(),
  type: Joi.string()
    .valid(
      "text",
      "number",
      "select",
      "multiselect",
      "date",
      "boolean",
      "range",
    )
    .required(),
  maxLength: Joi.number().optional(),
  options: Joi.array()
    .items(Joi.string().required())
    .when("type", {
      is: Joi.valid("select", "multiselect"),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  range: Joi.object({
    min: Joi.number(),
    max: Joi.number(),
  }).when("type", {
    is: "range",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  displayOrder: Joi.number().integer().optional(),
});

// Commission schema - reusable for both create and update
const commissionSchema = Joi.object({
  mode: Joi.string().valid("exact", "inherit", "slab").required(),
  exact: Joi.number().allow(null).when("mode", {
    is: "exact",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  slab: slab.when("mode", {
    is: "slab",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

export const createCategorySchema = Joi.object({
  name: Joi.string().trim().required(),
  description: Joi.string().allow("", null),
  image: objectIdValidator.allow(null),
  parentCategory: objectIdValidator.allow(null),
  acceptOrders: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
  specifications: Joi.array().items(specificationSchema).default([]),
  commission: commissionSchema.when("acceptOrders", {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional().allow(null),
  }),
}).unknown(false);

// Update schema excludes parentCategory (immutable after creation)
// and accepts _originalImageId for backend file cleanup
export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().required(),
  description: Joi.string().allow("", null),
  image: objectIdValidator.allow(null),
  // parentCategory is NOT allowed - immutable after creation
  acceptOrders: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
  specifications: Joi.array().items(specificationSchema).default([]),
  commission: commissionSchema.when("acceptOrders", {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional().allow(null),
  }),
  // Original image ID for backend cleanup (optional, used when image changed)
  _originalImageId: objectIdValidator.allow(null),
}).unknown(false);
