// Mock dashboard data for admin panel

const mockData = {
  revenue: {
    total: 125000,
    change: 12.5,
    data: [10000, 15000, 12000, 18000, 20000, 22000, 25000],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  orders: {
    total: 1250,
    change: 8.3,
    data: [150, 180, 165, 200, 185, 220, 250],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  users: {
    total: 5420,
    change: 15.2,
    distribution: {
      data: [2500, 1800, 1120],
      labels: ['Buyers', 'Sellers', 'Admins'],
      colors: ['#3B82F6', '#10B981', '#F59E0B']
    }
  },
  products: {
    total: 8950,
    change: 6.7,
    categories: {
      data: [1200, 980, 850, 760, 650, 540],
      labels: ['Electronics', 'Machinery', 'Textiles', 'Chemicals', 'Food', 'Others']
    }
  }
};

export default mockData;
