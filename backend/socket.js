import { sendMessageService } from "./modules/user/messenger/services.js";
import { Conversation } from "./models/model.js";

// Store io instance for use in services
export let ioInstance = null;

export const registerSocketHandlers = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    const session = socket.request.session;

    const userId = session?.user?._id;

    if (!userId) {
      socket.disconnect(true);
      return;
    }

    // Join user-specific room
    socket.join(`user:${userId}`);
    console.log("[Socket] Connected:", socket.id, "User:", userId);

    socket.emit("user_connected", { success: true, userId });

    // Join conversation room
    socket.on("join_conversation", (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    // Leave conversation room
    socket.on("leave_conversation", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Send message
    socket.on("send_message", async (payload) => {
      try {
        const { conversationId, content, type } = payload;

        if (!conversationId || !content) {
          throw new Error("Missing conversationId or content");
        }

        // Save message to DB and emit to other participants
        const message = await sendMessageService(userId, {
          conversationId,
          content,
          type,
        });

        // Confirm to sender
        socket.emit("message_sent", { success: true, data: message });
        console.log("[Socket] Message saved and sent confirmation to sender");
      } catch (err) {
        console.error("[Socket] send_message error:", err.message);
        socket.emit("message_error", { success: false, error: err.message });
      }
    });

    // Mark as read
    socket.on("mark_read", async ({ conversationId }) => {
      try {
        const conversation = await Conversation.findById(conversationId)
          .select("participants")
          .lean();

        if (conversation) {
          // Emit to other participants only
          conversation.participants.forEach((p) => {
            if (p.user.toString() !== userId.toString()) {
              io.to(`user:${p.user}`).emit("read_receipt", {
                conversationId,
                userId,
                readAt: new Date(),
              });
            }
          });
        }
      } catch (err) {
        console.error("[Socket] mark_read error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("[Socket] Disconnected:", socket.id);
    });
  });
};
