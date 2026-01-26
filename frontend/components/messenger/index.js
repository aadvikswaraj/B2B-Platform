"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import ContactInfoPanel from "./ContactInfoPanel";
import MessengerAPI from "@/utils/api/messenger";
import { useAlert } from "../ui/AlertManager";
import { SocketProvider, useSocket } from "@/context/SocketContext";

// Wrapper component that provides the SocketProvider
export default function Messenger({ mode = "buyer", className }) {
  return (
    <SocketProvider>
      <MessengerContent mode={mode} className={className} />
    </SocketProvider>
  );
}

// Inner component that actually uses the socket context
function MessengerContent({ mode, className }) {
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);

  const [selectedConversation, setSelectedConversation] = useState(null);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const pushAlert = useAlert();
  const { onUpdate, offUpdate } = useSocket();

  useEffect(() => {
    onUpdate(({ type, data }) => {
      if (type === "new_message") {
        console.log("[Messenger] New message:", data);
        // Could refresh contacts here to update last message preview
      } else if (type === "read_receipt") {
        console.log("[Messenger] Read receipt:", data);
      }
    });
    return () => offUpdate();
  }, []);

  useEffect(() => {
    async function fetchConversations() {
      try {
        setConversationsLoading(true);
        const response = await MessengerAPI.contacts({
          filter,
          search,
        });
        if (!response.success) {
          throw new Error(response.message);
        } else {
          setConversations(response.data);
        }
      } catch (error) {
        pushAlert("error", error.message || "Failed to load conversations");
      } finally {
        setConversationsLoading(false);
      }
    }
    fetchConversations();
  }, [filter, search]);

  // No need to fetch messages here, ChatWindow handles it
  // No need to fetch messages here, ChatWindow handles it

  const [showInfoPanel, setShowInfoPanel] = useState(false);

  // Mobile View State
  const [mobileView, setMobileView] = useState("list"); // 'list' | 'chat'

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMobileView("chat");

    // Mark as read logic would go here
    if (conversation.unreadCount > 0) {
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversation._id ? { ...c, unreadCount: 0 } : c,
        ),
      );
    }
  };

  // Message sending is handled inside ChatWindow

  const handleAction = (action, chat) => {
    if (action === "star") {
      setConversations((prev) =>
        prev.map((c) =>
          c._id === chat._id ? { ...c, starred: !c.starred } : c,
        ),
      );
    } else if (action === "info") {
      setSelectedConversation(chat);
      setShowInfoPanel(true);
    }
    // ... handle other actions
  };

  const handleBackToChats = () => {
    setMobileView("list");
    setSelectedConversation(null);
  };

  const handleUpdateContact = (updatedContact) => {
    setConversations((prev) =>
      prev.map((c) => (c._id === updatedContact._id ? updatedContact : c)),
    );
    if (selectedConversation?._id === updatedContact._id) {
      setSelectedConversation(updatedContact);
    }
  };

  return (
    <div
      className={`flex h-full w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative ${className}`}
    >
      {/* Sidebar - Hidden on mobile if viewing chat */}
      <div
        className={`w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col transition-all duration-300 border-r border-gray-200 ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}
      >
        <Sidebar
          contacts={conversations}
          loading={conversationsLoading}
          selectedChatId={selectedConversation?._id}
          onSelectChat={handleSelectConversation}
          onAction={handleAction}
          filter={filter}
          setFilter={setFilter}
          search={search}
          setSearch={setSearch}
          mode={mode}
        />
      </div>

      {/* Main Chat Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 bg-white relative transition-all duration-300 ${mobileView === "list" ? "hidden md:flex" : "flex"}`}
      >
        {selectedConversation ? (
          <ChatWindow
            conversationId={selectedConversation._id}
            conversation={selectedConversation}
            onBack={handleBackToChats}
            onAction={(action) => handleAction(action, selectedConversation)}
            mode={mode}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation to start messaging
          </div>
        )}

        {/* Info Panel Overlay (Desktop: slide in, Mobile: check design) */}
        {/* For desktop, we can have it side-by-side if enough space, or overlay */}
        {/* Implementing as overlay on right side for now */}
        <ContactInfoPanel
          contact={selectedConversation}
          isOpen={showInfoPanel && selectedConversation}
          onClose={() => setShowInfoPanel(false)}
          mode={mode}
          onUpdateContact={handleUpdateContact}
        />
      </div>
    </div>
  );
}
