import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import SessionProvider from './SessionProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AuthStatusPopup } from '@/components/AuthStatusPopup'; // Import the new component

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PassExam',
  description: 'A full-featured quiz platform for NISM certification.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
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