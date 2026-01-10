import { prisma } from "@/src/server/db";
import { AdvanceTimeButton } from "@/components/admin/schedule/AdvanceTimeButton";
import { Calendar, Clock, CheckCircle2, Circle, Play, Timer } from "lucide-react";

export const dynamic = "force-dynamic";

// --- НАСТРОЙКИ ДИЗАЙНА ---
const THEME = {
  colors: {
    bgMain: "bg-gray-50",
    primary: "bg-emerald-600",
    primaryText: "text-emerald-600",
    cardBg: "bg-white",
    textMain: "text-gray-900",
    textMuted: "text-gray-500",
  }
};

export default async function ScheduleControlPage() {
  // 1. Ищем активный сезон
  const activeSeason = await prisma.season.findFirst({
    where: { status: "ACTIVE" }
  });

  if (!activeSeason) {
    return (
      <div className={`w-full min-h-screen ${THEME.colors.bgMain} flex flex-col font-sans items-center justify-center`}>
        <div className="bg-white p-12 rounded-[32px] shadow-sm border border-gray-100 text-center">
          <Calendar size={48} className="mx-auto text-gray-200 mb-4" />
          <h1 className="text-xl font-black uppercase tracking-widest text-gray-400">Нет активного сезона</h1>
          <p className="text-xs text-gray-400 mt-2">Создайте сезон в разделе "Сезоны", чтобы управлять временем.</p>
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
    <div className={`w-full min-h-screen ${THEME.colors.bgMain} font-sans p-8 pb-40`}>
      <div className="max-w-[1000px] mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
              <Timer size={28} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Админ панель</span>
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none mt-1">
                Управление <span className={THEME.colors.primaryText}>Временем</span>
              </h1>
            </div>
          </div>
        </div>

        {/* ПУЛЬТ УПРАВЛЕНИЯ (Active Card) */}
        <div className="bg-emerald-600 rounded-[32px] p-8 text-white shadow-xl shadow-emerald-100 flex flex-col md:flex-row justify-between items-center relative overflow-hidden gap-6">
          <div className="relative z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm mb-3">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Текущий статус</span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter leading-none mb-1">
              {currentDay ? `ДЕНЬ ${currentDay.number}` : "ОЖИДАНИЕ"}
            </h2>
            <p className="text-emerald-100 text-sm font-medium opacity-80">
              Сезон {activeSeason.year} • Активная фаза симуляции
            </p>
          </div>
          
          <div className="relative z-10 w-full md:w-auto">
            <AdvanceTimeButton />
          </div>

          {/* Декор */}
          <Clock className="absolute -right-10 -bottom-10 text-black/5 w-64 h-64 rotate-12" />
        </div>

        {/* TIMELINE (Лента времени) */}
        <div className="bg-white border border-gray-100 rounded-[24px] shadow-sm overflow-hidden">
          <div className="bg-gray-50/50 px-8 py-5 border-b border-gray-100 flex items-center gap-3">
            <Calendar size={18} className="text-emerald-600" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
              Хронология событий
            </h3>
          </div>

          <div className="divide-y divide-gray-50">
            {days.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Календарь пуст</p>
                <p className="text-gray-300 text-[10px] mt-1">Сгенерируйте матчи в разделе "Сезоны"</p>
              </div>
            ) : (
              days.map((day) => (
                <div 
                  key={day.id} 
                  className={`flex items-center justify-between p-5 transition-all ${
                    day.isCurrent ? 'bg-emerald-50/40' : 'hover:bg-gray-50'
                  } ${day.isFinished ? 'opacity-50 grayscale' : ''}`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-sm
                      ${day.isCurrent ? 'bg-emerald-600 text-white shadow-emerald-200 scale-110' : 
                        day.isFinished ? 'bg-gray-100 text-gray-400' : 'bg-white border border-gray-200 text-gray-700'}
                    `}>
                      {day.number}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold text-sm uppercase tracking-tight ${day.isCurrent ? 'text-emerald-900' : 'text-gray-700'}`}>
                          {day.label || `Игровой день ${day.number}`}
                        </span>
                        {day.isCurrent && (
                          <span className="bg-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm shadow-red-200 animate-pulse">
                            Live
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {day.timeSlots.map(slot => (
                          <span key={slot.id} className="text-[9px] font-bold text-gray-400 uppercase bg-white border border-gray-100 px-2 py-1 rounded-md">
                            {slot.label}: {slot._count.matches} матчей
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    {day.isFinished ? (
                      <CheckCircle2 size={22} className="text-emerald-500" />
                    ) : day.isCurrent ? (
                      <div className="relative">
                        <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                        <Play size={22} className="text-emerald-600 relative z-10 fill-current" />
                      </div>
                    ) : (
                      <Circle size={22} className="text-gray-200" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}