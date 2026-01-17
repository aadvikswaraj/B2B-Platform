import * as cartService from "./service.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";

// Helper to calculate price based on quantity (supports slabs)
const getPriceForQuantity = (product, quantity) => {
  if (!product || !product.price) return 0;
  if (product.price.type === 'single') {
    return product.price.singlePrice || 0;
  } else if (product.price.type === 'slab') {
    const slabs = product.price.slabs || [];
    if (!slabs.length) return 0;
    // Sort slabs by minQuantity DESC
    const sorted = [...slabs].sort((a, b) => b.minQuantity - a.minQuantity);
    const match = sorted.find(s => quantity >= s.minQuantity);
    return match ? match.price : (sorted[sorted.length - 1].price || 0);
  }
  return 0;
};

/**
 * Get cart
 */
export const getCart = async (req, res) => {
  try {
    const cart = await cartService.getOrCreateCart(req.user._id);

    // Calculate totals
    let subtotal = 0;
    let itemCount = 0;

    if (cart.items && cart.items.length > 0) {
      cart.items.forEach((item) => {
        if (item.product) {
          const unitPrice = getPriceForQuantity(item.product, item.quantity);
          subtotal += unitPrice * item.quantity;
          itemCount += item.quantity;
          // Attach unit price to item for frontend display
          item.unitPrice = unitPrice; 
        }
      });
    }

    res.locals.response = {
      success: true,
      data: {
        cart,
        summary: {
          itemCount,
          subtotal,
          currency: "INR",
        },
      },
      status: 200,
    };
  } catch (error) {
    console.error("Error in getCart:", error);
    res.locals.response = {
      success: false,
      message: error.message || "Failed to fetch cart",
      status: 500,
    };
  }
  return sendResponse(res);
};

/**
 * Add item to cart
 */
export const addToCart = async (req, res) => {
  try {
    const { product, quantity } = req.body;

    const cart = await cartService.addToCart(req.user._id, product, quantity);

    // Calculate totals
    let subtotal = 0;
    let itemCount = 0;

    if (cart.items && cart.items.length > 0) {
      cart.items.forEach((item) => {
        if (item.product) {
          const unitPrice = getPriceForQuantity(item.product, item.quantity);
          subtotal += unitPrice * item.quantity;
          itemCount += item.quantity;
        }
      });
    }

    res.locals.response = {
      success: true,
      message: "Product added to cart",
      status: 200,
      data: {
        cart,
        summary: {
          itemCount,
          subtotal,
          currency: "INR",
        },
      },
    };
  } catch (error) {
    console.error("Error in addToCart:", error);
    const status =
      error.message === "Product not found"
        ? 404
        : error.message.includes("not available") ||
          error.message.includes("Minimum order")
        ? 400
        : 500;

    res.locals.response = {
      success: false,
      message: error.message || "Failed to add to cart",
      status,
    };
  }
  return sendResponse(res);
};

/**
 * Update item quantity
 */
export const updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await cartService.updateQuantity(
      req.user._id,
      productId,
      quantity
    );

    // Calculate totals
    let subtotal = 0;
    let itemCount = 0;

    if (cart.items && cart.items.length > 0) {
      cart.items.forEach((item) => {
        if (item.product) {
          const unitPrice = getPriceForQuantity(item.product, item.quantity);
          subtotal += unitPrice * item.quantity;
          itemCount += item.quantity;
        }
      });
    }

    res.locals.response = {
      success: true,
      message: "Cart updated",
      status: 200,
      data: {
        cart,
        summary: {
          itemCount,
          subtotal,
          currency: "INR",
        },
      },
    };
  } catch (error) {
    console.error("Error in updateQuantity:", error);
    const status =
      error.message === "Cart not found" ||
      error.message === "Product not found in cart"
        ? 404
        : error.message.includes("not available") ||
          error.message.includes("Minimum order")
        ? 400
        : 500;

    res.locals.response = {
      success: false,
      message: error.message || "Failed to update cart",
      status,
    };
  }
  return sendResponse(res);
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await cartService.removeFromCart(req.user._id, productId);

    // Calculate totals
    let subtotal = 0;
    let itemCount = 0;

    if (cart.items && cart.items.length > 0) {
      cart.items.forEach((item) => {
        if (item.product) {
          subtotal += item.product.price * item.quantity;
          itemCount += item.quantity;
        }
      });
    }

    res.locals.response = {
      success: true,
      message: "Product removed from cart",
      status: 200,
      data: {
        cart,
        summary: {
          itemCount,
          subtotal,
          currency: "INR",
        },
      },
    };
  } catch (error) {
    console.error("Error in removeFromCart:", error);
    res.locals.response = {
      success: false,
      message: error.message || "Failed to remove from cart",
      status: error.message === "Cart not found" ? 404 : 500,
    };
  }
  return sendResponse(res);
};

/**
 * Clear cart
 */
export const clearCart = async (req, res) => {
  try {
    await cartService.clearCart(req.user._id);

    res.locals.response = {
      success: true,
      message: "Cart cleared",
      status: 200,
    };
  } catch (error) {
    console.error("Error in clearCart:", error);
    res.locals.response = {
      success: false,
      message: error.message || "Failed to clear cart",
      status: error.message === "Cart not found" ? 404 : 500,
    };
  }
  return sendResponse(res);
};

/**
 * Get cart item count
 */
export const getCartCount = async (req, res) => {
  try {
    const count = await cartService.getCartCount(req.user._id);

    res.locals.response = {
      success: true,
      data: { count },
      status: 200,
    };
  } catch (error) {
    console.error("Error in getCartCount:", error);
    res.locals.response = {
      success: false,
      message: error.message || "Failed to get cart count",
      status: 500,
    };
  }
  return sendResponse(res);
};
