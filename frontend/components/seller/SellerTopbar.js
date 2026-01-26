'use client';

import DashboardTopbar from '@/components/common/DashboardTopbar';

export default function SellerTopbar({ 
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
