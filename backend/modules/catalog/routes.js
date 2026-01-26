import express from "express";
import brandRoutes from "./brands/routes.js";
import categoryRoutes from "./categories/routes.js";
import productRoutes from "./products/routes.js";
import searchRoutes from "./search/routes.js";
import sellerInfoRoutes from "./sellerInfo/routes.js";

const router = express.Router();

router.use('/brands', brandRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/search', searchRoutes);
router.use('/seller-info', sellerInfoRoutes);

export default router;
