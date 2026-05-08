import type { ReactNode } from 'react';

interface DashboardLayoutProps {
  header: ReactNode;
  children: ReactNode;
}

export default function DashboardLayout({ header, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-800">
      {header}
      <main className="pt-[60px]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-5">
          {children}
        </div>
      </main>
    </div>
  );
}
