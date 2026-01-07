import React from 'react';
import { prisma } from "@/src/server/db";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/auth";
import { Sidebar } from "@/components/admin/Sidebar";
import { TeamHeader } from "@/components/admin/team/TeamHeader";
import { PlayerTable } from "@/components/admin/team/PlayerTable";
import { TeamMatches } from "@/components/admin/team/TeamMatches";
import { TeamDeals } from "@/components/admin/team/TeamDeals"; 
import { MarketService } from "@/src/server/services/market.service";
import Link from "next/link";

// ВАЖНО: Отключаем кэширование, чтобы табы переключались мгновенно
export const dynamic = "force-dynamic";

export default async function TeamPage({ params, searchParams }: any) {
  const { id } = await params;
  
  // Ждем параметры поиска (Next.js 15+)
  const resolvedSearchParams = await searchParams;
  const tab = resolvedSearchParams?.tab || 'players';
  const seasonId = resolvedSearchParams?.seasonId;

  const session = await getServerSession(authOptions);

  // Логирование для отладки в терминале
  console.log(`[Page] Render Team: ${id}, Tab: ${tab}, User: ${session?.user?.id}`);

  // 1. Загружаем команду
  const team = await prisma.team.findUnique({
    where: { id },
    include: { 
      players: { include: { country: true } }, 
      league: { include: { country: true } },
      manager: true,
      homeMatches: {
        include: {
          homeTeam: { select: { name: true, logo: true, id: true } },
          awayTeam: { select: { name: true, logo: true, id: true } },
          season: true
        }
      },
      awayMatches: {
        include: {
          homeTeam: { select: { name: true, logo: true, id: true } },
          awayTeam: { select: { name: true, logo: true, id: true } },
          season: true
        }
      }
    }
  });

  if (!team) notFound();

  // Проверка прав: текущий юзер - менеджер этой команды?
  const isManager = session?.user?.id === team.managerId;

  // 2. Сезоны
  const seasons = await prisma.season.findMany({ orderBy: { year: 'desc' } });
  const activeSeasonId = seasonId || seasons[0]?.id;

  // 3. Матчи (фильтрация)
  const allMatchesRaw = [...team.homeMatches, ...team.awayMatches];
  const filteredMatches = allMatchesRaw
    .filter(m => m.seasonId === activeSeasonId)
    .sort((a, b) => a.tour - b.tour);

  const upcomingMatch = allMatchesRaw
    .filter(m => (m.status as string) !== 'FINISHED' && m.seasonId === seasons[0]?.id)
    .sort((a, b) => a.tour - b.tour)[0];

  // 4. Проверка состава
  let hasSetup = false;
  if (upcomingMatch) {
    const setup = await prisma.matchTeamSetup.findUnique({
      where: { matchId_teamId: { matchId: upcomingMatch.id, teamId: id } }
    });
    hasSetup = !!setup;
  }

  // 5. ДАННЫЕ СДЕЛОК (Загружаем только для менеджера и вкладки deals)
  let marketData = { incoming: [], outgoing: [] };
  
  if (tab === 'deals') {
    if (isManager) {
      try {
        // @ts-ignore
        marketData.incoming = await MarketService.getIncomingOffers(id);
        // @ts-ignore
        marketData.outgoing = await MarketService.getOutgoingOffers(id);
      } catch (e) {
        console.error("Ошибка загрузки сделок:", e);
      }
    }
  }

  // 6. Формирование ссылок для табов
  const tabs = [
    { name: 'Игроки', key: 'players' },
    { name: 'Матчи', key: 'matches' },
    // Показываем "Сделки" только менеджеру
    ...(isManager ? [{ name: 'Сделки', key: 'deals' }] : []),
    { name: 'Финансы', key: 'finance' },
  ];

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans text-[#000c2d]">
      <Sidebar />
      
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1400px] mx-auto space-y-6">
          
          <TeamHeader 
            team={team} 
            upcomingMatchId={upcomingMatch?.id} 
            hasSetup={hasSetup} 
          />

          {/* НАВИГАЦИЯ ПО ТАБАМ */}
          <div className="flex items-center gap-1 border-b border-gray-300 text-[11px] font-bold uppercase tracking-tight overflow-x-auto no-scrollbar bg-white px-2">
             {tabs.map((t) => {
               const isActive = (tab === t.key);
               return (
                 <Link 
                  key={t.key} 
                  // Ссылка ведет на текущую страницу с параметром tab
                  href={`/teams/${id}?tab=${t.key}&seasonId=${activeSeasonId}`} 
                  className={`px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                    isActive ? 'border-[#e30613] text-[#000c2d]' : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                 >
                   {t.name}
                 </Link>
               );
             })}
          </div>

          {/* --- БЛОК ОТЛАДКИ (Виден только во вкладке deals) --- */}
          {tab === 'deals' && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 text-xs font-mono text-yellow-800 rounded mb-4">
              <p><strong>DEBUG INFO:</strong></p>
              <p>Current Tab: {tab}</p>
              <p>User ID: {session?.user?.id || 'Guest'}</p>
              <p>Is Manager: {isManager ? 'YES' : 'NO'}</p>
              {isManager && (
                <>
                  <p>Incoming Offers: {marketData.incoming.length}</p>
                  <p>Outgoing Offers: {marketData.outgoing.length}</p>
                </>
              )}
            </div>
          )}

          {/* КОНТЕНТ */}
          
          {tab === 'players' && (
            <div className="w-full">
              <PlayerTable players={team.players} />
            </div>
          )}

          {tab === 'matches' && (
            <div className="w-full">
              <TeamMatches 
                matches={filteredMatches} 
                teamId={id} 
                seasons={seasons}
                activeSeasonId={activeSeasonId}
              />
            </div>
          )}

          {tab === 'deals' && isManager && (
            <div className="w-full">
              <TeamDeals 
                incoming={marketData.incoming} 
                outgoing={marketData.outgoing} 
                teamId={id} 
              />
            </div>
          )}
          
          {tab === 'deals' && !isManager && (
            <div className="p-12 text-center bg-white border border-gray-200 rounded">
              <p className="text-red-500 font-bold uppercase text-xs">Доступ запрещен</p>
              <p className="text-gray-400 text-[10px] mt-1">Только менеджер команды может видеть сделки.</p>
            </div>
          )}

          {tab === 'finance' && (
            <div className="p-12 text-center text-gray-400 font-bold uppercase text-xs bg-white border border-gray-200 rounded">
              Раздел финансов в разработке
            </div>
          )}

        </div>
      </main>
    </div>
  );
}