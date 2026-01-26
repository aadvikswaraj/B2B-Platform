"use client";

import { useState } from "react";
import { Reorder } from "framer-motion";
import {
  PlusIcon,
  TrashIcon,
  TagIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import clsx from "clsx";

// Mock available categories
const ALL_CATEGORIES = [
  { id: "cat_1", name: "Electronics", count: 120 },
  { id: "cat_2", name: "Fashion", count: 85 },
  { id: "cat_3", name: "Home & Garden", count: 64 },
  { id: "cat_4", name: "Sports", count: 42 },
  { id: "cat_5", name: "Beauty", count: 33 },
  { id: "cat_6", name: "Automotive", count: 21 },
  { id: "cat_7", name: "Toys", count: 15 },
  { id: "cat_8", name: "Books", count: 8 },
];

export default function FeaturedCategoriesManager() {
  // Initial featured categories
  const [featured, setFeatured] = useState([
    { id: "cat_1", name: "Electronics", count: 120 },
    { id: "cat_2", name: "Fashion", count: 85 },
    { id: "cat_3", name: "Home & Garden", count: 64 },
  ]);

  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleRemove = (id) => {
    setFeatured((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAdd = (category) => {
    setFeatured((prev) => [...prev, category]);
    setIsAddOpen(false);
  };

  // Filter out already featured categories
  const availableCategories = ALL_CATEGORIES.filter(
    (c) => !featured.find((f) => f.id === c.id),
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Featured Categories
          </h2>
          <p className="text-sm text-gray-500">
            Select categories to display on the homepage. Drag to reorder.
          </p>
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          size="sm"
          icon={PlusIcon}
          disabled={availableCategories.length === 0}
        >
          Add Category
        </Button>
      </div>

      <div className="p-4 sm:p-6">
        <Reorder.Group
          axis="y"
          values={featured}
          onReorder={setFeatured}
          className="space-y-3"
        >
          {featured.map((item) => (
            <Reorder.Item
              key={item.id}
              value={item}
              className="cursor-move relative z-0"
            >
              <div className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 transition-all group">
                <div
                  className="text-gray-400 cursor-grab active:cursor-grabbing p-1 hover:text-gray-600 transition-colors"
                  title="Drag to reorder"
                >
                  <ArrowsUpDownIcon className="w-5 h-5" />
                </div>

                <div className="w-10 h-10 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <TagIcon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500">{item.count} products</p>
                </div>

                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Remove"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {featured.length === 0 && (
          <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            No featured categories yet.
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      <Modal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Featured Category"
        size="md"
      >
        <div className="max-h-[60vh] overflow-y-auto -mx-5 px-5 space-y-2">
          {availableCategories.length > 0 ? (
            availableCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleAdd(cat)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left transition-colors border border-transparent hover:border-gray-200 group"
              >
                <div className="w-8 h-8 rounded bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
                  <TagIcon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="block font-medium text-gray-700">
                    {cat.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {cat.count} products
                  </span>
                </div>
                <PlusIcon className="w-5 h-5 text-gray-300 group-hover:text-indigo-600" />
              </button>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">
              All categories are already featured.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
