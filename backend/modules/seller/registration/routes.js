import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import requireSeller from "../../../middleware/requireSeller.js";
import { validateRequest } from "../../../utils/customValidators.js";

const router = express.Router();

// Get registration progress
router.get("/progress", requireAuthentication, controller.getProgress);

// Save registration step
router.post(
  "/save-step",
  requireAuthentication,
  validateRequest(validator.saveStepSchema),
  controller.saveStep,
);

export default router;
