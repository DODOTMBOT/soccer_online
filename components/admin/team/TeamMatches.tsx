import React from 'react';
import { Trophy, ChevronRight } from "lucide-react";
import Link from "next/link";

export function TeamMatches({ matches, teamId }: { matches: any[], teamId: string }) {
  if (matches.length === 0) {
    return (
      <div className="p-20 text-center bg-white border border-gray-200 shadow-sm">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Матчи еще не запланированы</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-[#1a3151] px-6 py-2.5">
        <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">История и календарь матчей</h2>
      </div>
      
      <div className="divide-y divide-gray-100">
        {matches.map((match) => {
          const isHome = match.homeTeamId === teamId;
          const isFinished = match.status === "FINISHED";
          
          // Логика цвета результата
          let resultColor = "bg-gray-100 text-gray-400";
          if (isFinished) {
            const teamScore = isHome ? match.homeScore : match.awayScore;
            const oppScore = isHome ? match.awayScore : match.homeScore;
            if (teamScore > oppScore) resultColor = "bg-emerald-600 text-white"; // Победа
            else if (teamScore < oppScore) resultColor = "bg-red-600 text-white"; // Поражение
            else resultColor = "bg-orange-500 text-white"; // Ничья
          }

          return (
            <div key={match.id} className="flex items-center p-3 hover:bg-gray-50 transition-colors group text-[11px]">
              {/* Информация о туре */}
              <div className="w-16 shrink-0 flex flex-col border-r border-gray-100 mr-4">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Тур</span>
                <span className="font-black text-[#1a3151] italic text-sm">{match.tour}</span>
              </div>

              {/* Сезон */}
              <div className="w-12 shrink-0 hidden md:flex flex-col mr-4">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Сезон</span>
                <span className="font-bold text-gray-600">S{match.season.year % 100}</span>
              </div>

              {/* Команды */}
              <div className="flex-1 flex items-center justify-center gap-4">
                {/* Хозяева */}
                <div className={`flex items-center gap-3 flex-1 justify-end ${isHome ? 'font-black text-[#000c2d]' : 'text-gray-500 font-bold'}`}>
                  <span className="uppercase truncate">{match.homeTeam.name}</span>
                  <div className="w-8 h-6 bg-white border border-gray-100 p-1 flex items-center justify-center shrink-0">
                    <img src={match.homeTeam.logo || ""} alt="" className="max-w-full max-h-full object-contain" />
                  </div>
                </div>

                {/* Счёт */}
                <div className="shrink-0">
                  <Link 
                    href={`/admin/matches/${match.id}`}
                    className={`${resultColor} px-4 py-1.5 rounded-sm font-black italic text-xs tracking-tighter shadow-sm hover:scale-105 transition-transform block min-w-[60px] text-center`}
                  >
                    {isFinished ? `${match.homeScore} : ${match.awayScore}` : "VS"}
                  </Link>
                </div>

                {/* Гости */}
                <div className={`flex items-center gap-3 flex-1 justify-start ${!isHome ? 'font-black text-[#000c2d]' : 'text-gray-500 font-bold'}`}>
                  <div className="w-8 h-6 bg-white border border-gray-100 p-1 flex items-center justify-center shrink-0">
                    <img src={match.awayTeam.logo || ""} alt="" className="max-w-full max-h-full object-contain" />
                  </div>
                  <span className="uppercase truncate">{match.awayTeam.name}</span>
                </div>
              </div>

              {/* Переход */}
              <Link href={`/admin/matches/${match.id}`} className="ml-4 p-2 text-gray-300 hover:text-[#e30613] transition-colors">
                <ChevronRight size={16} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}