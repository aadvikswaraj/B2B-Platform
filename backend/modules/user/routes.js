import express from "express";
import addressRoutes from "./address/routes.js";
import profileRoutes from "./profile/routes.js";
import fileRoutes from "./file/routes.js";
import paymentRoutes from "./payments/routes.js";

const router = express.Router();

router.use('/address', addressRoutes);
router.use('/profile', profileRoutes);
router.use('/file', fileRoutes);
router.use('/payments', paymentRoutes);

export default router;
