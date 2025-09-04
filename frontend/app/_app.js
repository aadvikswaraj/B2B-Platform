import { AlertProvider, AlertContext } from '@/components/ui/AlertManager';
import { useContext } from 'react';

function DebugAlertProvider({ children }) {
  const context = useContext(AlertContext);
  console.log('Debugging AlertContext in _app.js:', context);

  return children;
}

export default function App({ Component, pageProps }) {
  console.log('Wrapping application with AlertProvider');

  return (
    <AlertProvider>
      <DebugAlertProvider>
        <Component {...pageProps} />
      </DebugAlertProvider>
    </AlertProvider>
  );
}