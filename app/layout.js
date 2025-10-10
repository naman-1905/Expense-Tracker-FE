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
  title: "Naman's Finance Tracker",
  description: "A not so simple expense tracker from Naman Chaturvedi",
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