import "./globals.css";
import { AlertProvider } from '@/components/ui/AlertManager';

export const metadata = {
  title: "B2B Platform",
  description: "Your B2B Trading Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AlertProvider>
          {children}
        </AlertProvider>
      </body>
    </html>
  )
}