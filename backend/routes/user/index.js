import express from "express";
import addressRoutes from "./address.js";
import userProfileRoutes from "./profile.js";
import requireLogin from "../../middleware/requireLogin.js";

const router = express.Router();

// Middleware: require user login for all /user routes
router.use(requireLogin);

// Address routes
router.use('/address', addressRoutes);
router.use('/profile', userProfileRoutes);

export default router;