import express from "express";
import categoryRoutes from "./category.js";

const router = express.Router();

router.use('/category', categoryRoutes);

export default router;