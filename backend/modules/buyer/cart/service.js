import { Cart, Product } from "../../../models/model.js";

/**
 * Get or create cart for user
 */
export const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId })
    .populate({
      path: "items.product",
      select: "title price images minOrderQuantity status isApproved seller brand category",
      populate: [
        { path: "seller", select: "name email phone" },
        { path: "brand", select: "name" },
        { path: "category", select: "name" },
      ],
    })
    .lean();

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await Cart.findById(cart._id)
      .populate({
        path: "items.product",
        select: "title price images minOrderQuantity status isApproved seller brand category",
        populate: [
          { path: "seller", select: "name email phone" },
          { path: "brand", select: "name" },
          { path: "category", select: "name" },
        ],
      })
      .lean();
  }

  return cart;
};

/**
 * Add item to cart or update quantity if exists
 */
export const addToCart = async (userId, productId, quantity) => {
  // Verify product exists and is active
  const product = await Product.findById(productId)
    .select("status isApproved minOrderQuantity")
    .lean();

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.status !== "active" || !product.isApproved) {
    throw new Error("Product is not available for purchase");
  }

  if (quantity < product.minOrderQuantity) {
    throw new Error(
      `Minimum order quantity is ${product.minOrderQuantity}`
    );
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [{ product: productId, quantity, addedAt: new Date() }],
    });
  } else {
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity = quantity;
    } else {
      // Add new item
      cart.items.push({ product: productId, quantity, addedAt: new Date() });
    }

    await cart.save();
  }

  // Return populated cart
  return await Cart.findById(cart._id)
    .populate({
      path: "items.product",
      select: "title price images minOrderQuantity status isApproved seller brand category",
      populate: [
        { path: "seller", select: "name email phone" },
        { path: "brand", select: "name" },
        { path: "category", select: "name" },
      ],
    })
    .lean();
};

/**
 * Update item quantity in cart
 */
export const updateQuantity = async (userId, productId, quantity) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new Error("Cart not found");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId.toString()
  );

  if (itemIndex === -1) {
    throw new Error("Product not found in cart");
  }

  // Verify product still available
  const product = await Product.findById(productId)
    .select("status isApproved minOrderQuantity")
    .lean();

  if (!product || product.status !== "active" || !product.isApproved) {
    throw new Error("Product is no longer available");
  }

  if (quantity < product.minOrderQuantity) {
    throw new Error(
      `Minimum order quantity is ${product.minOrderQuantity}`
    );
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();

  return await Cart.findById(cart._id)
    .populate({
      path: "items.product",
      select: "title price images minOrderQuantity status isApproved seller brand category",
      populate: [
        { path: "seller", select: "name email phone" },
        { path: "brand", select: "name" },
        { path: "category", select: "name" },
      ],
    })
    .lean();
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new Error("Cart not found");
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId.toString()
  );

  await cart.save();

  return await Cart.findById(cart._id)
    .populate({
      path: "items.product",
      select: "title price images minOrderQuantity status isApproved seller brand category",
      populate: [
        { path: "seller", select: "name email phone" },
        { path: "brand", select: "name" },
        { path: "category", select: "name" },
      ],
    })
    .lean();
};

/**
 * Clear entire cart
 */
export const clearCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new Error("Cart not found");
  }

  cart.items = [];
  await cart.save();

  return cart;
};

/**
 * Get cart item count
 */
export const getCartCount = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).select("items").lean();
  return cart ? cart.items.length : 0;
};
