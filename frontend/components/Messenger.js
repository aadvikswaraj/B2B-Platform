'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  AiOutlineSearch, 
  AiOutlineDelete,
  AiOutlineStar,
  AiOutlineFolder
} from 'react-icons/ai';
export default function Messenger() {
  const [selectedChat, setSelectedChat] = useState(null);
  
  // Sample data - replace with actual data
  const chats = [
    {
      id: 1,
      company: 'ABC Trading Co.',
      avatar: 'https://placehold.co/100',
      lastMessage: 'Hello, I am interested in your products...',
      time: '10:30 AM',
      unread: 2,
    },
    // Add more chat items here
  ];

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-white rounded-lg shadow-sm">
      {/* Left Sidebar */}
      <div className="w-80 border-r flex flex-col">
        <h1 className="text-xl font-semibold text-gray-900 px-2.5 py-2.5">Message Center</h1>
        {/* Search and Filter */}
        <div className="px-2.5 border-b">
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-1.5 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Folders */}
        <div className="px-2.5">
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm rounded-full bg-blue-50 text-blue-600">All</button>
            <button className="px-3 py-1 text-sm rounded-full text-gray-600 hover:bg-gray-50">Unread</button>
            <button className="px-3 py-1 text-sm rounded-full text-gray-600 hover:bg-gray-50">Starred</button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 border-b
                ${selectedChat?.id === chat.id ? 'bg-blue-50' : ''}`}
            >
              <div className="relative">
                <Image
                unoptimized
                  src={chat.avatar}
                  alt={chat.company}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                {chat.unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                    {chat.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-900">{chat.company}</h4>
                  <span className="text-xs text-gray-500">{chat.time}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{chat.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Image
                  src={selectedChat.avatar}
                  alt={selectedChat.company}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{selectedChat.company}</h3>
                  <span className="text-sm text-gray-500">Online</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="text-gray-600 hover:text-blue-600">
                  <AiOutlineStar className="w-5 h-5" />
                </button>
                <button className="text-gray-600 hover:text-blue-600">
                  <AiOutlineFolder className="w-5 h-5" />
                </button>
                <button className="text-gray-600 hover:text-red-600">
                  <AiOutlineDelete className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Add messages here */}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-end space-x-3">
                <textarea
                  placeholder="Type your message..."
                  rows="3"
                  className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
