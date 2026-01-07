import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/src/server/db"; // Путь к вашему клиенту Prisma
import { 
  Users, Trophy, Activity, ChevronRight, 
  MapPin, ShieldAlert, Zap, Clock 
} from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/admin/Sidebar";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  // 1. Получаем реальную статистику из БД
  const [userCount, leagueCount, teamCount, latestUsers, activeSeason] = await Promise.all([
    prisma.user.count(),
    prisma.league.count(),
    prisma.team.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, createdAt: true, role: true }
    }),
    prisma.season.findFirst({
      where: { status: 'ACTIVE' }
    })
  ]);

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans text-[#000c2d]">
      <Sidebar />

      {/* MATCH TICKER (Теперь можно выводить статус сервера) */}
      <div className="bg-[#e1e8ed] h-12 flex items-center gap-1 border-b border-gray-300 overflow-hidden px-4 shrink-0">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <Zap size={14} className="text-emerald-500" />
          Система мониторинга: Все модули работают штатно
        </div>
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
                {session.user?.name} • Главный администратор системы
              </p>
            </div>
            
            {activeSeason && (
              <div className="bg-white px-6 py-3 border border-gray-200 shadow-sm">
                <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Текущий сезон</span>
                <span className="text-[12px] font-black text-[#e30613] uppercase">
                  {activeSeason.year} Season
                </span>
              </div>
            )}
          </header>

          <div className="grid grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Stats & Latest Activities */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              
              {/* Сетка основных показателей */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 border-b-4 border-[#1a3151] shadow-sm">
                  <Users size={20} className="text-[#1a3151] mb-4" />
                  <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Пользователей</h3>
                  <p className="text-3xl font-black italic leading-none">{userCount.toLocaleString()}</p>
                </div>

                <div className="bg-white p-6 border-b-4 border-[#e30613] shadow-sm">
                  <Trophy size={20} className="text-[#e30613] mb-4" />
                  <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Лиг в базе</h3>
                  <p className="text-3xl font-black italic leading-none">{leagueCount}</p>
                </div>

                <div className="bg-white p-6 border-b-4 border-emerald-500 shadow-sm">
                  <ShieldAlert size={20} className="text-emerald-500 mb-4" />
                  <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Всего команд</h3>
                  <p className="text-3xl font-black italic leading-none">{teamCount}</p>
                </div>
              </div>

              {/* ТАБЛИЦА ПОСЛЕДНИХ РЕГИСТРАЦИЙ */}
              <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-[#1a3151] px-6 py-3 flex justify-between items-center">
                  <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Новые пользователи</h2>
                  <Link href="/admin/users" className="text-[9px] font-black uppercase text-white/50 hover:text-white transition-all">Управление</Link>
                </div>
                <div className="divide-y divide-gray-100">
                  {latestUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gray-100 border border-gray-200 rounded-sm flex items-center justify-center font-black text-[#1a3151] text-[10px]">
                          {user.role === 'ADMIN' ? 'AD' : 'PL'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#000c2d] uppercase">{user.name || user.email}</p>
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">
                            <Clock size={8} className="inline mr-1" />
                            {new Date(user.createdAt).toLocaleString('ru-RU')}
                          </p>
                        </div>
                      </div>
                      <Link href={`/admin/users/${user.id}`} className="flex items-center gap-1 text-[9px] font-black uppercase text-gray-300 group-hover:text-[#e30613] transition-all">
                        Профиль <ChevronRight size={14} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Управление и Быстрые ссылки */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              
              {/* STATUS БАННЕР */}
              <div className="bg-[#000c2d] p-8 text-white relative overflow-hidden shadow-xl">
                 <div className="relative z-10">
                    <p className="text-[#e30613] text-[10px] font-black uppercase tracking-[0.3em] mb-4">Управление сезонами</p>
                    <h3 className="text-xl font-black uppercase italic mb-6 leading-tight">
                      {activeSeason ? `Идет сезон ${activeSeason.year}` : 'Сезон не запущен'}
                    </h3>
                    <Link href="/admin/seasons" className="inline-block bg-[#e30613] text-white px-6 py-3 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-[#000c2d] transition-all">
                       {activeSeason ? 'Перейти к сезону' : 'Начать новый сезон'}
                    </Link>
                 </div>
                 <div className="absolute -right-6 -bottom-6 text-7xl font-black text-white/5 italic select-none">SEASON</div>
              </div>

              {/* QUICK LINKS - Теперь ведут на реальные страницы */}
              <div className="bg-white border border-gray-200 p-6 shadow-sm">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-[#000c2d] mb-4 border-b border-gray-100 pb-2">Управление данными</h4>
                 <div className="grid grid-cols-1 gap-2">
                    <Link href="/admin/countries/list" className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-sm text-[10px] font-bold uppercase transition-all">
                       <span className="flex items-center gap-2"><MapPin size={12}/> Реестр стран</span>
                       <ChevronRight size={14} className="text-gray-300" />
                    </Link>
                    <Link href="/admin/leagues/new" className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-sm text-[10px] font-bold uppercase transition-all">
                       <span className="flex items-center gap-2"><Trophy size={12}/> Создать лигу</span>
                       <ChevronRight size={14} className="text-gray-300" />
                    </Link>
                    <Link href="/admin/teams/list" className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-sm text-[10px] font-bold uppercase transition-all">
                       <span className="flex items-center gap-2"><ShieldAlert size={12}/> Список команд</span>
                       <ChevronRight size={14} className="text-gray-300" />
                    </Link>
                    <Link href="/admin/players/new" className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-sm text-[10px] font-bold uppercase transition-all">
                       <span className="flex items-center gap-2"><Users size={12}/> Создать игрока</span>
                       <ChevronRight size={14} className="text-gray-300" />
                    </Link>
                 </div>
              </div>

              {/* FOOTER WIDGET */}
              <div className="bg-white border border-gray-200 p-4 shadow-sm text-center">
                 <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Football Manager Engine v1.0.4</p>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}