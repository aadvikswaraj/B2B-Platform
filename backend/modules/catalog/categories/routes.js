import express from "express";
import * as categoryController from "./controller.js";

const router = express.Router();

router.get("/", categoryController.list);
router.get("/:id", categoryController.getById);

export default router;
