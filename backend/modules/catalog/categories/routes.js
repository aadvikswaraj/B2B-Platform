import express from "express";
import * as categoryController from "./controller.js";

const router = express.Router();

router.get("/", categoryController.list);
router.get("/tree", categoryController.tree);
router.get("/:id", categoryController.getById);
router.get("/:id/commission", categoryController.getCommission);

export default router;
