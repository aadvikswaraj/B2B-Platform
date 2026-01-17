import { api, generateQuery } from '@/utils/api/base';

// TODO: Connect to real backend endpoint when available
// const path = '/admin/orders';

const mockOrders = [
  {
    _id: 'ORD-001',
    buyer: {
      name: 'John Doe',
      company: 'ABC Corp',
    },
    seller: {
      name: 'XYZ Electronics',
    },
    items: [
      { name: 'Wireless Headphones', quantity: 2, price: 99.99 },
      { name: 'USB Cable', quantity: 5, price: 9.99 },
    ],
    total: 249.93,
    status: 'processing',
    paymentStatus: 'paid',
    createdAt: '2025-08-08T10:00:00Z',
  },
  {
    _id: 'ORD-002',
    buyer: {
      name: 'Jane Smith',
      company: 'Globe Traders',
    },
    seller: {
      name: 'Best Deal Inc',
    },
    items: [
      { name: 'Office Chair', quantity: 1, price: 150.00 },
    ],
    total: 150.00,
    status: 'delivered',
    paymentStatus: 'paid',
    createdAt: '2025-08-07T14:30:00Z',
  },
  {
    _id: 'ORD-003',
    buyer: {
      name: 'Bob Johnson',
      company: 'Tech Solutions',
    },
    seller: {
      name: 'XYZ Electronics',
    },
    items: [
      { name: 'Monitor 24"', quantity: 10, price: 120.00 },
    ],
    total: 1200.00,
    status: 'shipped',
    paymentStatus: 'paid',
    createdAt: '2025-08-06T09:15:00Z',
  }
];

export const OrdersAPI = {
  list: async (params = {}) => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulating filtering if needed, or just returning all for now
    let docs = [...mockOrders];
    
    // Parse filters from params if they exist as string
    let filters = {};
    if (params.filters) {
       try {
         filters = typeof params.filters === 'string' ? JSON.parse(params.filters) : params.filters;
       } catch (e) {}
    }

    if (filters.status) {
      docs = docs.filter(o => o.status === filters.status);
    }
    
    return {
      success: true,
      data: {
        docs,
        totalCount: docs.length,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        totalPages: 1
      }
    };
  },
  
  get: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const order = mockOrders.find(o => o._id === id);
    return {
      success: !!order,
      data: order,
      message: order ? 'Success' : 'Order not found'
    };
  }
};

export default OrdersAPI;
