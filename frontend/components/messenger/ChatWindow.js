"use client";

import React, { useEffect, useState, useRef, useContext } from "react";
import MessengerAPI from "../../utils/api/messenger";
import { useSocket } from "../../context/SocketContext";
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  StarIcon,
  EllipsisVerticalIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { AuthContext } from "../../context/context";
import { getAvatarColor } from "@/utils/avatarColor";

export default function ChatWindow({
  conversationId,
  conversation,
  onBack,
  onAction,
  mode = "buyer",
}) {
  const { user } = useContext(AuthContext);
  const userId = user?._id || user?.id;

  const [messages, setMessages] = useState([]);
  const [details, setDetails] = useState(conversation || null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);

  // Socket context
  const {
    connected,
    sendMessage,
    joinConversation,
    leaveConversation,
    onUpdate,
    offUpdate,
  } = useSocket();

  // Load messages and conversation details
  const loadData = async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const [msgsRes, convRes] = await Promise.all([
        MessengerAPI.messages(conversationId),
        MessengerAPI.conversation(conversationId),
      ]);
      if (msgsRes.success) setMessages(msgsRes.data);
      if (convRes.success) setDetails(convRes.data);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load data when conversation changes
  useEffect(() => {
    if (conversation) setDetails(conversation);
    loadData();
  }, [conversationId]);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket subscription
  useEffect(() => {
    if (!conversationId) return;

    // Join conversation room
    joinConversation(conversationId);

    // Listen for updates
    onUpdate((event) => {
      console.log("[ChatWindow] Socket event:", event);

      if (event.type === "new_message") {
        const msg = event.data;
        if (
          msg.conversation === conversationId ||
          msg.conversation?._id === conversationId
        ) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === msg._id)) return prev;
            return [...prev, msg];
          });
        }
      }

      if (event.type === "message_sent" && event.data?.success) {
        const msg = event.data.data;
        if (
          msg.conversation === conversationId ||
          msg.conversation?._id === conversationId
        ) {
          setMessages((prev) => {
            // Remove temp messages, add server message
            const filtered = prev.filter(
              (m) => !String(m._id).startsWith("temp_"),
            );
            if (filtered.some((m) => m._id === msg._id)) return filtered;
            return [...filtered, msg];
          });
        }
      }
    });

    return () => {
      leaveConversation(conversationId);
      offUpdate();
    };
  }, [conversationId]);

  // Send message handler
  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    // Create optimistic message
    const tempMsg = {
      _id: `temp_${Date.now()}`,
      content: text,
      sender: userId,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    setInput("");

    // Send via socket
    const sent = sendMessage(conversationId, text, "text");
    if (!sent) {
      console.error("Failed to send message - socket not connected");
    }
  };

  // Star toggle
  const toggleStar = async () => {
    const isStarred = details?.starred;
    try {
      const res = await MessengerAPI.updateMeta(conversationId, {
        starred: !isStarred,
      });
      if (res.success) {
        setDetails((prev) => ({ ...prev, starred: !isStarred }));
      }
    } catch (err) {
      console.error("Failed to toggle star:", err);
    }
  };

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const close = () => setShowMenu(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [showMenu]);

  // Loading state
  if (loading && !details) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Display name logic
  const displayName =
    mode === "buyer"
      ? details?.companyName || details?.name || "Unknown User"
      : details?.name || details?.companyName || "Unknown User";

  const avatarText = displayName[0]?.toUpperCase() || "?";
  const avatarBg = getAvatarColor(displayName);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="h-16 px-4 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="md:hidden text-gray-500">
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div
            className={`h-9 w-9 rounded-full flex items-center justify-center text-white font-bold ${!details?.avatar && !details?.logo ? avatarBg : "bg-gray-200"} overflow-hidden`}
          >
            {details?.avatar || details?.logo ? (
              <img
                src={details.avatar || details.logo}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{avatarText}</span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {displayName}
            </h3>
            {details?.context?.type === "inquiry" && (
              <span className="text-xs text-gray-500">Inquiry Link</span>
            )}
            {/* Connection status indicator */}
            <span
              className={`text-xs ${connected ? "text-green-500" : "text-red-500"}`}
            >
              {connected ? "● Connected" : "○ Disconnected"}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 relative">
          <button
            onClick={toggleStar}
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"
          >
            {details?.starred ? (
              <StarIconSolid className="h-5 w-5 text-yellow-400" />
            ) : (
              <StarIcon className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"
          >
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
              <button
                onClick={() => {
                  onAction?.("info");
                  setShowMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Contact Info
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
          const isMe = msg.sender?._id === userId || msg.sender === userId;
          return (
            <div
              key={msg._id || idx}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              {!isMe && (
                <div className="h-8 w-8 rounded-full bg-gray-300 flex-shrink-0 mr-2 self-end mb-1"></div>
              )}
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                  isMe
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-900 border border-gray-200 rounded-bl-none shadow-sm"
                }`}
              >
                <p>{msg.content}</p>
                <span
                  className={`text-[10px] mt-1 block opacity-70 ${isMe ? "text-right" : "text-left"}`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <PaperClipIcon className="h-5 w-5" />
          </button>
          <input
            type="text"
            className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
