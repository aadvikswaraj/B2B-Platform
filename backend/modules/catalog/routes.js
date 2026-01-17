import express from "express";
import brandRoutes from "./brands/routes.js";
import categoryRoutes from "./categories/routes.js";

const router = express.Router();

router.use('/brands', brandRoutes);
router.use('/categories', categoryRoutes);

export default router;
