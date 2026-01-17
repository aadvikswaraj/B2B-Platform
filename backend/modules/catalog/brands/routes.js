import express from "express";
import * as brandController from "./controller.js";

const router = express.Router();

router.get("/", brandController.list);

export default router;
