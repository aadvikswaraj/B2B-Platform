"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import StoreStatCard from "@/components/common/StoreStatCard";
import BannerManager from "@/components/seller/store/BannerManager";
import FileUpload from "@/components/common/FileUpload";

import {
  EyeIcon,
  ChartBarIcon,
  CubeIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowTopRightOnSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

// Store health checklist
function StoreHealthChecklist({ items }) {
  const completedCount = items.filter((i) => i.complete).length;
  const percentage =
    items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <Card>
      <CardHeader title="Store Setup Progress" />
      <div className="space-y-4">
        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {completedCount} of {items.length} completed
            </span>
            <span className="text-sm font-bold text-indigo-600">
              {percentage}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Checklist */}
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              {item.complete ? (
                <CheckCircleIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              ) : (
                <ExclamationCircleIcon className="h-5 w-5 text-amber-500 flex-shrink-0" />
              )}
              <span
                className={
                  item.complete ? "text-gray-500" : "text-gray-700 font-medium"
                }
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

export default function SellerStorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    logo: null, // File ID
    logoUrl: null, // Display URL
    banners: [],
    companyName: "",
    shortDescription: "",
    description: "",
    website: "",
    certifications: [],
    highlights: [],
  });

  // Fetch Profile Data
  useEffect(() => {
    fetchProfile();
  }, []);

  // Helper to construct file URL
  const getFileUrl = (file) => {
    if (!file) return null;
    if (typeof file === "string") return file; // Already a URL
    if (file.url) return file.url; // Already has virtual or property

    // Construct URL from relative path
    // Assuming backend serves public/uploads at /public/uploads
    // and relativePath is like "profile/filename.png"
    if (file.relativePath) {
      const baseUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      return `${baseUrl}/public/uploads/${file.relativePath}`;
    }

    return null;
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/user/profile`,
      );
      const data = await res.json();

      if (data.success) {
        setUser(data.data.user);
        const biz = data.data.business || {};
        setBusiness(biz);

        // Normalize banners to ensure they have compatible structure for BannerManager
        const normalizedBanners = (biz.banners || []).map((b) => ({
          ...b,
          // Ensure file is the object for display if possible, or keep as is
          // BannerManager expects 'url' for display
          url: getFileUrl(b.file),
        }));

        // Initialize form data
        setFormData({
          logo: biz.logo || null,
          logoUrl: getFileUrl(biz.logo), // Use helper
          banners: normalizedBanners,
          companyName: biz.companyName || "",
          shortDescription: biz.shortDescription || "",
          description: biz.description || "",
          website: biz.website || "",
          certifications: biz.certifications || [],
          highlights: biz.highlights || [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Clean up banners for submission (remove display-only URLs if needed, but backend validation handles schemas)
      const payload = {
        companyName: formData.companyName,
        shortDescription: formData.shortDescription,
        description: formData.description,
        website: formData.website,
        // Ensure we send ID for logo
        logo: formData.logo?._id || formData.logo,
        banners: formData.banners.map((b) => ({
          // Ensure we send ID for banner file
          file: b.file?._id || b.file,
          link: b.link,
          title: b.title,
          position: b.position,
          isActive: b.isActive,
        })),
        certifications: formData.certifications,
        highlights: formData.highlights,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/user/profile`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      if (data.success) {
        // Show success toast (generic alert for now)
        alert("Store settings saved successfully!");
        fetchProfile(); // Refresh
      } else {
        alert(data.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("Save error", error);
      alert("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Helper for simple list management (certifications/highlights)
  const ListManager = ({ title, items, onChange, placeholder }) => {
    const [newItem, setNewItem] = useState("");

    const add = () => {
      if (!newItem.trim()) return;
      onChange([...items, newItem.trim()]);
      setNewItem("");
    };

    const remove = (idx) => {
      onChange(items.filter((_, i) => i !== idx));
    };

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {title}
        </label>
        <div className="flex gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <Button variant="outline" onClick={add} type="button">
            Add
          </Button>
        </div>
        <div className="space-y-2 mt-2">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
            >
              <span>{item}</span>
              <button
                onClick={() => remove(idx)}
                className="text-rose-500 hover:text-rose-700"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading store settings...
      </div>
    );
  }

  const healthItems = [
    { label: "Upload store banner", complete: formData.banners.length > 0 },
    { label: "Add store logo", complete: !!formData.logo },
    {
      label: "Write company description",
      complete: formData.description.length > 50,
    },
    { label: "Add business details", complete: !!business?.address }, // existing field
    {
      label: "Add certifications",
      complete: formData.certifications.length > 0,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your store's appearance and public profile
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/company/${user?._id || "#"}`} target="_blank">
            <Button variant="outline">
              <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
              View Store
            </Button>
          </Link>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs
            tabs={[
              {
                id: "appearance",
                label: "Appearance",
                content: (
                  <div className="space-y-6">
                    {/* Logo Section */}
                    <Card>
                      <CardHeader title="Store Logo" />
                      <div className="p-6 pt-0">
                        <div className="flex flex-col sm:flex-row gap-6">
                          <div className="w-32 h-32 flex-shrink-0 relative bg-gray-100 rounded-lg overflow-hidden border">
                            {formData.logo ? (
                              // We let FileUpload handle the preview via logoUrl
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                Logo Set
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                No Logo
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <FileUpload
                              label=""
                              description="Upload a professional logo (Square, PNG/JPG)"
                              accept="image/*"
                              onUpload={(file) => {
                                if (file) {
                                  updateField("logo", file._id);
                                } else {
                                  updateField("logo", null);
                                }
                              }}
                              initialPreview={formData.logoUrl}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Banners Section */}
                    <Card>
                      <CardHeader title="Store Banners" />
                      <div className="p-6 pt-0">
                        <BannerManager
                          banners={formData.banners}
                          onChange={(newBanners) =>
                            updateField("banners", newBanners)
                          }
                        />
                      </div>
                    </Card>
                  </div>
                ),
              },
              {
                id: "information",
                label: "Information",
                content: (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader title="Company Info" />
                      <div className="p-6 pt-0 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Store Name
                          </label>
                          <Input
                            value={formData.companyName}
                            onChange={(e) =>
                              updateField("companyName", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Short Description (Tagline)
                          </label>
                          <Input
                            value={formData.shortDescription}
                            onChange={(e) =>
                              updateField("shortDescription", e.target.value)
                            }
                            placeholder="e.g. Premium Electronics Supplier"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Description
                          </label>
                          <Textarea
                            value={formData.description}
                            onChange={(e) =>
                              updateField("description", e.target.value)
                            }
                            rows={5}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Website
                          </label>
                          <Input
                            value={formData.website}
                            onChange={(e) =>
                              updateField("website", e.target.value)
                            }
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </Card>

                    <Card>
                      <CardHeader title="Highlights & Certifications" />
                      <div className="p-6 pt-0 space-y-6">
                        <ListManager
                          title="Business Highlights"
                          items={formData.highlights}
                          onChange={(items) => updateField("highlights", items)}
                          placeholder="e.g. 24/7 Support, Free Shipping"
                        />
                        <div className="border-t border-gray-100 my-4"></div>
                        <ListManager
                          title="Certifications"
                          items={formData.certifications}
                          onChange={(items) =>
                            updateField("certifications", items)
                          }
                          placeholder="e.g. ISO 9001"
                        />
                      </div>
                    </Card>
                  </div>
                ),
              },
            ]}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <StoreHealthChecklist items={healthItems} />

          <StoreStatCard
            icon={EyeIcon}
            label="Store Views"
            value="1,247"
            trend="+12%"
            trendDirection="up"
            subtext="7 days"
            variant="gradient"
          />
        </div>
      </div>
    </div>
  );
}
