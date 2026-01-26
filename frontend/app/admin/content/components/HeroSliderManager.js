"use client";

import { useState } from "react";
import {
  PlusIcon,
  PhotoIcon,
  PencilIcon,
  TrashIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import { Reorder } from "framer-motion";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import clsx from "clsx";
import { Bars3Icon } from "@heroicons/react/24/outline";

const MOCK_SLIDES = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop",
    title: "Summer Collection 2026",
    subtitle: "Up to 50% Off on all seasonal wear",
    link: "/search?category=summer",
    active: true,
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
    title: "New Arrivals",
    subtitle: "Check out the latest trends",
    link: "/new-arrivals",
    active: true,
  },
];

export default function HeroSliderManager() {
  const [slides, setSlides] = useState(MOCK_SLIDES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(null);

  const handleEdit = (slide) => {
    setCurrentSlide({ ...slide });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setCurrentSlide({
      id: Date.now(),
      image: "",
      title: "",
      subtitle: "",
      link: "",
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this slide?")) {
      setSlides((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleSave = () => {
    if (!currentSlide.image) return alert("Please select an image");

    if (slides.find((s) => s.id === currentSlide.id)) {
      setSlides((prev) =>
        prev.map((s) => (s.id === currentSlide.id ? currentSlide : s)),
      );
    } else {
      setSlides((prev) => [...prev, currentSlide]);
    }
    setIsModalOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCurrentSlide((prev) => ({ ...prev, image: url }));
    }
  };

  const toggleActive = (id) => {
    setSlides((prev) =>
      prev.map((s) => {
        if (s.id === id) return { ...s, active: !s.active };
        return s;
      }),
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Hero Slider</h2>
          <p className="text-sm text-gray-500">
            Manage the main homepage banners. Drag to reorder coming soon.
          </p>
        </div>
        <Button onClick={handleAddNew} size="sm" icon={PlusIcon}>
          Add Slide
        </Button>
      </div>

      <div className="p-4 sm:p-6">
        <Reorder.Group
          axis="y"
          values={slides}
          onReorder={setSlides}
          className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {slides.map((slide, index) => (
            <Reorder.Item key={slide.id} value={slide} className="h-full">
              <div className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-gray-300 flex flex-col h-full cursor-grab active:cursor-grabbing">
                {/* Image Preview */}
                <div className="aspect-[16/9] w-full bg-gray-100 relative overflow-hidden">
                  {slide.image ? (
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className={clsx(
                        "w-full h-full object-cover transition-opacity",
                        !slide.active && "opacity-60 grayscale",
                      )}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <PhotoIcon className="w-10 h-10 opacity-20" />
                    </div>
                  )}

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(slide);
                      }}
                      className="p-2 bg-white rounded-full text-gray-700 shadow-sm hover:text-indigo-600 hover:scale-110 transition-all pointer-events-auto"
                      title="Edit"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(slide.id);
                      }}
                      className="p-2 bg-white rounded-full text-gray-700 shadow-sm hover:text-red-600 hover:scale-110 transition-all pointer-events-auto"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Drag Handle & Index */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <div
                      className="p-1.5 rounded-md bg-black/50 text-white backdrop-blur-md cursor-grab active:cursor-grabbing hover:bg-black/70 transition-colors"
                      title="Drag to reorder"
                    >
                      <ArrowsUpDownIcon className="w-4 h-4" />
                    </div>
                    <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-black/50 text-white backdrop-blur-md">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={clsx(
                        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium backdrop-blur-md shadow-sm",
                        slide.active
                          ? "bg-white/90 text-emerald-700"
                          : "bg-gray-100/90 text-gray-500",
                      )}
                    >
                      {slide.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3
                      className="font-medium text-sm text-gray-900 truncate flex-1"
                      title={slide.title}
                    >
                      {slide.title || "No Title"}
                    </h3>
                  </div>
                  <p
                    className="text-xs text-gray-500 truncate mb-3"
                    title={slide.subtitle}
                  >
                    {slide.subtitle || "No Subtitle"}
                  </p>

                  <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]">
                      {slide.link || "No link"}
                    </span>
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="pointer-events-auto"
                    >
                      <Toggle
                        checked={slide.active}
                        onChange={() => toggleActive(slide.id)}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Reorder.Item>
          ))}

          {/* Add New Placeholder Card - Outside Reorder Group or as static item? 
                Framer Motion Reorder list is tricky with mixed items. 
                Optimally, we put the "Add" button outside the list or as a separate static element in the grid.
                Since Reorder.Group expects a list that matches 'values', we cannot easily inject a static child inside the loop comfortably without hacks.
                We will place the Add button AFTER the list, but css grid might break if we just put it next to Reorder.Group.
                
                Solution: We can't use CSS Grid on the Reorder.Group directly easily if we want a static item.
                Actually we can wrapped them in a React.Fragment if Reorder allowed it, but it renders a ul/div.
                
                Alternate: Make the "Add" button a separate element outside the flow or just below.
            */}
        </Reorder.Group>

        {/* Add Button - separate container to maintain grid-like flow visually if possible, or just a bar at bottom */}
        <div className="mt-6">
          <button
            onClick={handleAddNew}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/10 transition-all text-gray-400 hover:text-indigo-600"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Add New Slide</span>
          </button>
        </div>
      </div>

      {/* Editor Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          currentSlide?.id && slides.find((s) => s.id === currentSlide.id)
            ? "Edit Slide"
            : "New Slide"
        }
        size="lg"
        mobileMode="drawer"
        actions={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Slide</Button>
          </>
        }
      >
        <div className="space-y-5 py-2">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Image
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-3 border border-gray-200 rounded-lg bg-gray-50/50">
              <div className="relative w-full sm:w-40 aspect-[16/9] bg-gray-200 rounded-md overflow-hidden border border-gray-200 shrink-0 shadow-sm group">
                {currentSlide?.image ? (
                  <img
                    src={currentSlide.image}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100">
                    <PhotoIcon className="w-8 h-8 opacity-40" />
                  </div>
                )}
              </div>
              <div className="flex-1 w-full">
                <input
                  type="file"
                  id="slide-image-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="slide-image-upload"
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:text-indigo-600 cursor-pointer transition-colors w-fit"
                  >
                    <PhotoIcon className="w-4 h-4 mr-2" />
                    {currentSlide?.image ? "Change Image" : "Upload Image"}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: 1920x600px (JPG, PNG)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Title"
              value={currentSlide?.title || ""}
              onChange={(e) =>
                setCurrentSlide((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g. Summer Sale"
              helperText="Main heading text."
            />
            <Input
              label="Subtitle"
              value={currentSlide?.subtitle || ""}
              onChange={(e) =>
                setCurrentSlide((prev) => ({
                  ...prev,
                  subtitle: e.target.value,
                }))
              }
              placeholder="e.g. Up to 50% off on selected items"
              helperText="Secondary text below the title."
            />
            <Input
              label="Link URL"
              value={currentSlide?.link || ""}
              onChange={(e) =>
                setCurrentSlide((prev) => ({ ...prev, link: e.target.value }))
              }
              placeholder="/search?category=..."
              helperText="Where the banner should link to."
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-sm font-medium text-gray-700">
              Active Status
            </span>
            <Toggle
              checked={currentSlide?.active || false}
              onChange={(val) =>
                setCurrentSlide((prev) => ({ ...prev, active: val }))
              }
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
