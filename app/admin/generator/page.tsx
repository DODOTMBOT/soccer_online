import { prisma } from "@/src/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/auth";
import { redirect } from "next/navigation";
import { LayoutDashboard, Swords } from "lucide-react";
import Link from "next/link";
import MatchEngine from "./MatchEngine";

export default async function GeneratorPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") redirect("/");

  const teams = await prisma.team.findMany({
    include: { players: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex font-sans">
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col p-6 shrink-0">
        <div className="mb-10 px-2">
          <h2 className="text-xl font-black uppercase tracking-tighter text-slate-800">Match <span className="text-emerald-500">Gen</span></h2>
        </div>
        <nav className="space-y-2">
          <Link href="/admin" className="flex items-center gap-4 px-5 py-3 text-slate-400 hover:bg-slate-50 rounded-2xl font-bold text-xs uppercase tracking-widest"><LayoutDashboard size={18} /> Dashboard</Link>
          <Link href="/admin/generator" className="flex items-center gap-4 px-5 py-3 bg-slate-800 text-white rounded-2xl shadow-lg font-bold text-xs uppercase tracking-widest"><Swords size={18} /> Генератор</Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        <MatchEngine teams={teams} />
      </main>
    </div>
  );
}