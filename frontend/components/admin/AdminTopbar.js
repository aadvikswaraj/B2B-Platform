'use client';

import DashboardTopbar from '@/components/common/DashboardTopbar';

export default function AdminTopbar({ 
  onMenuClick,
  title = "Admin Panel",
  showBack = false,
  backUrl = "#"
}) {
  const user = {
    name: 'Admin User',
    role: 'Administrator',
    avatar: '/product-image.jpg'
  };

  return (
    <DashboardTopbar
      onMenuClick={onMenuClick}
      title={title}
      panelTitle="Admin Panel"
      user={user}
      notifications={3}
      brandColor="blue"
      logo="/logo/logo-s-1.png"
      showBack={showBack}
      backUrl={backUrl}
    />
  );
}
