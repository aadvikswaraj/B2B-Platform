"use client";

import { useContext, useState } from "react";
import { useSelectedLayoutSegments, usePathname } from "next/navigation";
import SellerSidebar from "@/components/seller/SellerSidebar";
import SellerTopbar from "@/components/seller/SellerTopbar";
import { ScreenSpinner } from "@/components/ui/ScreenSpinner";
import { AuthContext } from "@/context/context";
import BottomNav from "@/components/common/BottomNav";
import {
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  QuestionMarkCircleIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  BuildingStorefrontIcon,
  MegaphoneIcon,
  ChartBarIcon,
  CreditCardIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const PUBLIC_PATHS = ["registration"];

const navigation = [
  { name: 'Dashboard', href: '/seller', icon: HomeIcon },
  { name: 'Products', href: '/seller/products', icon: ShoppingBagIcon },
  { name: 'Brands', href: '/seller/brands', icon: TagIcon },
  { name: 'Buy Leads', href: '/seller/buyleads', icon: QuestionMarkCircleIcon },
  { name: 'Orders', href: '/seller/orders', icon: ClipboardDocumentListIcon },
  { name: 'Messages', href: '/seller/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'Store', href: '/seller/store', icon: BuildingStorefrontIcon },
  { name: 'Ads', href: '/seller/ads', icon: MegaphoneIcon },
  { name: 'Analytics', href: '/seller/analytics', icon: ChartBarIcon },
  { name: 'Payouts', href: '/seller/payouts', icon: CreditCardIcon },
  { name: 'Settings', href: '/seller/settings', icon: Cog6ToothIcon },
];

export default function SellerLayout({ children }) {
  let auth = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const segments = useSelectedLayoutSegments();
  const pathname = usePathname();
  const isPublicPath = segments.some((segment) =>
    PUBLIC_PATHS.includes(segment)
  );

  // Check for ID at the end of path (24 hex chars)
  const isIdPage = /[0-9a-fA-F]{24}$/.test(pathname);

  // Determine if BottomNav should be hidden
  const isFormPage = pathname.includes('/create') || pathname.includes('/edit') || isIdPage;
  
  const primaryNav = navigation.slice(0, 4);
  const secondaryNav = navigation.slice(4);

  // Header Config
  let headerTitle = "Seller Panel";
  let showBack = false;
  let backUrl = "#";

  if (pathname === '/seller') {
    headerTitle = "Dashboard";
  } else if (pathname.endsWith('/create')) {
    const segments = pathname.split('/');
    const resource = segments[segments.length - 2];
    const singular = resource.endsWith('s') ? resource.slice(0, -1) : resource;
    headerTitle = `New ${singular.charAt(0).toUpperCase() + singular.slice(1)}`;
    showBack = true;
    backUrl = pathname.replace('/create', '');
  } else if (pathname.endsWith('/edit')) {
    const segments = pathname.split('/');
    const resource = segments[segments.length - 3];
    const singular = resource.endsWith('s') ? resource.slice(0, -1) : resource;
    headerTitle = `Edit ${singular.charAt(0).toUpperCase() + singular.slice(1)}`;
    showBack = true;
    backUrl = pathname.split('/').slice(0, -2).join('/');
  } else if (isIdPage) {
    const segments = pathname.split('/');
    const resource = segments[segments.length - 2];
    const singular = resource.endsWith('s') ? resource.slice(0, -1) : resource;
    headerTitle = `${singular.charAt(0).toUpperCase() + singular.slice(1)} Details`;
    showBack = true;
    backUrl = pathname.split('/').slice(0, -1).join('/');
  } else {
    // Manage Page - Default to Seller Panel for header
    headerTitle = "Seller Panel";
  }

  // If it's a public path, return children without the seller layout
  if (isPublicPath) {
    return children;
  }
  if (auth.loading) {
    return <ScreenSpinner visible={true} backdrop="light"/>;
  } else if (!auth.loggedIn) {
    auth.redirectToLogin();
    return null;
  } else if (!auth.user?.isSeller) {
    auth.redirectToSellerRegistration();
    return null;
  } else {
    // Otherwise, return the full seller layout
    return (
      <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
        {/* Full width topbar */}
        <SellerTopbar 
          onMenuClick={() => setSidebarOpen(true)} 
          title={headerTitle}
          showBack={showBack}
          backUrl={backUrl}
        />

        {/* Sidebar */}
        <SellerSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content with left margin for desktop sidebar */}
        <div className="lg:pl-64">
          <main className="p-2 sm:p-4">{children}</main>
        </div>

        {!isFormPage && (
            <BottomNav items={primaryNav} moreItems={secondaryNav} />
        )}
      </div>
    );
  }
}
