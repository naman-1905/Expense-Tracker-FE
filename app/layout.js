import { Geist, Manrope } from "next/font/google";
import "./globals.css";
import { CurrencyProvider } from './context/CurrencyContext'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Pocket Finance — Personal Money Tracker",
  description: "A private, local-first finance tracker that works offline.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f3f4ef',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${manrope.variable} antialiased`}
      >
        <CurrencyProvider>
        {children}
        </CurrencyProvider>
      </body>
    </html>
  );
}
