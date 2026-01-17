import express from "express";
import brandRoutes from "./brands/routes.js";
import productRoutes from "./products/routes.js";
import registrationRoutes from "./registration/routes.js";
import inquiryRoutes from "./inquiry/routes.js";

const router = express.Router();

router.use('/brands', brandRoutes);
router.use('/products', productRoutes);
router.use('/registration', registrationRoutes);
router.use('/inquiry', inquiryRoutes);

export default router;
