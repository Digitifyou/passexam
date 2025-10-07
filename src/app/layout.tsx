import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Changed from Geist to Inter
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import SessionProvider from './SessionProvider';
import Header from '@/components/layout/Header'; // Import Header
import Footer from '@/components/layout/Footer'; // Import Footer

const inter = Inter({ subsets: ['latin'] }); // Use Inter font

export const metadata: Metadata = {
  title: 'NISM Certify Pro',
  description: 'A full-featured quiz platform for NISM certification.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}> {/* Use Inter font class */}
        <SessionProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}