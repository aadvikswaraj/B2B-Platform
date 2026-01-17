import { X, Phone, Mail, MapPin, ExternalLink, Star, BellOff, Tag, FileText, ShoppingBag } from 'lucide-react';
import Image from 'next/image';

export default function ContactInfoPanel({ contact, onClose, isOpen }) {
  if (!contact) return null;

  return (
    <div className={`absolute inset-y-0 right-0 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-30 overflow-y-auto border-l border-gray-200 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Contact Info</h2>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="p-6">
        {/* Profile */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 mb-4 ring-4 ring-gray-50">
            <Image 
                src={contact.avatar || "https://placehold.co/100x100"} 
                alt={contact.company} 
                width={96} 
                height={96} 
                className="h-full w-full object-cover"
            />
          </div>
          <h3 className="text-xl font-bold text-gray-900 text-center">{contact.company}</h3>
          <p className="text-sm text-gray-500 mt-1">{contact.user?.name || "Business Account"}</p>
          {contact.online && <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Online</span>}
        </div>

        {/* Actions */}
        <div className="flex justify-around mb-8 border-b border-gray-100 pb-6">
           <button className="flex flex-col items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors">
              <div className="p-2.5 rounded-full bg-gray-100 hover:bg-blue-50 transition-colors">
                 <Phone size={20} />
              </div>
              <span className="text-xs font-medium">Call</span>
           </button>
           <button className="flex flex-col items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors">
              <div className="p-2.5 rounded-full bg-gray-100 hover:bg-blue-50 transition-colors">
                 <Mail size={20} />
              </div>
              <span className="text-xs font-medium">Email</span>
           </button>
           <button className="flex flex-col items-center gap-1.5 text-gray-600 hover:text-yellow-600 transition-colors">
              <div className="p-2.5 rounded-full bg-gray-100 hover:bg-yellow-50 transition-colors">
                 <Star size={20} className={contact.starred ? "fill-yellow-500 text-yellow-500" : ""} />
              </div>
              <span className="text-xs font-medium">Star</span>
           </button> 
           <button className="flex flex-col items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors">
              <div className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                 <BellOff size={20} />
              </div>
              <span className="text-xs font-medium">Mute</span>
           </button>
        </div>

        {/* Info Sections */}
        <div className="space-y-6">

           {/* Quick Links (Business Profile) */}
           <div>
               <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Business Profile</h4>
               <div className="flex flex-col space-y-2">
                 {/* Store Info */}
                 <a href="#" className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors group">
                    <div className="flex items-center">
                       <div className="bg-white p-1.5 rounded-md shadow-sm border border-gray-100 mr-3 group-hover:border-blue-200">
                          <ShoppingBag size={18} className="text-blue-600" />
                       </div>
                       <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">View Store</span>
                    </div>
                    <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-400" />
                 </a>
                 
                 {/* Catalog */}
                 <a href="#" className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors group">
                     <div className="flex items-center">
                       <div className="bg-white p-1.5 rounded-md shadow-sm border border-gray-100 mr-3 group-hover:border-blue-200">
                          <FileText size={18} className="text-indigo-600" />
                       </div>
                       <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">Company Catalog</span>
                    </div>
                    <ExternalLink size={14} className="text-gray-400 group-hover:text-indigo-400" />
                 </a>
               </div>
           </div>

           {/* About */}
           <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">About</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                 {contact.bio || "Wholesale distributor specializing in electronics and consumer goods. Verified supplier since 2021."}
              </p>
           </div>
           
           {/* Contact Details */}
           <div className="space-y-3">
              {contact.email && (
                 <div className="flex items-center text-sm text-gray-600">
                    <Mail size={16} className="mr-3 text-gray-400" />
                    <span className="truncate">{contact.email}</span>
                 </div>
              )}
               {contact.phone && (
                 <div className="flex items-center text-sm text-gray-600">
                    <Phone size={16} className="mr-3 text-gray-400" />
                    <span>{contact.phone}</span>
                 </div>
              )}
               {contact.address && (
                 <div className="flex items-center text-sm text-gray-600">
                    <MapPin size={16} className="mr-3 text-gray-400" />
                    <span>{contact.address}</span>
                 </div>
              )}
           </div>
           
           {/* Tags */}
           <div>
               <h4 className="flex items-center justify-between text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                 <span>Tags</span>
                 <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
               </h4>
               <div className="flex flex-wrap gap-2">
                  {(contact.tags || ['Supplier', 'Electronic', 'Verified']).map(tag => (
                      <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                         <Tag size={10} className="mr-1.5 opacity-50" />
                         {tag}
                      </span>
                  ))}
               </div>
           </div>

           {/* Notes */}
            <div>
               <h4 className="flex items-center justify-between text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                 <span>Notes</span>
                 <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">Add</button>
               </h4>
               <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                  <p className="text-sm text-yellow-800 italic">"Prefer to be contacted in the morning. Usually ships within 2 days."</p>
               </div>
           </div>

        </div>
      </div>
    </div>
  );
}
