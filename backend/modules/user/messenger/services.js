import {
  Conversation,
  Message,
  User,
  BusinessProfile,
} from "../../../models/model.js";
import { generateReadUrl } from "../file/service.js";
import { ioInstance } from "../../../socket.js";

/**
 * Get contacts (conversations) list with filters
 */
export const getContactsService = async (
  userId,
  { filter = "all", search },
) => {
  let query = {
    "participants.user": userId,
  };

  if (filter === "unread") {
    query["participants"] = {
      $elemMatch: { user: userId, unreadCount: { $gt: 0 } },
    };
  } else if (filter === "starred") {
    query["participants"] = {
      $elemMatch: { user: userId, starred: true },
    };
  }

  // Search logic
  if (search) {
    const users = await User.find({
      name: { $regex: search, $options: "i" },
    }).select("_id");

    const profiles = await BusinessProfile.find({
      companyName: { $regex: search, $options: "i" },
    }).select("user");

    const userIds = [
      ...users.map((u) => u._id),
      ...profiles.map((p) => p.user),
    ];
    query["participants.user"] = { $in: userIds };
  }

  const conversations = await Conversation.find(query)
    .populate([
      {
        path: "participants.user",
        select: "name avatar businessProfile",
        populate: {
          path: "businessProfile",
          select: "companyName logo",
        },
      },
      {
        path: "lastMessage",
        populate: {
          path: "files",
          select: "url",
        },
      },
    ])
    .sort({ updatedAt: -1 })
    .lean();

  const formatted = await Promise.all(
    conversations.map(async (conv) => {
      const me = conv.participants.find(
        (p) => p.user && p.user._id.toString() === userId.toString(),
      );
      const other = conv.participants.find(
        (p) => p.user && p.user._id.toString() !== userId.toString(),
      );

      let name = "Yourself";
      let avatar = null;
      let companyName = "Yourself";
      let logo = null;

      if (other?.user) {
        name = other.user.name || "Yourself";
        const displayUser = name === "Yourself" ? me : other;
        avatar = displayUser.user.avatar
          ? (await generateReadUrl(displayUser.user.avatar)).url
          : null;
        companyName = displayUser.user.businessProfile?.companyName;
        logo = displayUser.user.businessProfile?.logo
          ? (await generateReadUrl(displayUser.user.businessProfile.logo)).url
          : null;
      }

      return {
        _id: conv._id,
        name,
        avatar,
        companyName,
        logo,
        lastMessage: conv.lastMessage,
        unreadCount: me?.unreadCount || 0,
        starred: me?.starred || false,
        muted: me?.muted || false,
        pinned: me?.pinned || false,
        tags: me?.tags || [],
        notes: me?.notes || "",
        updatedAt: conv.updatedAt,
        type: conv.type,
        context: conv.context,
      };
    }),
  );

  return formatted;
};

/**
 * Get conversation details
 */
export const getConversationService = async (conversationId, userId) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    "participants.user": userId,
  })
    .populate("participants.user", "name avatar businessProfile")
    .populate({
      path: "participants.user",
      populate: { path: "businessProfile", select: "companyName logo" },
    })
    .populate("lastMessage")
    .lean();

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  // Format the response to include other participant's info
  const me = conversation.participants.find(
    (p) => p.user?._id?.toString() === userId.toString(),
  );
  const other = conversation.participants.find(
    (p) => p.user?._id?.toString() !== userId.toString(),
  );

  return {
    ...conversation,
    name: other?.user?.name || "Unknown User",
    companyName: other?.user?.businessProfile?.companyName,
    avatar: other?.user?.avatar,
    logo: other?.user?.businessProfile?.logo,
    starred: me?.starred || false,
    muted: me?.muted || false,
    unreadCount: me?.unreadCount || 0,
  };
};

/**
 * Get messages for a conversation
 */
export const getMessagesService = async (
  conversationId,
  userId,
  { page = 1, limit = 50 },
) => {
  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "name avatar")
    .populate("files")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  // Reset unread count for this user
  await Conversation.updateOne(
    { _id: conversationId, "participants.user": userId },
    { $set: { "participants.$.unreadCount": 0 } },
  );

  // Emit read receipt to OTHER participants only (not the reader)
  if (ioInstance) {
    // Get other participants from conversation
    const conversation = await Conversation.findById(conversationId)
      .select("participants")
      .lean();
    if (conversation) {
      conversation.participants.forEach((p) => {
        if (p.user.toString() !== userId.toString()) {
          ioInstance.to(`user:${p.user}`).emit("read_receipt", {
            conversationId,
            userId,
          });
        }
      });
    }
  }

  return messages.reverse();
};

/**
 * Mark conversation as read
 */
export const markAsReadService = async (conversationId, userId) => {
  const updated = await Conversation.updateOne(
    { _id: conversationId, "participants.user": userId },
    { $set: { "participants.$.unreadCount": 0 } },
  );

  return updated;
};

/**
 * Send a message
 */
export const sendMessageService = async (
  userId,
  { conversationId, content, files, type = "text", metadata },
  io = null, // Optional io instance passed from socket handler
) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    "participants.user": userId,
  });

  if (!conversation) {
    throw new Error("Conversation not found or access denied");
  }

  const newMessage = await Message.create({
    conversation: conversationId,
    sender: userId,
    content,
    files: files || [],
    type,
    metadata,
  });

  await Conversation.updateOne(
    { _id: conversationId },
    {
      lastMessage: newMessage._id,
      $inc: { "participants.$[elem].unreadCount": 1 },
    },
    {
      arrayFilters: [{ "elem.user": { $ne: userId } }],
    },
  );

  await newMessage.populate("sender", "name avatar");
  await newMessage.populate("files");

  // Emit to OTHER participants only (not the sender)
  // Use user-specific rooms to exclude the sender
  const ioToUse = io || ioInstance;
  if (ioToUse) {
    // Get all participants except the sender
    conversation.participants.forEach((p) => {
      if (p.user.toString() !== userId.toString()) {
        ioToUse.to(`user:${p.user}`).emit("new_message", newMessage);
      }
    });
  }

  return newMessage;
};

/**
 * Update conversation meta
 */
export const updateConversationMetaService = async (
  conversationId,
  userId,
  { pinned, muted, tags, notes },
) => {
  const updateFields = {};
  if (pinned !== undefined) updateFields["participants.$.pinned"] = pinned;
  if (muted !== undefined) updateFields["participants.$.muted"] = muted;
  if (tags !== undefined) updateFields["participants.$.tags"] = tags;
  if (notes !== undefined) updateFields["participants.$.notes"] = notes;

  const updated = await Conversation.findOneAndUpdate(
    { _id: conversationId, "participants.user": userId },
    { $set: updateFields },
    { new: true },
  );

  if (!updated) {
    throw new Error("Conversation not found or access denied");
  }

  return updated;
};

/**
 * Start conversation
 */
export const startConversationService = async (
  userId,
  { targetUserId, context, initialMessage },
) => {
  let query = {
    "participants.user": { $all: [userId, targetUserId] },
    type: "direct",
  };

  if (context) {
    query["context.type"] = context.type;
    query["context.id"] = context.id;
  } else {
    query["context"] = { $exists: false };
  }

  let conversation = await Conversation.findOne(query);

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [
        { user: userId, unreadCount: 0 },
        { user: targetUserId, unreadCount: 1 },
      ],
      type: "direct",
      context: context,
    });
  }

  if (initialMessage) {
    const msg = await Message.create({
      conversation: conversation._id,
      sender: userId,
      content: initialMessage,
    });
    conversation.lastMessage = msg._id;
    await conversation.save();
  }

  return conversation;
};
