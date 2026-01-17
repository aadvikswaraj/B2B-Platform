'use client';

import DashboardTopbar from '@/components/common/DashboardTopbar';

export default function SellerTopbar({ 
  onMenuClick,
  title = "Seller Panel",
  showBack = false,
  backUrl = "#"
}) {
  const user = {
    name: 'Seller User',
    role: 'Seller',
    avatar: null
  };

  return (
    <DashboardTopbar
      onMenuClick={onMenuClick}
      title={title}
      panelTitle="Seller Panel"
      user={user}
      notifications={5}
      brandColor="emerald"
      logo="/logo/logo-s-2.png"
      showBack={showBack}
      backUrl={backUrl}
    />
  );
}
