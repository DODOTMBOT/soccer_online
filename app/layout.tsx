import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from '@/components/Providers';
import { Toaster } from 'react-hot-toast';

// Настройка Inter для спортивного стиля (более плотное начертание)
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: "Soccer Engine | Transfermarkt Dashboard",
  description: "Advanced soccer simulation and management interface",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="scroll-smooth">
      <body className={`${inter.variable} antialiased selection:bg-[#e30613] selection:text-white`}>
        <NextAuthProvider>
          <Toaster 
            position="top-center"
            toastOptions={{
              className: 'tm-card !text-xs !font-bold',
              style: { borderRadius: '4px' }
            }}
          />
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}