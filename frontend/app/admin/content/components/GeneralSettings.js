"use client";

import { useState } from "react";
import FormSection from "@/components/ui/FormSection";
import { Input, Textarea } from "@/components/ui/Input";
import FileInput from "@/components/ui/FileInput";
import Button from "@/components/ui/Button";
import {
  GlobeAltIcon,
  PhotoIcon,
  LifebuoyIcon,
} from "@heroicons/react/24/outline";

export default function GeneralSettings() {
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState(null);
  const [favicon, setFavicon] = useState(null);
  const [formData, setFormData] = useState({
    siteName: "B2B Platform",
    tagline: "Your trusted B2B Marketplace",
    description: "Connect with wholesale suppliers and buyers worldwide.",
    supportEmail: "support@example.com",
    supportPhone: "+1 (555) 123-4567",
    address: "123 Market St, San Francisco, CA 94105",
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert("Settings saved successfully!");
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      {/* Site Identity */}
      <FormSection
        title="Site Identity"
        description="Basic information about your marketplace."
        icon={GlobeAltIcon}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Name
            </label>
            <Input
              name="siteName"
              value={formData.siteName}
              onChange={handleChange}
              placeholder="e.g. Acme B2B"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tagline
            </label>
            <Input
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              placeholder="e.g. Global Marketplace"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              placeholder="Brief description for SEO..."
            />
          </div>
        </div>
      </FormSection>

      {/* Branding */}
      <FormSection
        title="Branding"
        description="Upload your visual assets. PNG or SVG recommended."
        icon={PhotoIcon}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Main Logo
            </span>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
              <FileInput
                id="logo-upload"
                value={logo}
                onChange={setLogo}
                accept="image/png,image/jpeg,image/svg+xml"
                label="Desktop Logo"
                helperText="Recommended: 200x50px transparent PNG"
              />
            </div>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Favicon
            </span>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-md shadow-sm border border-gray-200 flex items-center justify-center shrink-0">
                  {favicon ? (
                    <div className="text-xs">IMG</div>
                  ) : (
                    <span className="text-xs text-gray-400">32x32</span>
                  )}
                </div>
                <div className="flex-1">
                  <FileInput
                    id="favicon-upload"
                    value={favicon}
                    onChange={setFavicon}
                    accept="image/png,image/x-icon"
                    placeholder="Upload Favicon"
                    helperText="Recommended: 32x32px .ico or .png"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Contact & Social */}
      <FormSection
        title="Contact & Social"
        description="How users can reach you and find you on social media."
        icon={LifebuoyIcon}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Support Email
            </label>
            <Input
              name="supportEmail"
              type="email"
              value={formData.supportEmail}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <Input
              name="supportPhone"
              type="tel"
              value={formData.supportPhone}
              onChange={handleChange}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <Input
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
              Facebook URL
            </label>
            <Input
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              placeholder="https://facebook.com/..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
              Twitter (X) URL
            </label>
            <Input
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              placeholder="https://twitter.com/..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
              Instagram URL
            </label>
            <Input
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
              LinkedIn URL
            </label>
            <Input
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/..."
            />
          </div>
        </div>
      </FormSection>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} loading={loading} size="lg">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
