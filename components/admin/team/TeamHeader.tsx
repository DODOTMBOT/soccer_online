import { Users, Home, Activity, Coins, Info, ClipboardList, Edit3 } from "lucide-react";
import Link from "next/link";

interface TeamHeaderProps {
  team: any;
  upcomingMatchId?: string;
  hasSetup: boolean;
}

export function TeamHeader({ team, upcomingMatchId, hasSetup }: TeamHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start gap-8 bg-white p-6 border border-gray-200 shadow-sm rounded-sm font-sans text-[#000c2d]">
      
      {/* ЛОГОТИП */}
      <div className="w-48 h-48 shrink-0 flex items-center justify-center bg-gray-50 border border-gray-100 p-4">
        {team.logo ? (
          <img src={team.logo} className="w-full h-full object-contain" alt="logo" />
        ) : (
          <div className="text-gray-200 font-black text-4xl uppercase italic">FC</div>
        )}
      </div>

      {/* СВЕДЕНИЯ О КЛУБЕ */}
      <div className="flex-1 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase italic text-[#000c2d] leading-none flex items-center gap-2">
              {team.name} 
              <span className="text-gray-400 font-medium not-italic text-lg">
                ({team.league?.country?.name || 'Страна не указана'})
              </span>
            </h1>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1 italic">
              {team.league?.name || 'Вне лиги'} • Турнирное положение: <span className="underline">7 место</span>
            </p>
          </div>

          {/* КНОПКА ОТПРАВКИ/РЕДАКТИРОВАНИЯ СОСТАВА (СПРАВА) */}
          <div className="shrink-0">
            {upcomingMatchId ? (
              <Link
                href={`/admin/matches/${upcomingMatchId}/lineup?teamId=${team.id}`}
                className={`flex items-center gap-3 px-6 py-4 font-black uppercase text-[10px] tracking-widest transition-all shadow-md active:scale-95 ${
                  hasSetup 
                    ? 'bg-[#1a3151] text-white border-b-4 border-[#0a1829] hover:bg-[#0f213a]' 
                    : 'bg-[#e30613] text-white border-b-4 border-[#9b040d] hover:bg-[#c40511]'
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
            )}
          </div>
        </div>

        {/* БЛОК СВЕДЕНИЙ В СТОЛБИК */}
        <div className="grid grid-cols-1 gap-y-2 border-t border-gray-100 pt-4 max-w-md">
          <InfoRow 
            icon={<Users size={12}/>} 
            label="Менеджер" 
            value={`${team.manager?.surname || 'Вакантно'} ${team.manager?.name || ''}`} 
            isManager 
          />
          <InfoRow 
            icon={<Home size={12}/>} 
            label="Стадион" 
            value={`"${team.stadium || 'Арена'}", 60 тыс.`} 
          />
          <InfoRow 
            icon={<Activity size={12}/>} 
            label="База" 
            value={`${team.baseLevel || 1} уровень (36 из 36 слотов)`} 
          />
          <InfoRow 
            icon={<Coins size={12}/>} 
            label="Финансы" 
            value={`${team.finances?.toLocaleString() || 0} $`} 
            isMoney 
          />
          <InfoRow 
            icon={<Users size={12}/>} 
            label="Ростер" 
            value={`${team.players?.length || 0} футболистов`} 
          />
          <InfoRow 
            icon={<Info size={12}/>} 
            label="Атмосфера" 
            value="-5%" 
            isRed 
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, isMoney, isManager, isRed }: any) {
  return (
    <div className="flex items-center gap-2 text-[11px] leading-tight">
      <span className="text-gray-400 shrink-0">{icon}</span>
      <span className="font-bold text-gray-500 uppercase tracking-tighter shrink-0">{label}:</span>
      <span className={`font-black uppercase truncate ${
        isMoney ? 'text-[#000c2d]' : 
        isManager ? 'text-emerald-600' : 
        isRed ? 'text-red-500' : 
        'text-[#1a3151]'
      }`}>
        {value}
      </span>
    </div>
  );
}