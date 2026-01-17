"use client";
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import store from '@/app/store';
import AuthProvider from '@/components/common/AuthProvider';
import { AlertProvider } from '@/components/ui/AlertManager';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      {/* <ReduxProvider store={store}> */}
        <AlertProvider>
          {children}
        </AlertProvider>
      {/* </ReduxProvider> */}
    </AuthProvider>
  );
}