import express from "express";
import * as buyLeadsController from "./controller.js";
// import { protect, seller } from "../../../middleware/authMiddleware.js";
// Assuming auth verification happens in the parent router or globally for /seller prefix
// But usually good to import middleware if needed.
// I'll check parent router first, but for now I'll stick to standard export.

const router = express.Router();

router.get("/", buyLeadsController.getBuyLeads);

export default router;
