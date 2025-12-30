import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { PulseBackground } from "./PulseBackground";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <PulseBackground intensity="calm" />
      <Sidebar />
      <main className="relative z-10 ml-64 min-h-screen p-8">
        {children}
      </main>
    </div>
  );
}
