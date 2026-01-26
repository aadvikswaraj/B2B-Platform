"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/components/common/AuthProvider";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const auth = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const callbackRef = useRef(null);

  // Debug auth state
  useEffect(() => {
    console.log("[Socket] Auth state:", {
      loading: auth?.loading,
      loggedIn: auth?.loggedIn,
      user: auth?.user?.name || auth?.user?._id,
    });
  }, [auth?.loading, auth?.loggedIn, auth?.user]);

  // Initialize socket connection
  useEffect(() => {
    // Wait for auth to load
    if (auth?.loading) {
      console.log("[Socket] Auth still loading...");
      return;
    }

    // If not logged in, don't connect
    if (!auth?.loggedIn) {
      console.log("[Socket] User not logged in, skipping socket connection");
      return;
    }

    // Already connected
    if (socketRef.current?.connected) {
      console.log("[Socket] Already connected");
      return;
    }

    const url = process.env.NEXT_PUBLIC_API_URL;
    console.log("[Socket] Attempting connection to:", url);

    const socket = io(url, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket] Connected with ID:", socket.id);
      setConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
    });

    // Message events
    socket.on("new_message", (msg) => {
      console.log("[Socket] Received new_message:", msg);
      callbackRef.current?.({ type: "new_message", data: msg });
    });

    socket.on("message_sent", (res) => {
      console.log("[Socket] Message sent confirmation:", res);
      callbackRef.current?.({ type: "message_sent", data: res });
    });

    socket.on("message_error", (err) => {
      console.error("[Socket] Message error:", err);
      callbackRef.current?.({ type: "message_error", data: err });
    });

    socket.on("read_receipt", (data) => {
      console.log("[Socket] Read receipt:", data);
      callbackRef.current?.({ type: "read_receipt", data });
    });

    socket.on("user_connected", (data) => {
      console.log("[Socket] User connected event:", data);
    });

    // Cleanup
    return () => {
      console.log("[Socket] Cleaning up...");
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [auth.loading, auth.loggedIn]);

  // Socket methods
  const sendMessage = (conversationId, content, type = "text") => {
    const socket = socketRef.current;
    if (!socket?.connected) {
      console.warn("[Socket] Cannot send - not connected");
      return false;
    }
    console.log("[Socket] Sending message:", { conversationId, content, type });
    socket.emit("send_message", { conversationId, content, type });
    return true;
  };

  const joinConversation = (conversationId) => {
    const socket = socketRef.current;
    if (!socket?.connected) return;
    console.log("[Socket] Joining conversation:", conversationId);
    socket.emit("join_conversation", conversationId);
  };

  const leaveConversation = (conversationId) => {
    const socket = socketRef.current;
    if (!socket?.connected) return;
    console.log("[Socket] Leaving conversation:", conversationId);
    socket.emit("leave_conversation", conversationId);
  };

  const markRead = (conversationId) => {
    const socket = socketRef.current;
    if (!socket?.connected) return;
    socket.emit("mark_read", { conversationId });
  };

  const onUpdate = (callback) => {
    callbackRef.current = callback;
  };

  const offUpdate = () => {
    callbackRef.current = null;
  };

  const value = {
    connected,
    sendMessage,
    joinConversation,
    leaveConversation,
    markRead,
    onUpdate,
    offUpdate,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return ctx;
}
