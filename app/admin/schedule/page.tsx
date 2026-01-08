import { prisma } from "@/src/server/db";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdvanceTimeButton } from "@/components/admin/schedule/AdvanceTimeButton";
import { Calendar, Clock, CheckCircle2, Circle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ScheduleControlPage() {
  // 1. Ищем активный сезон
  const activeSeason = await prisma.season.findFirst({
    where: { status: "ACTIVE" }
  });

  if (!activeSeason) {
    return (
      <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans">
        <Sidebar />
        <div className="p-10 text-center">
          <h1 className="text-xl font-black uppercase text-gray-400">Нет активного сезона</h1>
        </div>
      </div>
    );
  }

  // 2. Загружаем дни
  const days = await prisma.gameDay.findMany({
    where: { seasonId: activeSeason.id },
    orderBy: { number: 'asc' },
    include: {
      timeSlots: {
        include: {
          _count: { select: { matches: true } }
        },
        orderBy: { order: 'asc' }
      }
    }
  });

  const currentDay = days.find(d => d.isCurrent);

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans text-[#000c2d]">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1000px] mx-auto space-y-8">
          
          {/* HEADER: ПУЛЬТ УПРАВЛЕНИЯ */}
          <div className="bg-[#1a3151] rounded-sm p-8 text-white shadow-lg flex justify-between items-center relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[#e30613] text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                Текущее время сервера
              </p>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-1">
                {currentDay ? `День ${currentDay.number}` : "Сезон не начат"}
              </h1>
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest">
                Сезон {activeSeason.year}
              </p>
            </div>
            
            <div className="relative z-10">
              <AdvanceTimeButton />
            </div>

            {/* Декор */}
            <Calendar className="absolute -right-6 -bottom-6 text-white/5 w-48 h-48" />
          </div>

          {/* TIMELINE (Лента времени) */}
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <Clock size={16} className="text-gray-400" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Хронология событий
              </h3>
            </div>

            <div className="divide-y divide-gray-100">
              {days.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs font-bold uppercase">
                  Календарь не сгенерирован. Зайдите в "Сезоны" и нажмите "Сгенерировать".
                </div>
              ) : (
                days.map((day) => (
                  <div 
                    key={day.id} 
                    className={`flex items-center justify-between p-4 transition-colors ${
                      day.isCurrent ? 'bg-emerald-50/50 border-l-4 border-emerald-500' : 'hover:bg-gray-50'
                    } ${day.isFinished ? 'opacity-60 grayscale' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-black text-xs
                        ${day.isCurrent ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 
                          day.isFinished ? 'bg-gray-200 text-gray-500' : 'bg-[#1a3151] text-white'}
                      `}>
                        {day.number}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#1a3151] uppercase">
                            {day.label || `Игровой день ${day.number}`}
                          </span>
                          {day.isCurrent && (
                            <span className="bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-sm animate-pulse">
                              Live
                            </span>
                          )}
                        </div>
                        <div className="flex gap-3 mt-1">
                          {day.timeSlots.map(slot => (
                            <span key={slot.id} className="text-[9px] font-bold text-gray-400 uppercase bg-gray-100 px-2 py-0.5 rounded-sm">
                              {slot.label}: {slot._count.matches} матчей
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      {day.isFinished ? (
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      ) : day.isCurrent ? (
                        <Clock size={20} className="text-emerald-600 animate-spin-slow" />
                      ) : (
                        <Circle size={20} className="text-gray-200" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}