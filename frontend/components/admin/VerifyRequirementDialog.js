import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import api from "@/utils/api/api";
import { toast } from "react-hot-toast";
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

export default function VerifyRequirementDialog({ open, onClose, item, onSuccess }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [query, setQuery] = useState("");
  const [refineOptions, setRefineOptions] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCategories();
      // Reset state
      setSelectedCategory(null);
      setRefineOptions("");
      setQuery("");
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      // Assuming there's an endpoint to get categories for selection
      // If not, we might need to use the public category list or admin list
      const res = await api.get("/admin/category/list?pageSize=100"); 
      if (res.data.success) {
        setCategories(res.data.data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const filteredCategories =
    query === ""
      ? categories
      : categories.filter((category) =>
          category.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  const handleSubmit = async () => {
    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }

    setLoading(true);
    try {
      const optionsArray = refineOptions
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const res = await api.put(`/admin/buy-requirements/${item._id}/verify`, {
        categoryId: selectedCategory._id,
        refineOptions: optionsArray,
      });

      if (res.data.success) {
        toast.success("Requirement verified successfully");
        onSuccess();
      } else {
        toast.error(res.data.message || "Failed to verify");
      }
    } catch (error) {
      console.error("Verification error", error);
      toast.error("Error verifying requirement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Verify Buy Requirement">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <div className="mt-1 text-sm text-gray-900">{item?.productName}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <div className="mt-1 text-sm text-gray-500">{item?.description}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign Category
          </label>
          <Combobox value={selectedCategory} onChange={setSelectedCategory}>
            <div className="relative mt-1">
              <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left border border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                <Combobox.Input
                  className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                  displayValue={(category) => category?.name}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search category..."
                />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </Combobox.Button>
              </div>
              <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
                {filteredCategories.length === 0 && query !== "" ? (
                  <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                    Nothing found.
                  </div>
                ) : (
                  filteredCategories.map((category) => (
                    <Combobox.Option
                      key={category._id}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? "bg-blue-600 text-white" : "text-gray-900"
                        }`
                      }
                      value={category}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected ? "font-medium" : "font-normal"
                            }`}
                          >
                            {category.name}
                          </span>
                          {selected ? (
                            <span
                              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                active ? "text-white" : "text-blue-600"
                              }`}
                            >
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </div>
          </Combobox>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Refine Options (comma separated)
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            placeholder="e.g. Color, Size, Material"
            value={refineOptions}
            onChange={(e) => setRefineOptions(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500">
            Add options for the buyer to refine their requirement later.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Verify & Approve
          </Button>
        </div>
      </div>
    </Modal>
  );
}
