"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/Tabs";
import HomepageManager from "./components/HomepageManager";

import GeneralSettings from "./components/GeneralSettings";

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState("homepage");

  const tabs = [
    {
      key: "homepage",
      label: "Homepage",
      content: <HomepageManager />,
    },
    {
      key: "general",
      label: "General Settings",
      content: <GeneralSettings />,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Content Management
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your website's homepage and visible content.
        </p>
      </div>
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}
