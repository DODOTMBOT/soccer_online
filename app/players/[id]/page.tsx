import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/auth";
import { PlayerService } from "@/src/server/services/player.service";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { User, Shield, Activity, Star, Zap } from "lucide-react";
import { PlayerActions } from "@/components/player/PlayerActions";
import { prisma } from "@/src/server/db"; // <--- 1. ДОБАВЛЕН ИМПОРТ PRISMA

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  // --- 2. ИСПРАВЛЕНИЕ НАЧАЛО ---
  // Сессия может быть старой, поэтому достаем свежий ID команды напрямую из базы
  let viewerTeamId = session?.user?.teamId;

  if (session?.user?.id) {
    const freshUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { managedTeam: true }
    });
    viewerTeamId = freshUser?.managedTeam?.id;
  }
  // --- 2. ИСПРАВЛЕНИЕ КОНЕЦ ---

  const player = await PlayerService.getProfile(
    id, 
    viewerTeamId, // Используем свежий ID
    session?.user?.role === "ADMIN"
  );

  if (!player) notFound();

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans text-[#1a3151]">
      <Sidebar />

      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        {/* КАРТОЧКА ИГРОКА */}
        <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Верхняя часть (Шапка) */}
          <div className="bg-[#1a3151] p-8 text-white flex items-start gap-6 relative overflow-hidden">
            {/* Аватарка */}
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/20 shrink-0">
              <User size={40} className="text-white/80" />
            </div>

            <div className="z-10">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl font-black uppercase italic tracking-tighter">
                  {player.firstName} <span className="text-[#e30613]">{player.lastName}</span>
                </span>
                {player.country?.flag && <img src={player.country.flag} className="w-6 h-4 object-cover" alt="" />}
              </div>
              
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-white/60 mb-4">
                <span>{player.age} лет</span>
                <span>•</span>
                <span className="text-[#e30613]">{player.mainPosition}</span>
                {player.team && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-white">
                      <Shield size={12} /> {player.team.name}
                    </span>
                  </>
                )}
              </div>

              {/* Инфобар */}
              <div className="flex gap-4">
                <div className="bg-[#e30613] px-4 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Zap size={12} fill="currentColor" />
                  RS: {player.power}
                </div>
                <div className="bg-white/20 px-4 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest">
                  {player.displayPrice}
                </div>
              </div>
            </div>

            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-[#e30613]/20 to-transparent pointer-events-none" />
          </div>

          {/* Статы */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
            
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Физическая форма</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>Физ. готовность</span>
                  <span className={player.fitness > 90 ? "text-emerald-600" : "text-orange-500"}>{player.fitness}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${player.fitness}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>Усталость</span>
                  <span className="text-gray-500">{player.fatigue}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: `${player.fatigue}%` }}></div>
                </div>
              </div>

              {(player.isOwner || session?.user?.role === 'ADMIN') && (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mt-6">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-3 flex items-center gap-2">
                    <Activity size={12}/> Скаутский отчет (Скрыто)
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase">Потенциал</span>
                      <span className="text-blue-900 text-lg">{player.potential}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase">Травматичность</span>
                      <span className="text-orange-700 text-lg">{player.injuryProne}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2 mb-4">Спецвозможности</h3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { k: 'specSpeed', l: 'Скорость' }, { k: 'specShooting', l: 'Удар' }, 
                  { k: 'specDribbling', l: 'Дриблинг' }, { k: 'specTackling', l: 'Отбор' },
                  { k: 'specLongPass', l: 'Длин.пас' }, { k: 'specHeading', l: 'Голова' }
                ].map((spec) => {
                  const val = player[spec.k as keyof typeof player] as number;
                  if (!val || val === 0) return null;
                  return (
                    <div key={spec.k} className="bg-gray-50 border border-gray-200 p-2 flex flex-col items-center justify-center rounded-sm aspect-square">
                      <Star size={16} className={val >= 3 ? "text-yellow-500 fill-yellow-500" : "text-gray-400"} />
                      <span className="text-[9px] font-bold mt-1 text-center leading-none uppercase">{spec.l}</span>
                      <span className="text-lg font-black text-[#1a3151] leading-none mt-1">Lv.{val}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ПАНЕЛЬ ДЕЙСТВИЙ */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end gap-3">
            <PlayerActions 
              playerId={player.id}
              isOwner={player.isOwner}
              isOnTransfer={player.market.isOnTransfer}
              marketPrice={player.transferPrice}
              realPrice={player.price}
            />
          </div>

        </div>
      </main>
    </div>
  );
}