import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import { validateRequest } from "../../../utils/customValidators.js";

const router = express.Router();

router.get(
  "/:sellerId/contact",
  validateRequest(validator.getContactSchema, "params"),
  controller.getContact
);

export default router;
