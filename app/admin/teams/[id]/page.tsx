import React from 'react';
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { TeamHeader } from "@/components/admin/team/TeamHeader";
import { PlayerTable } from "@/components/admin/team/PlayerTable";
import { TeamMatches } from "@/components/admin/team/TeamMatches";
import Link from "next/link";

export default async function TeamDetailsDashboard({ params, searchParams }: any) {
  const { id } = await params;
  const { sort = 'pos', direction = 'asc', tab = 'players' } = await searchParams;

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

  // 1. Ищем ближайший предстоящий матч
  const allMatchesRaw = [...team.homeMatches, ...team.awayMatches];
  const upcomingMatch = allMatchesRaw
    .filter(m => (m.status as string) !== 'FINISHED')
    .sort((a, b) => a.tour - b.tour)[0];

  // 2. Проверяем, отправлен ли состав (MatchSetup)
  let hasSetup = false;
  if (upcomingMatch) {
    try {
      // Пытаемся найти модель. В Prisma Client она обычно matchSetup или setup.
      // Мы используем безопасный вызов, чтобы не падать с ошибкой 'undefined'
      const setupModel = (prisma as any).matchSetup || (prisma as any).setup;
      
      if (setupModel) {
        const setup = await setupModel.findFirst({
          where: {
            matchId: upcomingMatch.id,
            teamId: id
          }
        });
        hasSetup = !!setup;
      }
    } catch (e) {
      console.error("Ошибка при поиске MatchSetup:", e);
    }
  }

  const allMatches = allMatchesRaw.sort((a, b) => {
    if (a.tour !== b.tour) return a.tour - b.tour;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const tabs = [
    { name: 'Игроки', href: `/admin/teams/${id}?tab=players`, key: 'players' },
    { name: 'Матчи', href: `/admin/teams/${id}?tab=matches`, key: 'matches' },
    { name: 'Сделки', href: '#', key: 'deals' },
    { name: 'События', href: '#', key: 'events' },
    { name: 'Финансы', href: '#', key: 'finance' },
    { name: 'Статистика', href: '#', key: 'stats' },
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
              <TeamMatches matches={allMatches} teamId={id} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}