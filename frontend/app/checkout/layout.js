import { CheckoutProvider } from '@/hooks/useCheckoutState';

export default function CheckoutRootLayout({ children }) {
  return <CheckoutProvider>{children}</CheckoutProvider>;
}
