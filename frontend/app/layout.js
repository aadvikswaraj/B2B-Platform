import "./globals.css";
import Providers from "@/app/providers";
import TopProgressBar from "@/components/ui/TopProgressBar";
import BottomNav from "@/components/layout/BottomNav";

export const metadata = {
  title: "B2B Platform",
  description: "Your B2B Trading Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <TopProgressBar />
        <Providers>
          {children}
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
