import React from 'react';
import { prisma } from "@/src/server/db";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { TeamHeader } from "@/components/admin/team/TeamHeader";
import { PlayerTable } from "@/components/admin/team/PlayerTable";
import { TeamMatches } from "@/components/admin/team/TeamMatches";
import Link from "next/link";

export default async function TeamDetailsDashboard({ params, searchParams }: any) {
  const { id } = await params;
  const { sort = 'pos', direction = 'asc', tab = 'players', seasonId } = await searchParams;

  // 1. Загружаем команду и матчи
  const team = await prisma.team.findUnique({
    where: { id },
    include: { 
      players: { include: { country: true } }, 
      league: { include: { country: true } },
      manager: true,
      _count: { select: { trophies: true } },
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

  // 2. Загружаем список сезонов для фильтра
  const seasons = await prisma.season.findMany({ orderBy: { year: 'desc' } });
  
  // Определяем активный сезон для отображения (из URL или последний)
  const activeSeasonId = seasonId || seasons[0]?.id;

  // 3. Обработка матчей
  const allMatchesRaw = [...team.homeMatches, ...team.awayMatches];

  // Сортировка (сначала сезон, потом тур)
  const sortedMatches = allMatchesRaw.sort((a, b) => {
    if (b.season.year !== a.season.year) return b.season.year - a.season.year;
    return a.tour - b.tour;
  });

  // Фильтруем матчи для вкладки "Матчи" (только выбранный сезон)
  const filteredMatches = sortedMatches.filter(m => m.seasonId === activeSeasonId);

  // 4. Поиск ближайшего матча (ВСЕГДА в будущем, независимо от выбранного сезона в фильтре)
  // Берем матчи последнего сезона или будущие
  const latestSeasonId = seasons[0]?.id;
  const upcomingMatch = sortedMatches
    .filter(m => (m.status as string) !== 'FINISHED' && m.seasonId === latestSeasonId)
    .sort((a, b) => a.tour - b.tour)[0];

  // 5. Проверка состава
  let hasSetup = false;
  if (upcomingMatch) {
    try {
      const setup = await prisma.matchTeamSetup.findUnique({
        where: {
          matchId_teamId: { matchId: upcomingMatch.id, teamId: id }
        }
      });
      hasSetup = !!setup;
    } catch (e) {
      console.error("Match setup check error:", e);
    }
  }

  const tabs = [
    { name: 'Игроки', href: `/admin/teams/${id}?tab=players&seasonId=${activeSeasonId}`, key: 'players' },
    { name: 'Матчи', href: `/admin/teams/${id}?tab=matches&seasonId=${activeSeasonId}`, key: 'matches' },
    { name: 'Сделки', href: '#', key: 'deals' },
    { name: 'События', href: '#', key: 'events' },
    { name: 'Финансы', href: '#', key: 'finance' },
    { name: 'Трофеи', href: '#', key: 'trophies' },
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

          <div className="flex items-center gap-1 border-b border-gray-300 text-[11px] font-bold uppercase tracking-tight overflow-x-auto no-scrollbar bg-white px-2">
             {tabs.map((t) => {
               const isActive = (tab === t.key);
               return (
                 <Link 
                  key={t.name} 
                  href={t.href} 
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
        </div>
      </main>
    </div>
  );
}