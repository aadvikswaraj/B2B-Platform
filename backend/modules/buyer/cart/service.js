import { Cart, Product } from "../../../models/model.js";
import { generateReadUrl } from "../../user/file/service.js";

/**
 * Get or create cart for user
 */
export const getOrCreateCart = async (userId) => {
  let doc = await Cart.findOne({ user: userId })
    .populate({
      path: "items.product",
      select:
        "title price images minOrderQuantity status isApproved seller brand category support",
      populate: [
        { path: "seller", select: "name email phone" },
        { path: "brand", select: "name" },
        { path: "category", select: "name" },
      ],
    })
    .lean();

  if (!doc) {
    doc = await Cart.create({ user: userId, items: [] });
    doc = await Cart.findById(doc._id)
      .populate({
        path: "items.product",
        select:
          "title price images minOrderQuantity status isApproved seller brand category support",
        populate: [
          { path: "seller", select: "name email phone" },
          { path: "brand", select: "name" },
          { path: "category", select: "name" },
        ],
      })
      .lean();
  }

  await Promise.all(
    doc.items.map(async (item) => {
      try {
        item.product.image = item.product.images?.length
          ? (await generateReadUrl(item.product.images[0])).url
          : null;
      } catch {
        item.product.image = null;
      }
      return item;
    }),
  );
  return doc;
};

/**
 * Add item to cart or update quantity if exists
 */
export const addToCart = async (userId, productId, quantity) => {
  // Verify product exists and is active
  const product = await Product.findById(productId)
    .select("moderation isActive minOrderQuantity")
    .lean();

  if (!product) {
    throw new Error("Product not found");
  }
  if (product.moderation.status !== "approved" || !product.isActive) {
    throw new Error("Product is not available for purchase");
  }

  if (quantity < product.minOrderQuantity) {
    throw new Error(`Minimum order quantity is ${product.minOrderQuantity}`);
  }

  let doc = await Cart.findOne({ user: userId });

  if (!doc) {
    doc = await Cart.create({
      user: userId,
      items: [{ product: productId, quantity, addedAt: new Date() }],
    });
  } else {
    const existingItemIndex = doc.items.findIndex(
      (item) => item.product.toString() === productId.toString(),
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      doc.items[existingItemIndex].quantity = quantity;
    } else {
      // Add new item
      doc.items.push({ product: productId, quantity, addedAt: new Date() });
    }

    await doc.save();
  }

  // Return populated cart
  let doc2 = await Cart.findById(doc._id)
    .populate({
      path: "items.product",
      select:
        "title price images minOrderQuantity moderation isActive seller brand category support",
      populate: [
        { path: "seller", select: "name email phone" },
        { path: "brand", select: "name" },
        { path: "category", select: "name" },
      ],
    })
    .lean();

  await Promise.all(
    doc2.items.map(async (item) => {
      try {
        item.product.image = item.product.images?.length
          ? (await generateReadUrl(item.product.images[0])).url
          : null;
      } catch {
        item.product.image = null;
      }
      return item;
    }),
  );

  return doc2;
};

/**
 * Update item quantity in cart
 */
export const updateQuantity = async (userId, productId, quantity) => {
  const doc = await Cart.findOne({ user: userId });

  if (!doc) {
    throw new Error("Cart not found");
  }

  const itemIndex = doc.items.findIndex(
    (item) => item.product.toString() === productId.toString(),
  );

  if (itemIndex === -1) {
    throw new Error("Product not found in cart");
  }

  // Verify product still available
  const product = await Product.findById(productId)
    .select("moderation isActive minOrderQuantity")
    .lean();

  if (
    !product ||
    product.moderation.status !== "approved" ||
    !product.isActive
  ) {
    throw new Error("Product is no longer available");
  }

  if (quantity < product.minOrderQuantity) {
    throw new Error(`Minimum order quantity is ${product.minOrderQuantity}`);
  }

  doc.items[itemIndex].quantity = quantity;
  await doc.save();

  let doc2 = await Cart.findById(doc._id)
    .populate({
      path: "items.product",
      select:
        "title price images minOrderQuantity moderation isActive seller brand category support",
      populate: [
        { path: "seller", select: "name email phone" },
        { path: "brand", select: "name" },
        { path: "category", select: "name" },
      ],
    })
    .lean();
  await Promise.all(
    doc2.items.map(async (item) => {
      try {
        item.product.image = item.product.images?.length
          ? (await generateReadUrl(item.product.images[0])).url
          : null;
      } catch {
        item.product.image = null;
      }
      return item;
    }),
  );

  return doc2;
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
    (item) => item.product.toString() !== productId.toString(),
  );

  await cart.save();

  let doc = await Cart.findById(cart._id)
    .populate({
      path: "items.product",
      select:
        "title price images minOrderQuantity moderation isActive seller brand category support",
      populate: [
        { path: "seller", select: "name email phone" },
        { path: "brand", select: "name" },
        { path: "category", select: "name" },
      ],
    })
    .lean();

  await Promise.all(
    doc.items.map(async (item) => {
      try {
        item.product.image = item.product.images?.length
          ? (await generateReadUrl(item.product.images[0])).url
          : null;
      } catch {
        item.product.image = null;
      }
      return item;
    }),
  );

  return doc;
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
