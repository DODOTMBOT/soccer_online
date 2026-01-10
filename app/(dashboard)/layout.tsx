import React from "react";
import { Sidebar } from "@/components/admin/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#f2f5f7] overflow-hidden">
      {/* Левая колонка: Вертикальное меню */}
      <aside className="w-64 bg-[#000c2d] text-white flex-shrink-0 h-full overflow-y-auto border-r border-white/10">
        <Sidebar />
      </aside>

      {/* Правая колонка: Контент */}
      <main className="flex-1 overflow-y-auto h-full relative">
        <div className="max-w-[1600px] mx-auto p-6 md:p-10 pb-20">
          {children}
        </div>
      </main>
    </div>
  );
}