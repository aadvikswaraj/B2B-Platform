'use client';

import DashboardTopbar from '@/components/common/DashboardTopbar';

export default function SellerTopbar({ onMenuClick }) {
  const user = {
    name: 'Seller User',
    role: 'Seller',
    avatar: null
  };

  return (
    <DashboardTopbar
      onMenuClick={onMenuClick}
      title="Seller Panel"
      user={user}
      notifications={5}
      brandColor="emerald"
      logo="/logo/logo-s-2.png"
    />
  );
}
