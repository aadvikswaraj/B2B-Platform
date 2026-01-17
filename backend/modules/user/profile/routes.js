import express from "express";
import * as profileController from "./controller.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";

const router = express.Router();

router.get("/", requireAuthentication, profileController.get);
router.post("/", requireAuthentication, profileController.update);

export default router;
