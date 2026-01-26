"use client";

import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

// Predefined tags as requested
const AVAILABLE_TAGS = [
  "Bulk",
  "Urgent",
  "Local Only",
  "Export",
  "Sample Required",
];

export default function TagsEditModal({
  isOpen,
  onClose,
  currentTags,
  onSave,
}) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedTags(currentTags || []);
    }
  }, [isOpen, currentTags]);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedTags);
      onClose();
    } catch (error) {
      console.error("Failed to save tags", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Edit Product Labels
            </h3>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md transform scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Labels"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
