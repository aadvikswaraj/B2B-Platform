import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import requireAuthentication from "../../../middleware/requireAuthentication.js";
import { validateRequest } from "../../../utils/customValidators.js";

const router = express.Router();

// Get cart item count
router.get("/count", requireAuthentication, controller.getCartCount);

// Get cart
router.get("/", requireAuthentication, controller.getCart);

// Add to cart
router.post(
  "/",
  requireAuthentication,
  validateRequest(validator.addToCartSchema),
  controller.addToCart
);

// Update item quantity
router.put(
  "/:productId",
  requireAuthentication,
  validateRequest(validator.updateQuantitySchema),
  controller.updateQuantity
);

// Remove item from cart
router.delete("/:productId", requireAuthentication, controller.removeFromCart);

// Clear cart
router.delete("/", requireAuthentication, controller.clearCart);

export default router;