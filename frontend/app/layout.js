import Navbar from "../components/buyer/Navbar";
import "./globals.css";

export const metadata = {
  title: "B2B Platform",
  description: "Your B2B Trading Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
