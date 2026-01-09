import { Users, Home, Activity, Coins, Edit3, ClipboardList } from "lucide-react";
import Link from "next/link";

interface TeamHeaderProps {
  team: any;
  upcomingMatchId?: string;
  hasSetup: boolean;
  isManager: boolean;
}

export function TeamHeader({ team, upcomingMatchId, hasSetup, isManager }: TeamHeaderProps) {
  const leagueName = team?.league?.name || 'Вне лиги';
  
  // --- ЛОГИКА: ВЫТАСКИВАЕМ ГОРОД ИЗ СТАДИОНА ---
  let finalCityName = 'Город не указан';
  let stadiumDisplay = team?.stadium || 'Не указан';

  // Если стадион пришел строкой (например: "Emirates Stadium (Лондон)")
  if (typeof stadiumDisplay === 'string') {
    // 1. Ищем текст внутри круглых скобок
    const match = stadiumDisplay.match(/\((.*?)\)/);
    
    if (match && match[1]) {
      // Нашли "Лондон" - записываем в переменную города
      finalCityName = match[1];
      
      // 2. Удаляем "(Лондон)" из названия стадиона, чтобы не дублировалось
      stadiumDisplay = stadiumDisplay.replace(/\(.*?\)/, '').trim();
    }
  }
  // ----------------------------------------------

  return (
    <div className="flex flex-col md:flex-row items-start gap-8 bg-white p-6 border border-gray-200 shadow-sm rounded-sm font-sans text-[#000c2d]">
      
      {/* ЛОГОТИП */}
      <div className="w-48 h-48 shrink-0 flex items-center justify-center bg-gray-50 border border-gray-100 p-4 rounded-sm">
        {team?.logo ? (
          <img src={team.logo} className="w-full h-full object-contain" alt="logo" />
        ) : (
          <div className="text-gray-200 font-black text-4xl uppercase italic">FC</div>
        )}
      </div>

      <div className="flex-1 space-y-4 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase italic text-[#000c2d] leading-none flex items-center gap-2">
              {team?.name || 'Загрузка...'} 
              {/* Выводим город, который вырезали из стадиона */}
              <span className="text-gray-400 font-medium not-italic text-lg">({finalCityName})</span>
            </h1>
            <div className="flex items-center gap-1 mt-1">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">{leagueName}</span>
            </div>
          </div>

          <div className="shrink-0">
            {isManager ? (
              upcomingMatchId ? (
                <Link
                  href={`/admin/matches/${upcomingMatchId}/lineup?teamId=${team.id}`}
                  className={`flex items-center gap-3 px-6 py-4 font-black uppercase text-[10px] tracking-widest transition-all shadow-md active:scale-95 border-b-4 ${
                    hasSetup 
                      ? 'bg-[#1a3151] text-white border-[#0a1829] hover:bg-[#0f213a]' 
                      : 'bg-[#e30613] text-white border-[#9b040d] hover:bg-[#c40511]'
                  }`}
                >
                  {hasSetup ? (
                    <>
                      <Edit3 size={14} className="text-yellow-400" />
                      <span>Редактировать состав</span>
                    </>
                  ) : (
                    <>
                      <ClipboardList size={14} />
                      <span>Отправить состав</span>
                    </>
                  )}
                </Link>
              ) : (
                <div className="px-6 py-4 border border-dashed border-gray-100 text-[9px] font-black text-gray-300 uppercase italic">
                  Матчи не запланированы
                </div>
              )
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-y-2 border-t border-gray-100 pt-4 max-w-md">
          <InfoRow icon={<Users size={12}/>} label="Менеджер" value={team?.manager ? team.manager.login : 'Вакантно'} isManager />
          
          {/* Выводим очищенный стадион */}
          <InfoRow icon={<Home size={12}/>} label="Стадион" value={stadiumDisplay} />
          
          <InfoRow icon={<Activity size={12}/>} label="База" value={`${team?.baseLevel || 1} уровень`} />
          <InfoRow icon={<Coins size={12}/>} label="Финансы" value={`${Number(team?.finances || 0).toLocaleString()} $`} isMoney />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, isMoney, isManager }: any) {
  return (
    <div className="flex items-center gap-2 text-[11px] leading-tight">
      <span className="text-gray-400 shrink-0">{icon}</span>
      <span className="font-bold text-gray-500 uppercase tracking-tighter shrink-0">{label}:</span>
      <span className={`font-black uppercase truncate ${isMoney ? 'text-[#000c2d]' : isManager ? 'text-emerald-600' : 'text-[#1a3151]'}`}>
        {value}
      </span>
    </div>
  );
}