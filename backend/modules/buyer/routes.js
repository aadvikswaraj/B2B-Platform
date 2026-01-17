import express from "express";
import buyRequirementRoutes from "./buyRequirement/routes.js";
import inquiryRoutes from "./inquiry/routes.js";
import cartRoutes from "./cart/routes.js";
import orderRoutes from "./order/routes.js";

const router = express.Router();

router.use('/buy-requirement', buyRequirementRoutes);
router.use('/inquiry', inquiryRoutes);
router.use('/cart', cartRoutes);
router.use('/order', orderRoutes);

export default router;
