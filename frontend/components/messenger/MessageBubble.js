import { Check, CheckCheck } from 'lucide-react';

export default function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex w-full mt-2 space-x-3 max-w-xs md:max-w-md ${isOwn ? 'ml-auto justify-end' : ''}`}>
      {!isOwn && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 overflow-hidden">
          {/* Avatar placeholder if not own */}
          {message.sender?.avatar && <img src={message.sender.avatar} alt="Avatar" className="h-full w-full object-cover" />}
        </div>
      )}
      <div className={`relative px-4 py-2 shadow-sm rounded-lg ${
        isOwn 
          ? 'bg-blue-600 text-white rounded-br-none' 
          : 'bg-white text-gray-900 border border-gray-100 rounded-bl-none'
      }`}>
        <p className="text-sm leading-snug">{message.text}</p>
        <div className={`flex items-center justify-end space-x-1 mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
          <span className="text-[10px] min-w-fit">
            {message.time}
          </span>
          {isOwn && (
             <span>
               {message.status === 'read' ? <CheckCheck size={12} /> : <Check size={12} />}
             </span>
          )}
        </div>
      </div>
    </div>
  );
}
