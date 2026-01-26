import {
  X,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Star,
  BellOff,
  Tag,
  FileText,
  ShoppingBag,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAvatarColor } from "@/utils/avatarColor";
import MessengerAPI from "@/utils/api/messenger";
import ContactSellerModal from "../common/ContactSellerModal";

// Available tag colors (Tailwind classes)
const TAG_COLORS = [
  {
    name: "Blue",
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
  {
    name: "Green",
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-400",
  },
  {
    name: "Purple",
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "bg-purple-400",
  },
  {
    name: "Yellow",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-200",
    dot: "bg-yellow-400",
  },
  {
    name: "Gray",
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
    dot: "bg-gray-400",
  },
];

export default function ContactInfoPanel({
  contact,
  onClose,
  isOpen,
  mode = "buyer",
  onUpdateContact, // New callback prop
}) {
  const [showContactModal, setShowContactModal] = useState(false);
  // Tags now store objects: { text: "Tag Name", color: "blue" }
  const [tags, setTags] = useState([]);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]); // Default to first color

  const [notes, setNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const notesTextareaRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize state from contact prop
  useEffect(() => {
    if (contact) {
      // Handle backward compatibility (start with string tags converted to default objects)
      const formattedTags = (contact.tags || []).map((t) =>
        typeof t === "string" ? { text: t, color: "Blue" } : t,
      );
      setTags(formattedTags);
      setNotes(contact.notes || "");
    }
  }, [contact]);

  useEffect(() => {
    if (isEditingNotes && notesTextareaRef.current) {
      notesTextareaRef.current.focus();
    }
  }, [isEditingNotes]);

  if (!contact) return null;

  const displayName =
    mode === "buyer"
      ? contact.companyName || contact.name || "Unknown Business"
      : contact.name || contact.companyName || "Unknown User";

  const avatarText = displayName[0]?.toUpperCase() || "?";
  const avatarBg = getAvatarColor(displayName);
  const avatarSrc = contact.avatar || contact.logo;

  // --- API Update Helper ---
  const updateContactMeta = async (updates) => {
    if (!contact?._id) return;
    try {
      setIsSaving(true);
      const res = await MessengerAPI.updateMeta(contact._id, updates);
      if (res.success) {
        if (onUpdateContact) onUpdateContact(res.data);
      } else {
        console.error("Failed to update contact:", res.message);
        // Could revert state here or show toast
      }
    } catch (error) {
      console.error("Error updating contact:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Tag Handlers ---
  const handleAddTag = async (e) => {
    e.preventDefault();
    if (newTag.trim()) {
      const newTagObj = { text: newTag.trim(), color: selectedColor.name };
      const updatedTags = [...tags, newTagObj];
      setTags(updatedTags);
      setNewTag("");
      // Persist immediately
      await updateContactMeta({ tags: updatedTags });
    }
  };

  const handleRemoveTag = async (tagToRemove) => {
    const updatedTags = tags.filter((tag) => tag.text !== tagToRemove.text);
    setTags(updatedTags);
    await updateContactMeta({ tags: updatedTags });
  };

  // --- Note Handlers ---
  const handleSaveNotes = async () => {
    setIsEditingNotes(false);
    await updateContactMeta({ notes });
  };

  const handleCancelNotes = () => {
    setNotes(contact.notes || ""); // Revert
    setIsEditingNotes(false);
  };

  // Helper to get color classes
  const getTagClasses = (colorName) => {
    const color = TAG_COLORS.find((c) => c.name === colorName) || TAG_COLORS[5]; // Default Gray
    return `${color.bg} ${color.text} ${color.border}`;
  };

  return (
    <div
      className={`absolute inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-30 overflow-y-auto border-l border-gray-100 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/80 sticky top-0 z-10 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">
          Contact Info
        </h2>
        <button
          onClick={onClose}
          className="p-2 -mr-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all duration-200"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-6 pb-32 space-y-8">
        {/* Profile */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`relative h-28 w-28 rounded-full overflow-hidden mb-5 ring-4 ring-white shadow-xl flex items-center justify-center text-white font-bold text-4xl ${!avatarSrc ? avatarBg : "bg-gray-50"}`}
          >
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt={displayName}
                width={112}
                height={112}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{avatarText}</span>
            )}
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-900 text-center leading-tight">
            {displayName}
          </h3>
          <p className="text-sm font-medium text-gray-500 mt-1">
            {mode === "buyer"
              ? contact.name
              : contact.companyName || "Business Account"}
          </p>
          {contact.online && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold shadow-sm"
            >
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Online Now
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-4 gap-2 border-b border-gray-100 pb-8">
          {[
            {
              icon: Phone,
              label: "Call",
              color: "text-blue-600",
              bg: "bg-blue-50",
              hoverBg: "group-hover:bg-blue-100",
              onClick: () => setShowContactModal(true),
            },
            {
              icon: Mail,
              label: "Email",
              color: "text-violet-600",
              bg: "bg-violet-50",
              hoverBg: "group-hover:bg-violet-100",
              onClick: () => setShowContactModal(true),
            },
            {
              icon: Star,
              label: "Star",
              color: contact.starred ? "text-amber-500" : "text-amber-600",
              bg: "bg-amber-50",
              hoverBg: "group-hover:bg-amber-100",
              fill: contact.starred,
              onClick: async () => {
                // Optimistic update handled by onUpdateContact via parent,
                // but we can also trigger the API directly
                await updateContactMeta({ starred: !contact.starred });
              },
            },
            {
              icon: BellOff,
              label: "Mute",
              color: contact.muted ? "text-red-600" : "text-gray-600",
              bg: contact.muted ? "bg-red-50" : "bg-gray-100",
              hoverBg: contact.muted
                ? "group-hover:bg-red-100"
                : "group-hover:bg-gray-200",
              fill: contact.muted,
              onClick: async () => {
                await updateContactMeta({ muted: !contact.muted });
              },
            },
          ].map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`p-3.5 rounded-2xl ${action.bg} ${action.color} ${action.hoverBg} shadow-sm group-hover:scale-110 group-active:scale-95 transition-all duration-300 ease-out`}
              >
                <action.icon
                  size={20}
                  className={`${action.fill ? "fill-current" : ""}`}
                  strokeWidth={2.5}
                />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500 group-hover:text-gray-900 transition-colors">
                {action.label}
              </span>
            </button>
          ))}
        </div>

        {/* Info Sections Container */}
        <div className="space-y-8">
          {/* Quick Links */}
          <section>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">
              Business
            </h4>
            <div className="space-y-3">
              {[
                {
                  icon: ShoppingBag,
                  label: "Visit Store",
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                },
                {
                  icon: FileText,
                  label: "View Catalog",
                  color: "text-indigo-600",
                  bg: "bg-indigo-50",
                },
              ].map((item, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2.5 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-300`}
                    >
                      <item.icon size={18} strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                      {item.label}
                    </span>
                  </div>
                  <ExternalLink
                    size={16}
                    className="text-gray-300 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all"
                  />
                </a>
              ))}
            </div>
          </section>

          {/* About */}
          <section>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
              About
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed px-1">
              {contact.bio || "No description provided."}
            </p>
          </section>

          {/* Contact Details */}
          {(contact.email || contact.phone || contact.address) && (
            <section className="bg-gray-50/50 p-5 rounded-3xl border border-gray-100 space-y-4">
              {contact.email && (
                <div className="flex items-center gap-4 group">
                  <div className="h-8 w-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm text-gray-400 group-hover:text-blue-500 group-hover:border-blue-100 transition-colors">
                    <Mail size={14} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate flex-1">
                    {contact.email}
                  </span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-4 group">
                  <div className="h-8 w-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm text-gray-400 group-hover:text-green-500 group-hover:border-green-100 transition-colors">
                    <Phone size={14} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {contact.phone}
                  </span>
                </div>
              )}
              {contact.address && (
                <div className="flex items-start gap-4 group">
                  <div className="h-8 w-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm text-gray-400 group-hover:text-red-500 group-hover:border-red-100 transition-colors shrink-0">
                    <MapPin size={14} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 leading-snug pt-1.5">
                    {contact.address}
                  </span>
                </div>
              )}
            </section>
          )}

          {/* Tags */}
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Tags
              </h4>
              <button
                onClick={() => setIsEditingTags(!isEditingTags)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors hover:bg-blue-50 px-2 py-1 rounded-lg"
              >
                {isEditingTags ? "Done" : "Edit"}
              </button>
            </div>

            <div className={`min-h-[40px] transition-all duration-300`}>
              <div className="flex flex-wrap gap-2 mb-3">
                <AnimatePresence mode="popLayout">
                  {tags.length === 0 && !isEditingTags && (
                    <span className="text-sm text-gray-400 italic px-1">
                      No tags added
                    </span>
                  )}
                  {tags.map((tag, idx) => (
                    <motion.span
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      key={tag.text + idx}
                      onClick={() => isEditingTags && handleRemoveTag(tag)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-sm transition-all ${getTagClasses(tag.color)} ${isEditingTags ? "cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200 pr-2" : ""}`}
                    >
                      {tag.text}
                      {isEditingTags && <X size={12} className="ml-1.5" />}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {isEditingTags && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddTag}
                    className="bg-gray-50 rounded-xl p-3 border border-gray-100 overflow-hidden"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${selectedColor.bg} ${selectedColor.border}`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full ${selectedColor.dot}`}
                          />
                        </div>
                        <input
                          type="text"
                          className="flex-1 min-w-0 text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
                          placeholder="New tag name..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          autoFocus
                        />
                        <button
                          type="submit"
                          disabled={!newTag.trim()}
                          className="p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors shadow-sm active:scale-95 flex-shrink-0"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Color Palette Row */}
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-[calc(100%-16px)]">
                          <span className="text-[10px] font-bold text-gray-400 uppercase mr-1">
                            Color:
                          </span>
                          {TAG_COLORS.map((c) => (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => setSelectedColor(c)}
                              className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-all duration-200 ${c.dot} ${selectedColor.name === c.name ? "ring-2 ring-offset-1 ring-gray-400 scale-110" : "hover:scale-110 opacity-60 hover:opacity-100 border-transparent"}`}
                              title={c.name}
                            />
                          ))}
                        </div>
                        {/* Selected Indicator (Optional, but good for feedback) */}
                        <div
                          className={`w-3 h-3 rounded-full ${selectedColor.dot} flex-shrink-0`}
                        />
                      </div>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Notes */}
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Notes
              </h4>
              {!isEditingNotes && (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors hover:bg-blue-50 px-2 py-1 rounded-lg"
                >
                  {notes ? "Edit" : "Add"}
                </button>
              )}
            </div>

            <div
              className={`relative rounded-2xl transition-all duration-300 overflow-hidden ${isEditingNotes ? "bg-white ring-4 ring-blue-50 border border-blue-200 shadow-md" : "bg-amber-50/50 border border-amber-100/50 hover:border-amber-200 hover:shadow-sm"}`}
            >
              {isEditingNotes ? (
                <div className="p-3">
                  <textarea
                    ref={notesTextareaRef}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-transparent border-none p-1 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-0 resize-none min-h-[100px] leading-relaxed"
                    placeholder="Write private notes about this contact..."
                  />
                  <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={handleCancelNotes}
                      className="px-4 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      disabled={isSaving}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Saving
                        </>
                      ) : (
                        <>
                          <Save size={14} /> Save Note
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingNotes(true)}
                  className="p-5 cursor-pointer min-h-[80px] group transition-colors"
                >
                  {notes ? (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {notes}
                    </p>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-4 text-gray-400 gap-2">
                      <div className="p-2 rounded-full bg-amber-100/50 text-amber-500 group-hover:bg-amber-100 group-hover:scale-110 transition-all">
                        <Plus size={16} strokeWidth={3} />
                      </div>
                      <span className="text-xs font-medium">
                        Add a private note
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      {/* Contact Seller Modal for Call Action */}
      {contact && (
        <ContactSellerModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          initialData={contact}
          sellerId={contact._id}
        />
      )}
    </div>
  );
}
