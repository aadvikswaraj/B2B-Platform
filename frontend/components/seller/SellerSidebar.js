'use client';

import DashboardSidebar from '@/components/common/DashboardSidebar';
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

const navigation = [
  { name: 'Dashboard', href: '/seller', icon: HomeIcon },
  { name: 'Products', href: '/seller/products', icon: ShoppingBagIcon, badge: '12' },
  { name: 'Brands', href: '/seller/brands', icon: TagIcon },
  { name: 'Buy Leads', href: '/seller/buyleads', icon: QuestionMarkCircleIcon, badge: '3' },
  { name: 'Orders', href: '/seller/orders', icon: ClipboardDocumentListIcon },
  { name: 'Messages', href: '/seller/messages', icon: ChatBubbleLeftRightIcon, badge: '5' },
  { name: 'Store', href: '/seller/store', icon: BuildingStorefrontIcon },
  { name: 'Ads', href: '/seller/ads', icon: MegaphoneIcon },
  { name: 'Analytics', href: '/seller/analytics', icon: ChartBarIcon },
  { name: 'Payouts', href: '/seller/payouts', icon: CreditCardIcon },
  { name: 'Settings', href: '/seller/settings', icon: Cog6ToothIcon },
];

export default function SellerSidebar({ isOpen, onClose }) {
  return (
    <DashboardSidebar
      isOpen={isOpen}
      onClose={onClose}
      title="Seller Panel"
      navigation={navigation}
      brandColor="emerald"
      logo="/logo/logo-s-1.png"
    />
  );
}
