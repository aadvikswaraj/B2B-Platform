import express from "express";
import categoryRoutes from "./category/routes.js";
import userRoutes from "./users/routes.js";
import roleRoutes from "./roles/routes.js";
import sellerVerificationRoutes from "./sellerVerification/routes.js";
import productVerificationRoutes from "./productVerification/routes.js";
import brandVerificationRoutes from "./brandVerification/routes.js";
import buyRequirementRoutes from "./buyRequirement/routes.js";

const router = express.Router();

// Middleware: require admin login for all /admin routes
router.use((req, res, next) => {
    if (!res.locals.isLoggedIn || !req.user.isAdmin) {
        res.locals.response.success = false;
        res.locals.response.message = "Not authorized";
        res.send(res.locals.response);
    }
    else {
        next();
    };
});

router.get('/', (req, res) => {
    res.locals.response.message = "Welcome to Admin Panel";
    res.json(res.locals.response);
});

router.use('/category', categoryRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/seller-verification', sellerVerificationRoutes);
router.use('/product-verification', productVerificationRoutes);
router.use('/brand-verification', brandVerificationRoutes);
router.use('/buy-requirements', buyRequirementRoutes);

export default router;
