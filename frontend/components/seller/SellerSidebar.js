"use client";

import DashboardSidebar from "@/components/common/DashboardSidebar";
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
  Cog6ToothIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/seller", icon: HomeIcon },
  {
    name: "Products",
    href: "/seller/products",
    icon: ShoppingBagIcon,
    badge: "12",
  },
  { name: "Brands", href: "/seller/brands", icon: TagIcon },
  {
    name: "Buy Leads",
    href: "/seller/buyleads",
    icon: QuestionMarkCircleIcon,
    badge: "3",
  },
  { name: "Orders", href: "/seller/orders", icon: ClipboardDocumentListIcon },
  {
    name: "Messages",
    href: "/seller/messages",
    icon: ChatBubbleLeftRightIcon,
    badge: "5",
  },
  { name: "Inquiries", href: "/seller/inquiries", icon: InboxIcon },
  { name: "Store", href: "/seller/store", icon: BuildingStorefrontIcon },

  { name: "Payouts", href: "/seller/payouts", icon: CreditCardIcon },
  { name: "Settings", href: "/seller/settings", icon: Cog6ToothIcon },
];

export default function SellerSidebar() {
  return <DashboardSidebar navigation={navigation} brandColor="emerald" />;
}
