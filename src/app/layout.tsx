import type {Metadata} from 'next';
import {Geist} from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'QuizMaster Pro',
  description: 'A full-featured quiz platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Font Awesome Kit script */}
        <script
          src="https://kit.fontawesome.com/f70334b4f8.js"
          crossOrigin="anonymous"
          async
        ></script>
      </head>
      <body className={`${geistSans.variable} antialiased`} suppressHydrationWarning={true}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
