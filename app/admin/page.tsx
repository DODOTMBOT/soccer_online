import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LayoutDashboard, Users, Trophy, Settings, Activity, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/admin/Sidebar"; // Наш горизонтальный Navbar

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans text-[#000c2d]">
      {/* Горизонтальный Navbar сверху */}
      <Sidebar />

      {/* MATCH TICKER (Декоративная лента как на скрине) */}
      <div className="bg-[#e1e8ed] h-12 flex items-center gap-1 border-b border-gray-300 overflow-hidden px-4 shrink-0">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="min-w-[160px] bg-white h-8 rounded-sm border border-gray-200 flex items-center justify-between px-3 text-[9px] font-bold shadow-sm">
            <div className="flex flex-col gap-0.5 leading-none">
              <div className="flex justify-between w-20"><span>ARS</span> <span>2</span></div>
              <div className="flex justify-between w-20 text-gray-400"><span>CHE</span> <span>0</span></div>
            </div>
            <span className="text-[#e30613] ml-2">88'</span>
          </div>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1200px] mx-auto p-8">
          
          {/* HEADER SECTION */}
          <header className="flex justify-between items-end mb-8 border-b border-gray-200 pb-6">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none mb-2 text-[#000c2d]">
                Рабочий <span className="text-[#e30613]">стол</span>
              </h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Авторизован: <span className="text-[#000c2d]">{session.user?.name}</span> • Администратор системы
              </p>
            </div>
            
            <div className="bg-white px-6 py-3 border border-gray-200 shadow-sm flex items-center gap-6">
               <div className="text-right">
                  <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</span>
                  <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center justify-end gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Server Online
                  </span>
               </div>
            </div>
          </header>

          <div className="grid grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Stats & Widgets */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              
              {/* Сетка основных показателей */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 border-b-4 border-[#1a3151] shadow-sm group hover:bg-[#1a3151] transition-all">
                  <Users size={20} className="text-[#1a3151] group-hover:text-white mb-4" />
                  <h3 className="text-[9px] font-black text-gray-400 group-hover:text-white/60 uppercase tracking-widest mb-1">Всего игроков</h3>
                  <p className="text-3xl font-black italic group-hover:text-white leading-none">1,284</p>
                </div>

                <div className="bg-white p-6 border-b-4 border-[#e30613] shadow-sm group hover:bg-[#e30613] transition-all">
                  <Trophy size={20} className="text-[#e30613] group-hover:text-white mb-4" />
                  <h3 className="text-[9px] font-black text-gray-400 group-hover:text-white/60 uppercase tracking-widest mb-1">Активных лиг</h3>
                  <p className="text-3xl font-black italic group-hover:text-white leading-none">12</p>
                </div>

                <div className="bg-white p-6 border-b-4 border-emerald-500 shadow-sm group hover:bg-emerald-500 transition-all">
                  <Activity size={20} className="text-emerald-500 group-hover:text-white mb-4" />
                  <h3 className="text-[9px] font-black text-gray-400 group-hover:text-white/60 uppercase tracking-widest mb-1">Запросы модерации</h3>
                  <p className="text-3xl font-black italic group-hover:text-white leading-none">5</p>
                </div>
              </div>

              {/* ТАБЛИЦА РЕГИСТРАЦИЙ (Transfermarkt Style) */}
              <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-[#1a3151] px-6 py-3 flex justify-between items-center">
                  <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Последние регистрации</h2>
                  <Link href="/admin/users" className="text-[9px] font-black uppercase text-white/50 hover:text-white transition-all">Смотреть всех</Link>
                </div>
                <div className="divide-y divide-gray-100">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gray-100 border border-gray-200 rounded-sm flex items-center justify-center font-black text-gray-400 text-[10px]">
                          0{i}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#000c2d] uppercase">new_player_{i}@soccer.hub</p>
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Дата регистрации: Сегодня, 12:45</p>
                        </div>
                      </div>
                      <button className="flex items-center gap-1 text-[9px] font-black uppercase text-gray-300 group-hover:text-[#e30613] transition-all">
                        Управление <ChevronRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Info Panel */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              
              {/* МИНИ-БАННЕР */}
              <div className="bg-[#000c2d] p-8 text-white relative overflow-hidden shadow-xl">
                 <div className="relative z-10">
                    <p className="text-[#e30613] text-[10px] font-black uppercase tracking-[0.3em] mb-4">System Update</p>
                    <h3 className="text-xl font-black uppercase italic mb-6 leading-tight">Движок MatchGen v1.0.4 готов к работе</h3>
                    <Link href="/admin/leagues/new" className="inline-block bg-[#e30613] text-white px-6 py-3 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-[#000c2d] transition-all">
                       Запустить сезон
                    </Link>
                 </div>
                 <div className="absolute -right-6 -bottom-6 text-7xl font-black text-white/5 italic select-none">ENGINE</div>
              </div>

              {/* QUICK LINKS */}
              <div className="bg-white border border-gray-200 p-6 shadow-sm">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-[#000c2d] mb-4 border-b border-gray-100 pb-2">Быстрый доступ</h4>
                 <div className="grid grid-cols-1 gap-2">
                    <Link href="/admin/players/new" className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-sm text-[10px] font-bold uppercase transition-all">
                       <span>Создать атлета</span>
                       <ChevronRight size={14} className="text-gray-300" />
                    </Link>
                    <Link href="/admin/teams/new" className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-sm text-[10px] font-bold uppercase transition-all">
                       <span>Регистрация клуба</span>
                       <ChevronRight size={14} className="text-gray-300" />
                    </Link>
                 </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}