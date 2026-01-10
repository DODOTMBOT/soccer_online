import React from 'react';
import { ChevronRight, Trophy, Activity, TrendingUp } from 'lucide-react';
import { prisma } from "@/src/server/db";
import { DevTools } from "@/components/admin/DevTools";
import { Sidebar } from "@/components/admin/Sidebar"; // Вернул импорт

export default async function SoccerDashboard() {
  const teamsCount = await prisma.team.count();
  const countriesCount = await prisma.country.count();

  return (
    <div className="flex min-h-screen bg-[#f2f5f7] font-sans">
      {/* 1. Вернул Сайдбар, так как это корневая страница и layout.tsx его не содержит */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* MATCH TICKER */}
        <div className="bg-[#e1e8ed] h-12 flex items-center gap-1 border-b border-gray-300 overflow-x-auto no-scrollbar px-4 shrink-0">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="min-w-[160px] bg-white h-8 rounded border border-gray-200 flex items-center justify-between px-3 text-[9px] font-bold shadow-sm flex-shrink-0">
              <div className="flex flex-col gap-0.5 leading-none">
                <div className="flex justify-between w-20"><span>ARS</span> <span>2</span></div>
                <div className="flex justify-between w-20 text-gray-400"><span>CHE</span> <span>0</span></div>
              </div>
              <span className="text-[#e30613] ml-2">88'</span>
            </div>
          ))}
        </div>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="max-w-[1200px] mx-auto grid grid-cols-12 gap-6">
            
            {/* ПАНЕЛЬ РАЗРАБОТЧИКА */}
            <div className="col-span-12">
              <DevTools />
            </div>
            
            {/* LEFT: CONTENT */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              
              {/* HERO BANNER */}
              <div className="relative h-[400px] rounded-sm overflow-hidden group shadow-lg bg-black">
                <img 
                  src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200" 
                  className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" 
                  alt="Stadium" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000c2d] via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-[#e30613] text-white text-[9px] font-black px-2 py-0.5 uppercase">Match Engine</span>
                    <span className="text-white/60 text-[9px] font-bold uppercase tracking-widest">v1.0 Live</span>
                  </div>
                  <h1 className="text-4xl font-black text-white leading-tight uppercase italic tracking-tighter max-w-2xl">
                    Система готова к генерации матчей D5 дивизиона
                  </h1>
                  <button className="mt-6 bg-white text-[#000c2d] px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#e30613] hover:text-white transition-all flex items-center gap-2">
                    Запустить симуляцию тура <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* QUICK STATS CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="bg-white p-5 border-b-4 border-blue-600 shadow-sm">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Всего клубов</p>
                    <p className="text-2xl font-black italic">{teamsCount}</p>
                 </div>
                 <div className="bg-white p-5 border-b-4 border-emerald-500 shadow-sm">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Активных лиг</p>
                    <p className="text-2xl font-black italic">14</p>
                 </div>
                 <div className="bg-white p-5 border-b-4 border-orange-500 shadow-sm">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-2">География (стран)</p>
                    <p className="text-2xl font-black italic">{countriesCount}</p>
                 </div>
              </div>
            </div>

            {/* RIGHT: ANALYTICS */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              
              {/* MARKET VALUE WIDGET */}
              <div className="bg-[#000c2d] rounded-sm p-6 text-white relative overflow-hidden shadow-xl">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                     <Trophy className="text-[#e30613]" size={20} />
                     <TrendingUp className="text-emerald-500" size={18} />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Лучший бомбардир сезона</p>
                  <h3 className="text-xl font-black uppercase italic mb-6 leading-none">Эрлинг Холанд</h3>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                     <div>
                        <p className="text-[8px] text-gray-500 uppercase font-black">Текущая форма</p>
                        <p className="text-xl font-black text-emerald-500">98%</p>
                     </div>
                     <button className="text-[9px] font-black uppercase border border-white/20 px-3 py-2 hover:bg-white hover:text-black transition-all">
                        Профиль
                     </button>
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 text-8xl font-black text-white/5 italic">GOAL</div>
              </div>

              {/* LOGS / STATUS */}
              <div className="bg-white border border-gray-200 shadow-sm">
                <div className="bg-[#1a3151] px-4 py-2 flex justify-between items-center">
                  <span className="text-[9px] font-black text-white uppercase">Системные логи</span>
                  <Activity size={12} className="text-emerald-400" />
                </div>
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3 pb-3 border-b border-gray-50 last:border-0">
                      <div className="w-1 h-8 bg-emerald-500 shrink-0"></div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-800 leading-tight">Матч ID #543 симулирован успешно</p>
                        <p className="text-[8px] text-gray-400 uppercase mt-1">Сегодня, 14:20</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}