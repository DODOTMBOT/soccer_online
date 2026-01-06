import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/admin/Sidebar"; // Теперь это горизонтальный Navbar
import { notFound } from "next/navigation";
import { 
  ArrowLeft, 
  Trophy, 
  Users, 
  Map as MapIcon, 
  ChevronRight,
  Plus,
  Globe,
  Settings
} from "lucide-react";
import Link from "next/link";

export default async function CountryDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const country = await prisma.country.findUnique({
    where: { id },
    include: {
      leagues: {
        orderBy: { level: 'asc' },
        include: { _count: { select: { teams: true } } }
      },
      _count: { select: { teams: true, players: true } }
    }
  });

  if (!country) notFound();

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans">
      {/* Горизонтальное меню сверху */}
      <Sidebar />

      {/* SUB-HEADER (Breadcrumbs & Actions) */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 shrink-0">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/countries/list" className="text-gray-400 hover:text-[#000c2d] transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-3">
              {country.flag && (
                <img src={country.flag} alt="" className="w-8 h-5 object-cover border border-gray-100 shadow-sm" />
              )}
              <h1 className="text-xl font-black uppercase tracking-tighter italic text-[#000c2d]">
                {country.name} <span className="text-[#e30613] text-sm ml-2">[{country.confederation}]</span>
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-gray-400 hover:text-[#1a3151] transition-colors border border-gray-100 rounded-sm">
              <Settings size={16} />
            </button>
            <Link 
              href="/admin/leagues/new" 
              className="bg-[#000c2d] text-white px-6 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-[#e30613] transition-all flex items-center gap-2"
            >
              <Plus size={14} /> Новый дивизион
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-[1200px] mx-auto space-y-8">
          
          {/* Статистическая панель (Transfermarkt Style) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 border-b-2 border-[#1a3151] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-[#1a3151] rounded-sm flex items-center justify-center italic font-black text-xl">D</div>
              <div>
                <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Иерархия</p>
                <p className="text-xl font-black italic">{country.leagues.length} Дивизионов</p>
              </div>
            </div>
            <div className="bg-white p-6 border-b-2 border-emerald-500 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-sm flex items-center justify-center"><Trophy size={24}/></div>
              <div>
                <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Общий охват</p>
                <p className="text-xl font-black italic">{country._count.teams} Команд</p>
              </div>
            </div>
            <div className="bg-white p-6 border-b-2 border-orange-500 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-sm flex items-center justify-center"><Users size={24}/></div>
              <div>
                <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Кадры</p>
                <p className="text-xl font-black italic">{country._count.players} Игроков</p>
              </div>
            </div>
          </div>

          {/* Список лиг (Hierarchy Table) */}
          <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#1a3151] px-6 py-3 flex justify-between items-center">
              <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Структура национальных лиг</h2>
              <Globe size={14} className="text-white/40" />
            </div>

            <div className="divide-y divide-gray-100">
              {country.leagues.map((league) => (
                <Link 
                  href={`/admin/leagues/${league.id}`} 
                  key={league.id} 
                  className="flex items-center justify-between p-5 hover:bg-gray-50 transition-all group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-sm flex items-center justify-center font-black text-[#1a3151] group-hover:bg-[#000c2d] group-hover:text-white transition-all text-xs">
                      D{league.level}
                    </div>
                    <div>
                      <p className="font-bold text-sm uppercase text-[#1a3151] group-hover:text-[#e30613] transition-colors">{league.name}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Лимит: {league.teamsCount} команд</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-10">
                    <div className="text-right">
                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Заполнение</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black italic uppercase tracking-tighter ${league._count.teams >= league.teamsCount ? 'text-[#e30613]' : 'text-emerald-600'}`}>
                            {league._count.teams} / {league.teamsCount} Клубов
                          </span>
                          <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${league._count.teams >= league.teamsCount ? 'bg-[#e30613]' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, (league._count.teams / league.teamsCount) * 100)}%` }}
                            />
                          </div>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-[#000c2d] transition-colors" />
                  </div>
                </Link>
              ))}
              
              {country.leagues.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] italic">
                    В этой стране еще не создано ни одного дивизиона
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}