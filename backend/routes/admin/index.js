import express from "express";
import categoryRoutes from "./category.js";
import userRoutes from "./user.js";
import roleRoutes from "./roles.js";
const router = express.Router();

// Middleware: require admin login for all /admin routes
router.use((req, res, next) => {
	console.log("Admin route accessed by user:", req.user);
	if (!res.locals.isLoggedIn || !req.user.isAdmin) {
		res.locals.response.success = false;
		res.locals.response.message = "Not authorized";
		res.send(res.locals.response);
	}
	else{
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

export default router;