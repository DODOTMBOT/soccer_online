import React from 'react';
import { prisma } from "@/src/server/db";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { ArrowLeft, Activity, Users, Clock, BarChart3, CalendarDays } from 'lucide-react';
import Link from "next/link";
import { MatchActions } from "@/components/admin/MatchActions";

// Импорт компонентов
import { Scoreboard } from "@/components/admin/match/Scoreboard";
import { TeamLineupTable } from "@/components/admin/match/TeamLineupTable";
import { MatchTimeline } from "@/components/admin/match/MatchTimeline";
import { MatchStats } from "@/components/admin/match/XGStats";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: { include: { country: true } },
      season: true,
      setups: { include: { lineupSlots: { include: { player: true } } } }
    }
  });

  if (!match) notFound();

  const isFinished = match.status === 'FINISHED';
  const homeSetup = match.setups.find(s => s.teamId === match.homeTeamId);
  const awaySetup = match.setups.find(s => s.teamId === match.awayTeamId);
  
  const report = (match as any).report || { homeXG: 0, awayXG: 0, events: [], debug: null };

  const calculatePower = (slots: any[]) => 
    slots.filter(s => s.slotIndex <= 10).reduce((sum, s) => sum + (s.player?.power || 0), 0);

  const homePower = homeSetup ? calculatePower(homeSetup.lineupSlots) : 0;
  const awayPower = awaySetup ? calculatePower(awaySetup.lineupSlots) : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-[#000c2d]">
      <Sidebar />
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              href={`/admin/leagues/${match.leagueId}/calendar`} 
              className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-100 text-gray-400 hover:bg-gray-50 hover:text-[#000c2d] transition-all"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-[#e30613] uppercase tracking-[0.2em]">
                  {match.league.name} • Тур {match.tour}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${isFinished ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-[#e30613]'}`}>
                  {isFinished ? 'Завершен' : 'Live'}
                </span>
              </div>
              <h1 className="text-xl font-black uppercase tracking-tight text-[#000c2d] mt-0.5">
                {match.homeTeam.name} <span className="text-gray-300 mx-1">—</span> {match.awayTeam.name}
              </h1>
            </div>
          </div>
          
          <MatchActions matchId={id} isFinished={isFinished} />
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto grid grid-cols-12 gap-6">
          
          {/* 1. SCOREBOARD */}
          <section className="col-span-12 bg-white border border-gray-200 rounded-sm p-8 shadow-sm">
            <Scoreboard 
              homeTeam={match.homeTeam} 
              awayTeam={match.awayTeam} 
              homeScore={match.homeScore} 
              awayScore={match.awayScore}
              homePower={homePower}
              awayPower={awayPower}
              isFinished={isFinished}
            />
          </section>

          {/* 2. ЛЕВАЯ КОЛОНКА: Статистика и Хронология */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* АНАЛИТИКА xG */}
            {isFinished && (
              <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                  <BarChart3 size={16} className="text-[#e30613]" />
                  <h2 className="text-[11px] font-black uppercase tracking-widest text-[#1a3151]">Статистика матча</h2>
                </div>
                <div className="p-6">
                  <MatchStats 
                    homeXG={report.homeXG || 0} 
                    awayXG={report.awayXG || 0}
                    homeScore={match.homeScore ?? 0}
                    awayScore={match.awayScore ?? 0}
                    events={report.events}
                    debug={report.debug}
                  />
                </div>
              </div>
            )}

            {/* ТАЙМЛАЙН */}
            <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <Clock size={16} className="text-[#1a3151]" />
                <h2 className="text-[11px] font-black uppercase tracking-widest text-[#1a3151]">События игры</h2>
              </div>
              <div className="p-6">
                <MatchTimeline 
                  events={report.events} 
                  isFinished={isFinished} 
                  homeTeamName={match.homeTeam.name} 
                  awayTeamName={match.awayTeam.name} 
                />
              </div>
            </div>
          </div>

          {/* 3. ПРАВАЯ КОЛОНКА: Детали и Составы */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* ТЕХНИЧЕСКАЯ ИНФОРМАЦИЯ */}
            <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6">
              <h3 className="text-[11px] font-black uppercase tracking-widest mb-4 text-[#e30613]">Детали встречи</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Стадион</span>
                  <span className="text-[10px] font-black text-[#1a3151] uppercase italic">{match.homeTeam.stadium || match.homeTeam.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Условия</span>
                  <div className="flex items-center gap-2">
                    <Activity size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-[#1a3151] uppercase">Оптимальные</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Сезон</span>
                  <div className="flex items-center gap-2">
                    <CalendarDays size={12} className="text-gray-400" />
                    <span className="text-[10px] font-black text-[#1a3151]">{match.season?.year}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* СОСТАВЫ */}
            <div className="space-y-4">
              {/* Хозяева */}
              <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-gray-400" />
                    <span className="text-[10px] font-black uppercase text-[#1a3151]">Хозяева</span>
                  </div>
                  <span className="text-[10px] font-black text-[#e30613]">RS: {homePower}</span>
                </div>
                <TeamLineupTable 
                  setup={homeSetup} 
                  teamName={match.homeTeam.name} 
                  power={homePower} 
                  color="emerald" 
                />
              </div>

              {/* Гости */}
              <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-gray-400" />
                    <span className="text-[10px] font-black uppercase text-[#1a3151]">Гости</span>
                  </div>
                  <span className="text-[10px] font-black text-[#e30613]">RS: {awayPower}</span>
                </div>
                <TeamLineupTable 
                  setup={awaySetup} 
                  teamName={match.awayTeam.name} 
                  power={awayPower} 
                  color="amber" 
                />
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}