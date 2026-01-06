import { Clock, Info, Trophy, ShieldAlert, Zap } from 'lucide-react';

export function MatchTimeline({ events, isFinished, homeTeamName, awayTeamName }: any) {
  // Функция для определения иконки события
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'GOAL': return <Trophy size={14} className="text-emerald-600" />;
      case 'SAVE': return <ShieldAlert size={14} className="text-blue-500" />;
      case 'CHANCE': return <Zap size={14} className="text-amber-500" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-slate-900 px-8 py-5 flex justify-between items-center">
        <h3 className="text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
          <Clock size={14} className="text-emerald-400" /> Хронология матча
        </h3>
        {isFinished && (
          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full">
            Final Report
          </span>
        )}
      </div>

      <div className="p-8">
        {!isFinished ? (
          <div className="py-20 text-center space-y-4">
            <Info className="text-slate-200 mx-auto" size={48} />
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
              Подробности появятся после генерации
            </p>
          </div>
        ) : (
          <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {events && events.length > 0 ? (
              events.map((event: any, i: number) => {
                const isGoal = event.type === 'GOAL';
                const isHome = event.team === 'HOME';

                return (
                  <div key={i} className="flex items-start gap-6 relative z-10 group">
                    {/* Кружок с минутой */}
                    <div className={`
                      w-9 h-9 rounded-xl flex items-center justify-center font-black italic text-xs shrink-0 shadow-sm border transition-all
                      ${isGoal 
                        ? 'bg-emerald-500 text-white border-emerald-400 ring-4 ring-emerald-50 scale-110' 
                        : 'bg-white text-slate-500 border-slate-200 group-hover:border-slate-400'}
                    `}>
                      {isGoal ? '!' : `${event.minute}'`}
                    </div>

                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        {/* Название команды - теперь четкое */}
                        <span className={`
                          text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded
                          ${isHome 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-amber-50 text-amber-700'}
                        `}>
                          {isHome ? homeTeamName : awayTeamName}
                        </span>
                        
                        {/* Иконка типа события */}
                        {getEventIcon(event.type)}
                      </div>

                      {/* Текст события - исправлен цвет с text-slate-50 на нормальный */}
                      <p className={`
                        text-sm font-bold leading-snug tracking-tight
                        ${isGoal ? 'text-slate-900 text-base' : 'text-slate-600'}
                      `}>
                        {event.text}
                        {isGoal && <span className="inline-block ml-2 text-emerald-500">⚽</span>}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center">
                <p className="text-slate-300 uppercase font-black text-[10px] tracking-widest">
                  Событий не зафиксировано
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}