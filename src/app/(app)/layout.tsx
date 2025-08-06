import type { ReactNode } from 'react';
import Header from '@/components/shared/Header';

// 1. Import the Font Awesome CSS
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
// 2. Tell Font Awesome to skip adding the CSS automatically since it's already imported
config.autoAddCss = false;

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
       {/* Optional Footer */}
       {/* <footer className="py-6 md:px-8 md:py-0">
         <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
           <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
             © {new Date().getFullYear()} QuizMaster Pro. All rights reserved.
           </p>
         </div>
       </footer> */}
    </div>
  );
}
