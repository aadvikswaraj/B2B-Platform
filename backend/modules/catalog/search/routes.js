import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import { validateRequest } from "../../../utils/customValidators.js";

const router = express.Router();

// Public search endpoint - no auth required
router.get(
  "/",
  validateRequest(validator.searchSchema, "query"),
  controller.search
);

export default router;
