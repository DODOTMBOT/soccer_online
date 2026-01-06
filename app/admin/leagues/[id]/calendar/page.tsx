import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/admin/Sidebar"; // Теперь это горизонтальный Navbar
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar as CalendarIcon, Trophy, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function LeagueCalendarPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ seasonId?: string }> 
}) {
  const { id } = await params;
  const { seasonId } = await searchParams;

  // 1. Загружаем сезоны
  const seasons = await prisma.season.findMany({
    orderBy: { year: 'desc' }
  });

  const activeSeasonId = seasonId || seasons[0]?.id;

  // 2. Загружаем лигу и матчи
  const league = await prisma.league.findUnique({
    where: { id },
    include: {
      country: true,
      matches: {
        where: { seasonId: activeSeasonId },
        orderBy: [
          { tour: 'asc' },
          { createdAt: 'asc' }
        ],
        include: {
          homeTeam: { select: { name: true, logo: true, id: true } },
          awayTeam: { select: { name: true, logo: true, id: true } }
        }
      }
    }
  });

  if (!league) notFound();

  // Группировка по турам
  const tours = league.matches.reduce((acc: any, match) => {
    if (!acc[match.tour]) acc[match.tour] = [];
    acc[match.tour].push(match);
    return acc;
  }, {});

  const tourNumbers = Object.keys(tours).map(Number).sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans">
      {/* Горизонтальное меню сверху */}
      <Sidebar />

      {/* SUB-HEADER (Breadcrumbs & Season Switcher) */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 shrink-0">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/admin/leagues/${id}`} className="text-gray-400 hover:text-[#000c2d] transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter italic text-[#000c2d]">
                Календарь игр: <span className="text-[#e30613]">{league.name}</span>
              </h1>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                {league.country.name} — Редактирование расписания
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-sm border border-gray-200">
            {seasons.map((s) => (
              <Link
                key={s.id}
                href={`/admin/leagues/${id}/calendar?seasonId=${s.id}`}
                className={`px-3 py-1 rounded-sm text-[9px] font-black uppercase transition-all ${
                  activeSeasonId === s.id 
                    ? "bg-[#000c2d] text-white shadow-sm" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                S{s.year % 100}
              </Link>
            ))}
            {seasons.length === 0 && (
              <span className="px-3 py-1 text-[9px] font-black text-gray-400 uppercase">Empty</span>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-[1200px] mx-auto">
          {tourNumbers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-200 shadow-sm">
              <CalendarIcon size={40} className="text-gray-200 mb-4" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] italic">
                {activeSeasonId ? "В выбранном сезоне матчи еще не созданы" : "Сезоны не найдены"}
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {tourNumbers.map((tourNum) => (
                <section key={tourNum} className="bg-white border border-gray-200 shadow-sm overflow-hidden">
                  {/* Заголовок Тура (Transfermarkt style) */}
                  <div className="bg-[#1a3151] px-6 py-2.5 flex justify-between items-center">
                    <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                      Игровой день: {tourNum}
                    </h2>
                    <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">
                      {tours[tourNum].length} Матчей
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-y md:divide-y-0 divide-gray-100">
                    {tours[tourNum].map((match: any) => (
                      <div key={match.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                        
                        {/* Команда 1 */}
                        <div className="flex items-center gap-3 flex-1">
                          <span className="font-bold uppercase text-[11px] text-[#1a3151] text-right flex-1 truncate">
                            {match.homeTeam.name}
                          </span>
                          <div className="w-10 h-8 bg-gray-50 border border-gray-100 rounded-sm p-1.5 flex items-center justify-center shrink-0">
                            {match.homeTeam.logo ? (
                              <img src={match.homeTeam.logo} alt="" className="max-w-full max-h-full object-contain" />
                            ) : (
                              <Trophy className="text-gray-200" size={14} />
                            )}
                          </div>
                        </div>

                        {/* Результат / VS */}
                        <div className="px-4 flex flex-col items-center min-w-[80px]">
                          {match.status === "FINISHED" ? (
                            <Link 
                              href={`/admin/matches/${match.id}`}
                              className="bg-[#000c2d] text-white px-3 py-1 rounded-sm font-black italic text-xs tracking-tighter hover:bg-[#e30613] transition-colors"
                            >
                              {match.homeScore} : {match.awayScore}
                            </Link>
                          ) : (
                            <div className="bg-gray-100 text-gray-400 px-3 py-1 rounded-sm font-black text-[11px] tracking-tighter">
                              v
                            </div>
                          )}
                        </div>

                        {/* Команда 2 */}
                        <div className="flex items-center gap-3 flex-1 flex-row-reverse">
                          <span className="font-bold uppercase text-[11px] text-[#1a3151] text-left flex-1 truncate">
                            {match.awayTeam.name}
                          </span>
                          <div className="w-10 h-8 bg-gray-50 border border-gray-100 rounded-sm p-1.5 flex items-center justify-center shrink-0">
                            {match.awayTeam.logo ? (
                              <img src={match.awayTeam.logo} alt="" className="max-w-full max-h-full object-contain" />
                            ) : (
                              <Trophy className="text-gray-200" size={14} />
                            )}
                          </div>
                        </div>
                        
                        {/* Кнопка перехода к матчу (иконка) */}
                        <Link href={`/admin/matches/${match.id}`} className="ml-2 text-gray-300 hover:text-[#000c2d] transition-colors">
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}