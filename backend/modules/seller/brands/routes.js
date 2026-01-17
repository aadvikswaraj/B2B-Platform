import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import requireSeller from "../../../middleware/requireSeller.js";
import { validateRequest } from "../../../utils/customValidators.js";

const router = express.Router();

// List brands
router.get(
  "/",
  requireAuthentication,
  requireSeller,
  validateRequest(validator.listSchema, "query"),
  controller.list
);

// Get brand by ID
router.get("/:id", requireAuthentication, requireSeller, controller.getById);

// Create brand
router.post(
  "/new",
  requireAuthentication,
  requireSeller,
  validateRequest(validator.createSchema),
  controller.create
);

router.post(
  "/:id",
  requireAuthentication,
  requireSeller,
  validateRequest(validator.updateSchema),
  controller.update
);

// Delete brand
router.delete(
  "/:id",
  requireAuthentication,
  requireSeller,
  validateRequest(validator.deleteSchema),
  controller.remove
);

export default router;
