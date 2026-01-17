// routes.js - File routes
import { Router } from "express";
import express from "express";
import * as controller from "./controller.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import { validateRequest } from "../../../utils/customValidators.js";
import * as validator from "./validator.js";

const router = Router();

// All routes require authentication
router.use(requireAuthentication);

// Upload: raw body parser (50MB limit), no JSON parsing
router.post(
  "/upload",
  express.raw({ type: "*/*", limit: "50mb" }),
  controller.uploadFile
);

// Get file with presigned URL
router.get(
  "/:fileId",
  validateRequest(validator.fileIdSchema, "params"),
  controller.getFileById
);

// Redirect to file URL
router.get(
  "/:fileId/redirect-url",
  validateRequest(validator.fileIdSchema, "params"),
  controller.redirectFileUrl
);

// Delete file
router.delete(
  "/:fileId",
  validateRequest(validator.fileIdSchema, "params"),
  controller.removeFile
);

export default router;
