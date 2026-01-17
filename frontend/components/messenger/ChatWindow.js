import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, MoreVertical, Paperclip, Send, Smile, Image as ImageIcon, Search } from 'lucide-react';
import Image from 'next/image';
import MessageBubble from './MessageBubble';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function ChatWindow({ chat, messages, onSendMessage, onBack, onToggleInfo }) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chat]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!chat) {
      return (
          <div className="hidden md:flex flex-col items-center justify-center h-full bg-gray-50 text-gray-500">
              <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                  <Send size={48} className="text-blue-200 ml-1" />
              </div>
              <h3 className="text-xl font-medium text-gray-800">Your Messages</h3>
              <p className="max-w-xs text-center mt-2 text-sm text-gray-400">Select a chat to start messaging or search for a contact.</p>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="flex items-center">
          <button 
            onClick={onBack}
            className="md:hidden mr-3 p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="relative">
             <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-100 bg-gray-200">
                <Image 
                    src={chat.avatar || "https://placehold.co/100x100"} 
                    alt={chat.company} 
                    width={40} 
                    height={40}
                    className="h-full w-full object-cover" 
                />
             </div>
             {chat.online && (
                 <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-500"></span>
             )}
          </div>
          
          <div className="ml-3 cursor-pointer" onClick={onToggleInfo}>
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 leading-tight">{chat.company}</h2>
            <p className="text-xs text-green-600 font-medium">
                {chat.online ? 'Online' : `Last seen ${chat.lastSeen || 'recently'}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
           <button className="hidden sm:inline-flex p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors" title="Search in chat">
               <Search size={20} />
           </button>
           
           <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors focus:outline-none">
                 <MoreVertical size={20} />
              </Menu.Button>
               <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={onToggleInfo}
                            className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700 w-full text-left`}
                          >
                            Contact Info
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700 w-full text-left`}>
                            Mute Notifications
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700 w-full text-left`}>
                            Clear Chat
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
           </Menu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
         {/* Date separator example */}
         <div className="flex justify-center my-4">
             <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full shadow-sm">Today</span>
         </div>
         
         {messages.length > 0 ? messages.map((msg) => (
             <MessageBubble key={msg.id} message={msg} isOwn={msg.direction === 'outgoing'} />
         )) : (
             <div className="text-center text-gray-400 py-10">
                 <p>No messages yet. Start the conversation!</p>
             </div>
         )}
         <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-white border-t border-gray-200">
         <div className="flex items-end space-x-2 bg-gray-50 border border-gray-200 rounded-3xl p-2 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-400 transition-all shadow-sm">
             
             {/* Attachment Button */}
             <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                 <Paperclip size={20} />
             </button>
             
             {/* Text Area */}
             <textarea 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type a message..." 
                className="flex-1 max-h-32 bg-transparent border-0 focus:ring-0 resize-none py-2 px-1 text-gray-900 placeholder-gray-500 text-sm leading-6 custom-scrollbar"
                rows={1}
                style={{ minHeight: '40px' }}
             />
             
             {/* Right side actions */}
             <div className="flex items-center pb-1 space-x-1">
                 {!newMessage.trim() && (
                    <>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                            <ImageIcon size={20} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                            <Smile size={20} />
                        </button>
                    </>
                 )}
                 {newMessage.trim() && (
                    <button 
                        onClick={handleSend}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md transform active:scale-95 transition-all flex-shrink-0 mb-0.5"
                    >
                        <Send size={18} className="translate-x-0.5" />
                    </button>
                 )}
             </div>
         </div>
      </div>
    </div>
  );
}
