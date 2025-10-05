import { Geist, Poppins } from "next/font/google";
import "./globals.css";
import { CurrencyProvider } from './context/CurrencyContext'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "Expense Tracker",
  description: "A simple expense tracker made with Next.js and Tailwind CSS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${poppins.variable} antialiased`}
      >
        <CurrencyProvider>
        {children}
        </CurrencyProvider>
      </body>
    </html>
  );
}