import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/admin/Sidebar";
import { notFound } from "next/navigation";
import { ArrowLeft, Activity, Settings } from "lucide-react";
import Link from "next/link";
import { GenerateCalendarModal } from "@/components/admin/GenerateCalendarModal";
import { SimulateTourButton } from "@/components/admin/SimulateTourButton";

export default async function LeagueDetailsPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ tour?: string }>
}) {
  const { id } = await params;
  const { tour } = await searchParams;

  // Загружаем данные лиги
  const league = await prisma.league.findUnique({
    where: { id },
    include: {
      country: true,
      season: true,
      // Загружаем команды, которые ПРЯМО СЕЙЧАС привязаны к лиге (для нового сезона)
      teams: true,
      // Загружаем матчи этой лиги (для истории и расчета таблицы)
      matches: {
        orderBy: { tour: 'asc' },
        include: { homeTeam: true, awayTeam: true }
      }
    }
  });

  if (!league) notFound();

  // --- ЛОГИКА ВОССТАНОВЛЕНИЯ ИСТОРИИ ---
  
  // 1. Собираем уникальные команды из матчей (это надежнее для прошлых сезонов)
  const teamsMap = new Map<string, any>();
  
  league.matches.forEach(m => {
    if (!teamsMap.has(m.homeTeamId)) teamsMap.set(m.homeTeamId, { ...m.homeTeam, stats: initStats() });
    if (!teamsMap.has(m.awayTeamId)) teamsMap.set(m.awayTeamId, { ...m.awayTeam, stats: initStats() });
  });

  // 2. Если матчей нет (старт сезона), берем команды из текущей привязки
  if (teamsMap.size === 0) {
    league.teams.forEach(t => {
      teamsMap.set(t.id, { ...t, stats: initStats() });
    });
  }

  // 3. Рассчитываем таблицу по сыгранным матчам
  league.matches.forEach(m => {
    if (m.status === 'FINISHED' && m.homeScore !== null && m.awayScore !== null) {
      const home = teamsMap.get(m.homeTeamId);
      const away = teamsMap.get(m.awayTeamId);

      if (home && away) {
        updateStats(home.stats, m.homeScore, m.awayScore);
        updateStats(away.stats, m.awayScore, m.homeScore);
      }
    }
  });

  // 4. Превращаем Map в массив и сортируем
  const table = Array.from(teamsMap.values()).sort((a, b) => {
    const pts = b.stats.points - a.stats.points;
    if (pts !== 0) return pts;
    const diff = (b.stats.goalsFor - b.stats.goalsAgainst) - (a.stats.goalsFor - a.stats.goalsAgainst);
    if (diff !== 0) return diff;
    return b.stats.goalsFor - a.stats.goalsFor;
  });

  // Данные для UI
  const toursCount = Math.max(...league.matches.map(m => m.tour), 0);
  const currentTour = tour ? parseInt(tour) : 1;
  const tourMatches = league.matches.filter(m => m.tour === currentTour);

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans">
      <Sidebar />

      <div className="bg-white border-b border-gray-200 px-8 py-4 shrink-0">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/admin/countries/${league.countryId}`} className="text-gray-400 hover:text-[#000c2d] transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-3">
              {league.country.flag && (
                <img src={league.country.flag} alt="" className="w-6 h-4 object-cover border border-gray-100 shadow-sm" />
              )}
              <div>
                <h1 className="text-xl font-black uppercase tracking-tighter italic text-[#000c2d]">
                  {league.country.name}: <span className="text-[#e30613]">{league.name}</span>
                </h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  Сезон {league.season?.year}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <GenerateCalendarModal leagueId={league.id} teamsCount={table.length} />
            <Link href={`/admin/leagues/edit/${league.id}`} className="p-2 text-gray-400 hover:text-[#000c2d] transition-colors">
              <Settings size={18} />
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-[1200px] mx-auto space-y-8">
          
          {/* КАЛЕНДАРЬ */}
          <div className="bg-white shadow-sm border border-gray-200">
            <div className="bg-[#1a3151] p-3 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                 <Activity size={14} className="text-emerald-400" />
                 <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Календарь игр</h2>
              </div>
              <div className="flex items-center gap-4">
                {league.season?.status === 'ACTIVE' && (
                  <SimulateTourButton leagueId={id} tour={currentTour} seasonId={league.seasonId} />
                )}
                <div className="flex gap-1 overflow-x-auto max-w-[400px] no-scrollbar px-2 border-l border-white/10 ml-2">
                  {Array.from({ length: toursCount }, (_, i) => i + 1).map(t => (
                    <Link 
                      key={t} 
                      href={`?tour=${t}`} 
                      className={`min-w-[24px] h-6 flex items-center justify-center text-[9px] font-bold rounded-sm transition-all ${
                        currentTour === t ? 'bg-[#e30613] text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {t}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50/50">
              <div className="flex justify-center mb-6">
                <span className="bg-[#000c2d] text-white px-6 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest italic shadow-sm">
                  Игровой день: {currentTour}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 max-w-5xl mx-auto">
                {tourMatches.length > 0 ? tourMatches.map(match => (
                  <div key={match.id} className="flex items-center justify-between bg-white border border-gray-200 py-2.5 px-4 rounded-sm shadow-sm hover:border-[#e30613] transition-all group">
                    <div className="flex-1 text-right pr-4 font-bold text-[11px] uppercase text-[#000c2d] truncate">
                      {match.homeTeam.name}
                    </div>
                    
                    {match.status === 'FINISHED' ? (
                      <Link 
                        href={`/admin/matches/${match.id}`}
                        className="bg-[#1a3151] text-white px-3 py-1.5 rounded-sm text-[11px] font-black min-w-[55px] text-center shadow-sm tracking-tighter italic hover:bg-[#e30613] transition-all"
                      >
                        {match.homeScore} : {match.awayScore}
                      </Link>
                    ) : (
                      <div className="bg-gray-100 text-gray-400 px-3 py-1.5 rounded-sm text-[11px] font-black min-w-[55px] text-center italic tracking-tighter">
                        v
                      </div>
                    )}
                    
                    <div className="flex-1 text-left pl-4 font-bold text-[11px] uppercase text-[#000c2d] truncate">
                      {match.awayTeam.name}
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 py-10 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
                    Расписание для данного тура еще не сформировано
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ТАБЛИЦА */}
          <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#000c2d] px-6 py-3">
               <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Положение команд</h2>
            </div>
            <table className="w-full text-xs border-collapse text-left">
              <thead>
                <tr className="bg-[#f8fafb] text-[#1a3151] border-b border-gray-200 uppercase text-[9px] font-black tracking-widest">
                  <th className="p-4 w-12 text-center">#</th>
                  <th className="p-4">Клуб</th>
                  <th className="p-4 w-14 text-center">И</th>
                  <th className="p-4 w-12 text-center">В</th>
                  <th className="p-4 w-12 text-center">Н</th>
                  <th className="p-4 w-12 text-center">П</th>
                  <th className="p-4 w-20 text-center">+/-</th>
                  <th className="p-4 w-16 text-center font-black bg-gray-50 border-l border-gray-200">О</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {table.map((team, index) => (
                  <tr key={team.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-center font-bold text-gray-400 text-[10px]">{index + 1}</td>
                    <td className="p-4">
                      <Link 
                        href={`/admin/teams/${team.id}`}
                        className="font-bold uppercase text-[11px] text-[#1a3151] hover:text-[#e30613] transition-colors"
                      >
                        {team.name}
                      </Link>
                    </td>
                    <td className="p-4 text-center font-medium">{team.stats.played}</td>
                    <td className="p-4 text-center text-gray-600 font-medium">{team.stats.win}</td>
                    <td className="p-4 text-center text-gray-400 font-medium">{team.stats.draw}</td>
                    <td className="p-4 text-center text-gray-400 font-medium">{team.stats.loss}</td>
                    <td className="p-4 text-center text-gray-500 font-medium tabular-nums">
                      {team.stats.goalsFor}:{team.stats.goalsAgainst}
                    </td>
                    <td className="p-4 text-center font-black bg-gray-50/50 text-[#000c2d] border-l border-gray-200">
                      {team.stats.points}
                    </td>
                  </tr>
                ))}
                {table.length === 0 && (
                  <tr><td colSpan={8} className="p-8 text-center text-gray-400 text-xs">Нет данных</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

// Утилиты для статистики
function initStats() {
  return { played: 0, win: 0, draw: 0, loss: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
}

function updateStats(stats: any, scored: number, conceded: number) {
  stats.played++;
  stats.goalsFor += scored;
  stats.goalsAgainst += conceded;
  if (scored > conceded) {
    stats.win++;
    stats.points += 3;
  } else if (scored === conceded) {
    stats.draw++;
    stats.points += 1;
  } else {
    stats.loss++;
  }
}