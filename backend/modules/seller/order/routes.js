import express from "express";
import * as controller from "./controller.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";

const router = express.Router();

router.get("/", requireAuthentication, controller.getOrders);
router.patch(
  "/:orderId/items/:itemId/status",
  requireAuthentication,
  controller.updateMainStatus,
);
router.post(
  "/:orderId/items/:itemId/refund",
  requireAuthentication,
  controller.processRefund,
);

export default router;
