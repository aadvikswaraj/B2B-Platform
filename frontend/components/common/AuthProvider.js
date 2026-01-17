"use client";
import React, { useEffect, useState } from 'react';
import { AuthContext } from '@/context/context.js';
import AuthAPI from '@/utils/api/auth';

function AuthProvider({ children }) {
  const [auth, setAuth] = useState({ loggedIn: false, user: null, loading: true, redirectToLogin: () => window.location.replace('/login'), redirectToSellerRegistration: () => window.location.replace('/seller/registration') });

  useEffect(() => {
    (async () => {
      try {
        const response = await AuthAPI.checkStatus();
        const loggedIn = !!(response?.data?.isLoggedIn ?? response?.loggedIn);
        const user = response?.data?.user || response?.user || null;
        setAuth(prev => ({ ...prev, loggedIn, user, loading: false }));
      } catch (e) {
        setAuth(prev => ({ ...prev, loggedIn: false, loading: false }));
      }
    })();
  }, []);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;