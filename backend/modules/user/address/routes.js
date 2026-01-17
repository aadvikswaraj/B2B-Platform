import express from "express";
import * as addressController from "./controller.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";

const router = express.Router();

router.get("/", requireAuthentication, addressController.list);
router.post("/", requireAuthentication, addressController.create);
router.get("/:id", requireAuthentication, addressController.getById);
router.put("/:id", requireAuthentication, addressController.update);
router.delete("/:id", requireAuthentication, addressController.remove);
router.post(
  "/:id/default",
  requireAuthentication,
  addressController.setDefault
);

export default router;
