import { api } from './base';

const base = '/buyer/cart';
  
export const getCart = async () => {
  return await api(base, { method: 'GET' });
};

export const getCartCount = async () => {
  return await api(base + '/count', { method: 'GET' });
};

export const addToCart = async (productId, quantity) => {
  return await api(base, {
    method: 'POST',
    body: { product: productId, quantity }
  });
};

export const updateQuantity = async (productId, quantity) => {
  return await api(base + '/' + productId, {
    method: 'PUT',
    body: { quantity }
  });
};

export const removeFromCart = async (productId) => {
  return await api(base + '/' + productId, { method: 'DELETE' });
};

export const clearCart = async () => {
  return await api(base, { method: 'DELETE' });
};
