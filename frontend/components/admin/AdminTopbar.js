'use client';

import DashboardTopbar from '@/components/common/DashboardTopbar';

export default function AdminTopbar({ onMenuClick }) {
  const user = {
    name: 'Admin User',
    role: 'Administrator',
    avatar: '/product-image.jpg'
  };

  return (
    <DashboardTopbar
      onMenuClick={onMenuClick}
      title="Admin Panel"
      user={user}
      notifications={3}
      brandColor="blue"
      logo="/logo/logo-s-1.png"
    />
  );
}
