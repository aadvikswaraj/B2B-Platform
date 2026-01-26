import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import requireSeller from "../../../middleware/requireSeller.js";
import { validateRequest } from "../../../utils/customValidators.js";

import { listEndpoint } from "../../../utils/listQueryHandler.js";
import { Brand } from "../../../models/model.js";
import Joi from "joi";

const router = express.Router();

// List brands
router.get(
  "/",
  requireAuthentication,
  requireSeller,
  ...listEndpoint({
    model: Brand,
    searchFields: ["name"],
    buildQuery: (filters, req) => ({
      user: req.user._id,
      ...(filters?.status && { "kyc.status": filters.status }),
    }),
    populate: { path: "kyc.file", select: "relativePath" },
    filters: Joi.object({
      status: Joi.string().valid("pending", "verified", "rejected").optional(),
    }),
    sortFields: ["name", "createdAt"],
  }),
);

// Get brand by ID
router.get("/:id", requireAuthentication, requireSeller, controller.getById);

// Create brand
router.post(
  "/new",
  requireAuthentication,
  requireSeller,
  validateRequest(validator.createSchema),
  controller.create,
);

router.post(
  "/:id",
  requireAuthentication,
  requireSeller,
  validateRequest(validator.updateSchema),
  controller.update,
);

// Delete brand
router.delete(
  "/:id",
  requireAuthentication,
  requireSeller,
  validateRequest(validator.deleteSchema),
  controller.remove,
);

export default router;
