import express from "express";
import registrationRoutes from "./registration.js";
import requireLogin from "../../middleware/requireLogin.js";

const router = express.Router();

// Middleware: require seller login for all /seller routes
router.use(requireLogin);

// Registration routes
router.use('/registration', registrationRoutes);

export default router;