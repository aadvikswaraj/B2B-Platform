import { useState } from 'react';
import { Search } from 'lucide-react';
import ConversationItem from './ConversationItem';

export default function Sidebar({ chats, selectedChatId, onSelectChat, onAction, filter, setFilter, search, setSearch, className = '' }) {
    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'unread', label: 'Unread' },
        { id: 'starred', label: 'Starred' },
    ];
    
    return (
        <div className={`flex flex-col h-full bg-white border-r border-gray-200 ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Messages</h1>
                
                {/* Search */}
                <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                    />
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`
                                flex-1 py-1.5 text-xs sm:text-sm font-medium rounded-md focus:outline-none transition-all duration-200
                                ${filter === tab.id 
                                    ? 'bg-white text-gray-900 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {chats.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {chats.map(chat => (
                            <ConversationItem
                                key={chat.id}
                                chat={chat}
                                isActive={selectedChatId === chat.id}
                                onClick={() => onSelectChat(chat)}
                                onAction={onAction}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400 px-6 text-center">
                        <Search size={48} className="mb-4 opacity-20" />
                        <p className="text-sm">No messages found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
