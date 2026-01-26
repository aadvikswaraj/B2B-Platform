"use client";

import { useContext } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import UnauthorisedScreen from "@/components/admin/UnauthorisedScreen";
import { AuthContext } from "@/context/context";
import { ScreenSpinner } from "@/components/ui/ScreenSpinner";
import BottomNav from "@/components/common/BottomNav";
import {
  HomeIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: HomeIcon },
  { name: "Users", href: "/admin/users", icon: UserGroupIcon },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: ClipboardDocumentListIcon,
  },
  {
    name: "Order Mgmt",
    href: "/admin/order-management",
    icon: ShoppingBagIcon,
  },
  { name: "Content", href: "/admin/content", icon: DocumentTextIcon },
  { name: "Roles", href: "/admin/roles", icon: ShieldCheckIcon },
  {
    name: "Sellers",
    href: "/admin/seller-verification",
    icon: ShieldCheckIcon,
  },
  {
    name: "Products",
    href: "/admin/product-verification",
    icon: ShieldCheckIcon,
  },
  { name: "Brands", href: "/admin/brand-verification", icon: ShieldCheckIcon },
  { name: "Buy Reqs", href: "/admin/buy-requirements", icon: ShieldCheckIcon },
];

export default function AdminLayout({ children }) {
  let auth = useContext(AuthContext);
  const pathname = usePathname();

  // Check for ID at the end of path (24 hex chars)
  const isIdPage = /[0-9a-fA-F]{24}$/.test(pathname);

  // Determine if BottomNav should be hidden
  // Hide on create, edit, new, and preview (ID) pages
  const isFormPage =
    pathname.includes("/create") ||
    pathname.includes("/edit") ||
    pathname.includes("/new") ||
    isIdPage;

  const primaryNav = navigation.slice(0, 4);
  const secondaryNav = navigation.slice(4);

  // Header Config
  let headerTitle = "Admin Panel";
  let showBack = false;
  let backUrl = "#";

  const formatTitle = (str) => {
    return str
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (pathname === "/admin") {
    headerTitle = "Dashboard";
  } else if (pathname.endsWith("/new")) {
    const segments = pathname.split("/");
    const resource = segments[segments.length - 2];
    const singular = resource.endsWith("s") ? resource.slice(0, -1) : resource;
    headerTitle = `New ${formatTitle(singular)}`;
    showBack = true;
    backUrl = pathname.replace("/new", "");
  } else if (pathname.endsWith("/create")) {
    const segments = pathname.split("/");
    const resource = segments[segments.length - 2];
    const singular = resource.endsWith("s") ? resource.slice(0, -1) : resource;
    headerTitle = `New ${formatTitle(singular)}`;
    showBack = true;
    backUrl = pathname.replace("/create", "");
  } else if (pathname.endsWith("/edit")) {
    const segments = pathname.split("/");
    const resource = segments[segments.length - 3];
    const singular = resource.endsWith("s") ? resource.slice(0, -1) : resource;
    headerTitle = `Edit ${formatTitle(singular)}`;
    showBack = true;
    backUrl = pathname.split("/").slice(0, -2).join("/");
  } else if (isIdPage) {
    const segments = pathname.split("/");
    const resource = segments[segments.length - 2];
    const singular = resource.endsWith("s") ? resource.slice(0, -1) : resource;
    headerTitle = `${formatTitle(singular)} Details`;
    showBack = true;
    backUrl = pathname.split("/").slice(0, -1).join("/");
  } else {
    // Manage Page - Infer title from path
    const segments = pathname.split("/");
    const resource = segments[segments.length - 1];
    headerTitle = formatTitle(resource);
  }

  if (auth.loading) {
    return <ScreenSpinner visible={true} backdrop="light" />;
  } else if (!auth.loggedIn) {
    auth.redirectToLogin();
    return null;
  } else if (!auth.user?.isAdmin) {
    return <UnauthorisedScreen />;
  } else {
    return (
      <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
        {/* Full width topbar */}
        <AdminTopbar
          title={headerTitle}
          showBack={showBack}
          backUrl={backUrl}
        />

        {/* Sidebar */}
        <AdminSidebar />

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
