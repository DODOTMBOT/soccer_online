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

// 1. Отключаем кэш намертво
export const dynamic = "force-dynamic";

export default async function TeamPage({ params, searchParams }: any) {
  // 2. Правильно достаем параметры (Next.js 15 style)
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const tab = resolvedSearchParams?.tab || 'players';
  const seasonId = resolvedSearchParams?.seasonId;

  const session = await getServerSession(authOptions);

  // 3. Загружаем команду
  const team = await prisma.team.findUnique({
    where: { id },
    include: { 
      players: { include: { country: true } }, 
      league: { include: { country: true } },
      manager: true, // Нужно чтобы проверить владельца
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

  // 4. Проверка прав Менеджера
  const isManager = session?.user?.id === team.managerId;

  // 5. Данные для матчей
  const seasons = await prisma.season.findMany({ orderBy: { year: 'desc' } });
  const activeSeasonId = seasonId || seasons[0]?.id;
  const allMatchesRaw = [...team.homeMatches, ...team.awayMatches];
  const filteredMatches = allMatchesRaw
    .filter(m => m.seasonId === activeSeasonId)
    .sort((a, b) => a.tour - b.tour);
  
  const upcomingMatch = allMatchesRaw
    .filter(m => (m.status as string) !== 'FINISHED' && m.seasonId === seasons[0]?.id)
    .sort((a, b) => a.tour - b.tour)[0];

  let hasSetup = false;
  if (upcomingMatch) {
    const setup = await prisma.matchTeamSetup.findUnique({
      where: { matchId_teamId: { matchId: upcomingMatch.id, teamId: id } }
    });
    hasSetup = !!setup;
  }

  // 6. ЗАГРУЗКА СДЕЛОК (Только если таб=deals и юзер=менеджер)
  let marketData = { incoming: [], outgoing: [] };
  let debugStatus = "NOT LOADING"; // Для отладки на экране

  if (tab === 'deals') {
    if (isManager) {
      debugStatus = "LOADING DEALS...";
      try {
        // @ts-ignore
        marketData.incoming = await MarketService.getIncomingOffers(id);
        // @ts-ignore
        marketData.outgoing = await MarketService.getOutgoingOffers(id);
        debugStatus = `LOADED: ${marketData.incoming.length} IN, ${marketData.outgoing.length} OUT`;
      } catch (e: any) {
        debugStatus = `ERROR: ${e.message}`;
      }
    } else {
      debugStatus = "ACCESS DENIED (Not Manager)";
    }
  }

  // 7. Ссылки табов
  const tabs = [
    { name: 'Игроки', key: 'players' },
    { name: 'Матчи', key: 'matches' },
    { name: 'Сделки', key: 'deals' }, // Показываем всем, чтобы ты мог кликнуть и проверить
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

          {/* ОТЛАДОЧНАЯ ПАНЕЛЬ (КРАСНАЯ) */}
          <div className="bg-red-100 border-l-4 border-red-500 p-4 text-xs font-mono text-red-900">
            <p><strong>DEBUG SCREEN:</strong></p>
            <p>Tab: <b>{tab}</b></p>
            <p>My User ID: {session?.user?.id}</p>
            <p>Team Manager ID: {team.managerId}</p>
            <p>Am I Manager?: <b>{isManager ? "YES" : "NO"}</b></p>
            <p>Deals Status: <b>{debugStatus}</b></p>
          </div>

          <div className="flex items-center gap-1 border-b border-gray-300 text-[11px] font-bold uppercase tracking-tight overflow-x-auto no-scrollbar bg-white px-2">
             {tabs.map((t) => {
               const isActive = (tab === t.key);
               return (
                 <Link 
                  key={t.key} 
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

          {tab === 'deals' && (
            <div className="w-full">
              {isManager ? (
                <TeamDeals 
                  incoming={marketData.incoming} 
                  outgoing={marketData.outgoing} 
                  teamId={id} 
                />
              ) : (
                <div className="p-10 text-center bg-white">У вас нет прав для просмотра сделок этого клуба.</div>
              )}
            </div>
          )}

          {tab === 'finance' && <div className="p-10 bg-white">Финансы (WIP)</div>}

        </div>
      </main>
    </div>
  );
}