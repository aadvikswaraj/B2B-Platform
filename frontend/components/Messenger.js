'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { AiOutlineSearch, AiOutlineDelete, AiOutlineStar, AiOutlineFolder } from 'react-icons/ai';
import { FiSend, FiArrowLeft, FiPaperclip } from 'react-icons/fi';

// Utility bubble component
function ChatBubble({ direction = 'incoming', message }) {
  const isOutgoing = direction === 'outgoing';
  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} mb-3`}>      
      <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm relative ${
        isOutgoing ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
      }`}>
        {message.text}
        <div className="mt-1 flex items-center justify-end space-x-1">
          <span className="text-[10px] opacity-70">{message.time}</span>
        </div>
      </div>
    </div>
  );
}

export default function Messenger() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState({}); // keyed by chat id
  const [showSidebar, setShowSidebar] = useState(true); // mobile toggle
  const messagesEndRef = useRef(null);

  // Sample chats (replace with real data)
  const chats = [
    { id: 1, company: 'ABC Trading Co.', avatar: 'https://placehold.co/100x100', lastMessage: 'Hello, I am interested in your products...', time: '10:30 AM', unread: 2, starred: false },
    { id: 2, company: 'Global Suppliers', avatar: 'https://placehold.co/100x100', lastMessage: 'Can you share the price list?', time: '09:15 AM', unread: 0, starred: true },
    { id: 3, company: 'Metro Wholesale', avatar: 'https://placehold.co/100x100', lastMessage: 'Shipment has been dispatched.', time: 'Yesterday', unread: 0, starred: false },
  ];

  const filteredChats = chats.filter(c => {
    if (filter === 'unread' && c.unread === 0) return false;
    if (filter === 'starred' && !c.starred) return false;
    if (search && !c.company.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  useEffect(() => {
    // Auto scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedChat]);

  const handleSend = () => {
    if (!message.trim() || !selectedChat) return;
    setMessages(prev => {
      const chatMsgs = prev[selectedChat.id] || [];
      return {
        ...prev,
        [selectedChat.id]: [...chatMsgs, { id: Date.now(), text: message.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), direction: 'outgoing' }]
      };
    });
    setMessage('');
    // Simulate response (demo)
    setTimeout(() => {
      setMessages(prev => {
        const chatMsgs = prev[selectedChat.id] || [];
        return {
          ...prev,
          [selectedChat.id]: [...chatMsgs, { id: Date.now() + 1, text: 'Thank you for your message. We will review and respond shortly.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), direction: 'incoming' }]
        };
      });
    }, 1500);
  };

  // Responsive layout: hide sidebar when chat opened on small screens
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  useEffect(() => {
    if (isMobile && selectedChat) {
      setShowSidebar(false);
    }
  }, [selectedChat, isMobile]);

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col md:flex-row bg-white border rounded-lg overflow-hidden shadow-sm">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out md:w-80 w-full md:border-r bg-white flex flex-col z-20 absolute md:static inset-0`}>        
        <div className="flex items-center justify-between px-4 py-3 border-b md:hidden">
          <h2 className="font-semibold text-gray-900">Chats</h2>
          {selectedChat && (
            <button onClick={() => setShowSidebar(false)} className="text-gray-500">
              <FiArrowLeft className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="px-4 py-3 space-y-3 border-b">
          <div className="relative">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search or start new chat" className="w-full bg-gray-100 pl-10 pr-3 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          <div className="flex space-x-2">
            {['all','unread','starred'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-xs font-medium capitalize border ${filter===f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y">
          {filteredChats.map(chat => (
            <button key={chat.id} onClick={() => { setSelectedChat(chat); if (isMobile) setShowSidebar(false); }} className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 relative ${selectedChat?.id === chat.id ? 'bg-blue-50' : ''}`}>
              <div className="relative mr-3">
                <Image src={chat.avatar} alt={chat.company} width={48} height={48} className="rounded-full object-cover" />
                {chat.unread > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{chat.unread}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-gray-900 truncate">{chat.company}</p>
                  <span className="text-[10px] text-gray-500 ml-2 flex-shrink-0">{chat.time}</span>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">{chat.lastMessage}</p>
              </div>
            </button>
          ))}
          {filteredChats.length === 0 && <div className="p-6 text-center text-sm text-gray-500">No chats found</div>}
        </div>
      </div>

      {/* Overlay for mobile when sidebar open */}
      {showSidebar && isMobile && <div onClick={() => setShowSidebar(false)} className="fixed inset-0 bg-black/30 z-10 md:hidden" />}

      {/* Chat area */}
      <div className="flex-1 flex flex-col relative">
        {!selectedChat && (
          <div className="flex-1 hidden md:flex items-center justify-center text-gray-400 text-sm">
            Select a chat to start messaging
          </div>
        )}
        {selectedChat && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <button onClick={() => setShowSidebar(true)} className="md:hidden text-gray-500">
                  <FiArrowLeft className="w-5 h-5" />
                </button>
                <Image src={selectedChat.avatar} alt={selectedChat.company} width={44} height={44} className="rounded-full" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{selectedChat.company}</p>
                  <p className="text-[11px] text-green-600 font-medium">Online</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="text-gray-500 hover:text-yellow-500" title="Star chat"><AiOutlineStar className="w-5 h-5" /></button>
                <button className="text-gray-500 hover:text-blue-600" title="Move to folder"><AiOutlineFolder className="w-5 h-5" /></button>
                <button className="text-gray-500 hover:text-red-600" title="Delete chat"><AiOutlineDelete className="w-5 h-5" /></button>
              </div>
            </div>
            {/* Messages scrollable area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50">
              <div className="space-y-1">
                {(messages[selectedChat.id] || [
                  { id: 'seed1', text: 'Hi, thanks for reaching out. How can we help you today?', time: '09:00 AM', direction: 'incoming' },
                  { id: 'seed2', text: 'I would like to know more about your bulk pricing tiers.', time: '09:02 AM', direction: 'outgoing' },
                ]).map(msg => (
                  <ChatBubble key={msg.id} direction={msg.direction} message={msg} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            {/* Input area */}
            <div className="border-t bg-white p-3">
              <div className="flex items-end space-x-2">
                <button className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100" title="Attach file"><FiPaperclip className="w-5 h-5" /></button>
                <div className="flex-1 relative">
                  <textarea value={message} onChange={e => setMessage(e.target.value)} rows={1} placeholder="Type a message" className="w-full max-h-36 overflow-y-auto rounded-2xl border border-gray-300 px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm" onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} />
                  <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                    <button onClick={handleSend} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-sm" aria-label="Send message">
                      <FiSend className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
