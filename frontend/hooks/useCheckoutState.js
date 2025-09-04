"use client";
import { createContext, useContext, useEffect, useReducer, useMemo } from 'react';

const CheckoutContext = createContext(null);

const initialState = () => ({
  cartItems: [
    {
      id: '1', supplierId: 's1', supplierName: 'Tech Solutions Co., Ltd', name: 'Premium Widget Pro Max', qty: 2, unitPrice: 299.99, image: 'https://placehold.co/80x80'
    },
    {
      id: '2', supplierId: 's1', supplierName: 'Tech Solutions Co., Ltd', name: 'Advanced Gadget XL', qty: 1, unitPrice: 199.99, image: 'https://placehold.co/80x80'
    },
    {
      id: '3', supplierId: 's2', supplierName: 'Global Electronics Inc.', name: 'Smart Device 2000', qty: 1, unitPrice: 449.99, image: 'https://placehold.co/80x80'
    }
  ],
  addresses: [
    { id: 'addr-1', name: 'John Chen', phone: '+1 555 920 3244', line1: '123 Harbor St', city: 'Los Angeles', postalCode: '90001', country: 'USA', isDefault: true }
  ],
  selectedAddressId: 'addr-1',
  paymentMethod: null,
  orderId: null
});

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_ADDRESS':
      return { ...state, addresses: [...state.addresses, action.address], selectedAddressId: action.address.id };
    case 'SELECT_ADDRESS':
      return { ...state, selectedAddressId: action.id };
    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.method };
    case 'SET_ORDER_ID':
      return { ...state, orderId: action.orderId };
    default:
      return state;
  }
}

export function CheckoutProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  // Pricing derived each render
  const pricing = useMemo(() => {
    const itemsSubtotal = state.cartItems.reduce((s, i) => s + i.unitPrice * i.qty, 0);
    const shipping = itemsSubtotal > 0 ? 45 : 0;
    const taxes = itemsSubtotal * 0.085;
    const total = itemsSubtotal + shipping + taxes;
    return { itemsSubtotal, shipping, taxes, total };
  }, [state.cartItems]);

  const value = useMemo(() => ({ state, dispatch, pricing }), [state, pricing]);
  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error('useCheckout must be used within CheckoutProvider');
  return ctx;
}
