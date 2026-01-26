import {
  Inquiry,
  Product,
  BuyRequirement,
  Conversation,
  Message,
} from "../../../models/model.js";
import { io } from "../../../app.js";

/**
 * Create new inquiry
 */
export const create = async (data) => {
  // Get product details to extract seller
  const product = await Product.findById(data.product).select("seller").lean();

  if (!product) {
    throw new Error("Product not found");
  }

  const inquiry = await Inquiry.create({
    ...data,
    seller: product.seller,
  });

  let conversation = await Conversation.findOne({
    "participants.user": {
      $all: [data.user, inquiry.seller],
    },
  }).lean();

  if (!conversation) {
    // Create conversation for this inquiry
    conversation = await Conversation.create({
      participants: [
        { user: data.user, unreadCount: 0 },
        { user: inquiry.seller, unreadCount: 1 },
      ],
      context: {
        type: "inquiry",
        inquiry: inquiry._id,
      },
    });
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: data.user,
    context: {
      type: "inquiry",
      inquiry: inquiry._id,
    },
  });

  await Conversation.updateOne(
    { _id: conversation._id },
    { lastMessage: message._id },
  );

  if (io) {
    io.to(`user:${data.user}`).emit("update_contact_list", {
      conversationId: conversation._id,
      lastMessage: message,
    });
    io.to(`user:${data.user}`).emit("new_message", message);
  }
  return inquiry;
};

// list function removed

/**
 * Get inquiry by ID for a specific user
 */
export const getById = async (id, userId) => {
  return await Inquiry.findOne({ _id: id, user: userId })
    .populate("product", "title price images")
    .populate("seller", "name email phone")
    .populate("buyRequirement", "productName status verification")
    .lean();
};

/**
 * Update fulfillment status and optionally create buy requirement
 */
export const updateFulfillment = async (id, userId, requirementFulfilled) => {
  const inquiry = await Inquiry.findOne({ _id: id, user: userId });

  if (!inquiry) {
    throw new Error("Inquiry not found");
  }

  // Update fulfillment status
  inquiry.requirementFulfilled = requirementFulfilled;
  inquiry.fulfilledAt = requirementFulfilled ? new Date() : null;

  // If marking as NOT fulfilled and no buy requirement exists, create one
  if (!requirementFulfilled && !inquiry.buyRequirement) {
    const buyReq = await BuyRequirement.create({
      user: userId,
      productName: inquiry.productName,
      description: `Generated from inquiry for ${inquiry.productName}. Original inquiry: ${inquiry.message || "N/A"}`,
      quantity: inquiry.quantity,
      unit: inquiry.unit,
      generatedByInquiry: true,
      inquiry: inquiry._id,
      status: "active",
      verification: {
        status: "pending",
      },
    });

    inquiry.buyRequirement = buyReq._id;
  }

  await inquiry.save();

  return await Inquiry.findById(id)
    .populate("product", "title price images")
    .populate("seller", "name email phone")
    .populate("buyRequirement", "productName status verification")
    .lean();
};

/**
 * Count inquiries by user
 */
export const countByUser = async (userId) => {
  return await Inquiry.countDocuments({ user: userId });
};
