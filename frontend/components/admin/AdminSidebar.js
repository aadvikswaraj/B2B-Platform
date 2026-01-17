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
  { name: 'Categories', href: '/admin/categories', icon: ClipboardDocumentListIcon },
  { name: 'Orders', href: '/admin/orders', icon: ClipboardDocumentListIcon },
  { name: 'Content', href: '/admin/content', icon: DocumentTextIcon },
  { name: 'Roles & Access', href: '/admin/roles', icon: ShieldCheckIcon },
  { name: 'Seller Verification', href: '/admin/seller-verification', icon: ShieldCheckIcon },
  { name: 'Product Verification', href: '/admin/product-verification', icon: ShieldCheckIcon },
  { name: 'Brand Verification', href: '/admin/brand-verification', icon: ShieldCheckIcon },
  { name: 'Buy Requirements', href: '/admin/buy-requirements', icon: ShieldCheckIcon },
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