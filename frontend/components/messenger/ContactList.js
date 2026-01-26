"use client";

import React, { useEffect, useState } from "react";
import { getContacts } from "../../utils/api/messenger";
import { useSocket } from "../../context/SocketContext";
import { MagnifyingGlassIcon, StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

export default function ContactList({ onSelectConversation, selectedId }) {
  const [conversations, setConversations] = useState([]);
  const [filter, setFilter] = useState("all"); // all, unread, starred
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await getContacts(filter, search);
      if (res.success) {
        setConversations(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [filter, search]);

  useEffect(() => {
    if (socket) {
      socket.on("update_contact_list", (data) => {
        // Optimistic update or refresh
        // For simplicity, refresh
        fetchContacts();
      });
      return () => {
        socket.off("update_contact_list");
      };
    }
  }, [socket, filter, search]); // Re-bind if filter/search changes to keep current view correct or just refresh

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Messages</h2>

        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-2">
          {["all", "unread", "starred"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors
                ${
                  filter === f
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No conversations found
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {conversations.map((conv) => (
              <li
                key={conv._id}
                onClick={() => onSelectConversation(conv._id)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors relative
                  ${selectedId === conv._id ? "bg-blue-50" : ""}`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-sm">
                      {/* Fallback avatar */}
                      {conv.displayName?.[0]?.toUpperCase() || "?"}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3
                        className={`text-sm font-medium truncate ${conv.unreadCount > 0 ? "text-gray-900 font-bold" : "text-gray-900"}`}
                      >
                        {conv.displayName}
                        {conv.context?.type && (
                          <span className="ml-2 text-xs text-gray-500 font-normal bg-gray-100 px-1.5 py-0.5 rounded">
                            {conv.context.type}
                          </span>
                        )}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {conv.lastMessage
                          ? new Date(
                              conv.lastMessage.createdAt,
                            ).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                    <p
                      className={`text-sm truncate ${conv.unreadCount > 0 ? "text-gray-800 font-medium" : "text-gray-500"}`}
                    >
                      {conv.lastMessage?.content || "No messages yet"}
                    </p>
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute right-4 bottom-4 flex items-center space-x-2">
                  {conv.starred && (
                    <StarIconSolid className="h-4 w-4 text-yellow-400" />
                  )}
                  {conv.unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[1.25rem] text-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
