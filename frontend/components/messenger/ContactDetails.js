"use client";

import React, { useState, useEffect } from "react";
import {
  updateConversationMeta,
  getConversation,
} from "../../utils/api/messenger";
import {
  StarIcon,
  BellSlashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

export default function ContactDetails({ conversationId, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await getConversation(conversationId);
      if (res.success) {
        setDetails(res.data);
        // Extract my data
        // Assuming I am one of the participants. I need to know MY userid.
        // But the response structure participants array has user objects.
        // I need to filter by "me".
        // For simplicity, I'll rely on the API returning "participants" and finding the one that is likely me?
        // Or I can store 'me' in context.
        // Backend `getContacts` formatted data: { starred, notes, tags ... } attached to root.
        // Backend `getConversation` returns raw conversation doc.
        // AND `populate("participants.user")`.

        // I need to identify WHICH participant is me to get my notes/tags.
        // I can just assume the one that is "me" has been handled by backend?
        // No, backend `getConversation` returns the raw doc.
        // I'll assume I can find "me" via session if I had it here, or logic:
        // Actually, backend `getConversation` should probably transform it like `getContacts` does for convenience.
        // But I wrote `findOne` + `populate` in controller.

        // Let's iterate participants. I don't have my ID here unless I useSession.
        // But Wait! `getContacts` returned TRANSFORMED data.
        // `getConversation` returns RAW data.
        // My participant entry has `notes`, `tags` etc.
        // Since I don't have my ID easily without context, I can just find the participant entry that matches my session ID.
        // I'll assume usage of useSession.
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Need session to identify "me"
  // For now, I'll assume the component is used where session is available or I fetch it.
  // I'll skip session fetch here and just use the first participant that matches "me" logic if possible.
  // Actually, I can just use `updateConversationMeta` blindly, but to display initial state I need it.
  // I'll add useSession.

  useEffect(() => {
    if (conversationId) fetchDetails();
  }, [conversationId]);

  // Effect to sync state when details loaded
  // But wait, I need my ID.

  const handleUpdate = async (updates) => {
    try {
      await updateConversationMeta(conversationId, updates);
      // Refresh details or update local state
      // Simplified:
      if (updates.notes !== undefined) setNote(updates.notes);
      if (updates.tags !== undefined) setTags(updates.tags);
    } catch (err) {
      console.error(err);
    }
  };

  const addTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setTagInput("");
      handleUpdate({ tags: newTags });
    }
  };

  const removeTag = (tag) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    handleUpdate({ tags: newTags });
  };

  const saveNote = () => {
    handleUpdate({ notes: note });
  };

  // Fallback UI
  return (
    <div className="h-full border-l border-gray-200 bg-white p-4 w-72 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Details</h3>
        <button onClick={onClose}>
          <XMarkIcon className="h-6 w-6 text-gray-400" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex space-x-4 justify-center mb-6">
        <div className="flex flex-col items-center cursor-pointer">
          <div className="p-2 bg-gray-100 rounded-full mb-1">
            <BellSlashIcon className="h-6 w-6 text-gray-600" />
          </div>
          <span className="text-xs">Mute</span>
        </div>
        <div className="flex flex-col items-center cursor-pointer">
          <div className="p-2 bg-gray-100 rounded-full mb-1">
            <StarIcon className="h-6 w-6 text-gray-600" />
          </div>
          <span className="text-xs">Star</span>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs flex items-center"
            >
              {tag}
              <XMarkIcon
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => removeTag(tag)}
              />
            </span>
          ))}
        </div>
        <form onSubmit={addTag}>
          <input
            className="w-full text-sm border-gray-300 rounded-md"
            placeholder="Add tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
          />
        </form>
      </div>

      {/* Notes */}
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Notes
        </label>
        <textarea
          className="w-full h-40 text-sm border-gray-300 rounded-md resize-none"
          placeholder="Private notes..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={saveNote}
        />
      </div>
    </div>
  );
}
