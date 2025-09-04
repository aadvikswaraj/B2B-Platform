import { AlertProvider } from '@/components/ui/AlertManager';

export default function App({ Component, pageProps }) {
  return (
    <AlertProvider>
      <Component {...pageProps} />
    </AlertProvider>
  );
}