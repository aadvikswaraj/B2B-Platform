'use client';

import DashboardSidebar from '@/components/common/DashboardSidebar';
import {
  HomeIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  ChartPieIcon,
  MegaphoneIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'User Management', href: '/admin/users', icon: UserGroupIcon },
  { name: 'Products', href: '/admin/products', icon: ShoppingBagIcon },
  { name: 'Categories', href: '/admin/categories', icon: ClipboardDocumentListIcon },
  { name: 'Orders', href: '/admin/orders', icon: ClipboardDocumentListIcon },
  { name: 'RFQs', href: '/admin/rfqs', icon: DocumentTextIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartPieIcon },
  { name: 'Advertising', href: '/admin/advertising', icon: MegaphoneIcon },
  { name: 'Content', href: '/admin/content', icon: DocumentTextIcon },
  { name: 'Support', href: '/admin/support', icon: ChatBubbleLeftRightIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  { name: 'Roles & Access', href: '/admin/roles', icon: ShieldCheckIcon },
];

export default function AdminSidebar({ isOpen, onClose }) {
  return (
    <DashboardSidebar
      isOpen={isOpen}
      onClose={onClose}
      title="Admin Panel"
      navigation={navigation}
      brandColor="blue"
      logo="/logo/logo-s-1.png"
    />
  );
}
