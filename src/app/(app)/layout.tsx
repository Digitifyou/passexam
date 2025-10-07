import { Sidebar } from "@/components/ui/sidebar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The wrapper div and old Header have been removed. 
    // The new layout is handled by the root layout.tsx and the sidebar.
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        {children}
      </div>
    </div>
  );
}