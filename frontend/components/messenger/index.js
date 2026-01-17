'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import ContactInfoPanel from './ContactInfoPanel';

// Mock Data
const MOCK_CHATS = [
    { 
        id: 1, 
        company: 'ABC Trading Co.', 
        avatar: 'https://placehold.co/100x100', // In production, use real images
        lastMessage: 'Hello, I am interested in your products...', 
        time: '10:30 AM', 
        unread: 2, 
        starred: false,
        online: true,
        email: 'contact@abctrading.com',
        phone: '+1 (555) 123-4567',
        address: '123 Market St, San Francisco, CA',
        bio: 'Leading distributor of consumer electronics.',
        tags: ['Distributor', 'High Volume'] 
    },
    { 
        id: 2, 
        company: 'Global Suppliers', 
        avatar: 'https://placehold.co/100x100?text=GS', 
        lastMessage: 'Can you share the price list?', 
        time: '09:15 AM', 
        unread: 0, 
        starred: true,
        online: false,
        lastSeen: '2 hours ago',
        email: 'sales@globalsuppliers.com',
        phone: '+1 (555) 987-6543',
        address: '456 Industrial Park, New York, NY',
        tags: ['Supplier', 'Raw Materials']
    },
    { 
        id: 3, 
        company: 'Metro Wholesale', 
        avatar: 'https://placehold.co/100x100?text=MW', 
        lastMessage: 'Shipment has been dispatched.', 
        time: 'Yesterday', 
        unread: 0, 
        starred: false,
        online: true,
        email: 'logistics@metrowholesale.com',
        phone: '+1 (555) 555-5555',
        tags: ['Logistics', 'Partner']
    },
];

const MOCK_MESSAGES = {
    1: [
        { id: 1, text: 'Hi, thanks for reaching out. How can we help you today?', time: '09:00 AM', direction: 'incoming', status: 'read' },
        { id: 2, text: 'I would like to know more about your bulk pricing tiers.', time: '09:02 AM', direction: 'outgoing', status: 'read' },
        { id: 3, text: 'Sure! We offer discounts for orders over 500 units.', time: '09:05 AM', direction: 'incoming', status: 'read' },
    ],
    2: [
        { id: 1, text: 'Can you share the price list?', time: '09:15 AM', direction: 'incoming', status: 'delivered' },
    ],
    3: [
        { id: 1, text: 'Shipment has been dispatched.', time: 'Yesterday', direction: 'incoming', status: 'read' },
    ]
};

export default function Messenger() {
    const [chats, setChats] = useState(MOCK_CHATS);
    const [messages, setMessages] = useState(MOCK_MESSAGES);
    const [selectedChat, setSelectedChat] = useState(null);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    
    // Mobile View State
    const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'

    // Derived state for filtering
    const filteredChats = chats.filter(chat => {
        if (filter === 'unread' && chat.unread === 0) return false;
        if (filter === 'starred' && !chat.starred) return false;
        if (search && !chat.company.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
        setMobileView('chat');
        // Mark as read logic would go here
        if (chat.unread > 0) {
            setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
        }
    };

    const handleSendMessage = (text) => {
        if (!selectedChat) return;
        
        const newMessage = {
            id: Date.now(),
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            direction: 'outgoing',
            status: 'sent'
        };

        setMessages(prev => ({
            ...prev,
            [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage]
        }));

        // Move chat to top
        setChats(prev => {
           const others = prev.filter(c => c.id !== selectedChat.id);
           return [{ ...selectedChat, lastMessage: text, time: newMessage.time }, ...others];
        });

        // Simulate reply
        setTimeout(() => {
            const reply = {
                id: Date.now() + 1,
                text: 'Thanks for your message! This is an auto-reply.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                direction: 'incoming',
                status: 'read'
            };
            setMessages(prev => ({
                ...prev,
                [selectedChat.id]: [...(prev[selectedChat.id] || []), reply]
            }));
             setChats(prev => {
                 return prev.map(c => c.id === selectedChat.id ? { ...c, lastMessage: reply.text, time: reply.time, unread: 1 } : c);
             });
        }, 2000);
    };

    const handleAction = (action, chat) => {
        console.log('Action:', action, chat);
        if (action === 'star') {
            setChats(prev => prev.map(c => c.id === chat.id ? { ...c, starred: !c.starred } : c));
        } else if (action === 'info') {
             setSelectedChat(chat);
             setShowInfoPanel(true);
        }
        // ... handle other actions
    };

    const handleBackToChats = () => {
        setMobileView('list');
        setSelectedChat(null);
    };

    return (
        <div className="flex h-full w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
            {/* Sidebar - Hidden on mobile if viewing chat */}
            <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col transition-all duration-300 border-r border-gray-200 ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
                <Sidebar 
                    chats={filteredChats} 
                    selectedChatId={selectedChat?.id}
                    onSelectChat={handleSelectChat}
                    onAction={handleAction}
                    filter={filter}
                    setFilter={setFilter}
                    search={search}
                    setSearch={setSearch}
                />
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col min-w-0 bg-white relative transition-all duration-300 ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
                <ChatWindow 
                    chat={selectedChat}
                    messages={selectedChat ? (messages[selectedChat.id] || []) : []}
                    onSendMessage={handleSendMessage}
                    onBack={handleBackToChats}
                    onToggleInfo={() => setShowInfoPanel(!showInfoPanel)}
                />
                
                {/* Info Panel Overlay (Desktop: slide in, Mobile: check design) */}
                {/* For desktop, we can have it side-by-side if enough space, or overlay */}
                {/* Implementing as overlay on right side for now */}
                <ContactInfoPanel 
                    contact={selectedChat}
                    isOpen={showInfoPanel && selectedChat}
                    onClose={() => setShowInfoPanel(false)}
                />
            </div>
        </div>
    );
}
