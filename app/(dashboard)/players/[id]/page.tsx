import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/auth";
import { PlayerService } from "@/src/server/services/player.service";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { User, Shield, Activity, Zap, Lock } from "lucide-react";
import { PlayerActions } from "@/components/player/PlayerActions";
import { prisma } from "@/src/server/db";
import { PlayStyleLevel } from "@prisma/client";

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  // Получаем свежий teamId
  let viewerTeamId = session?.user?.teamId;
  if (session?.user?.id) {
    const freshUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { managedTeam: true }
    });
    viewerTeamId = freshUser?.managedTeam?.id;
  }

  const isAdmin = session?.user?.role === "ADMIN";

  const player = await PlayerService.getProfile(
    id, 
    viewerTeamId,
    isAdmin
  );

  if (!player) notFound();

  const canViewHiddenStats = player.isOwner || isAdmin;

  // Карта цветов для уровней (типизированная)
  const LEVEL_COLORS: Record<PlayStyleLevel, string> = {
    [PlayStyleLevel.BRONZE]: "bg-orange-50 text-orange-900 border-orange-200",
    [PlayStyleLevel.SILVER]: "bg-slate-100 text-slate-800 border-slate-300",
    [PlayStyleLevel.GOLD]:   "bg-yellow-50 text-yellow-900 border-yellow-300"
  };

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans text-[#1a3151]">
      <Sidebar />

      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        {/* КАРТОЧКА ИГРОКА */}
        <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 overflow-hidden">
          
          <div className="bg-[#1a3151] p-8 text-white flex items-start gap-6 relative overflow-hidden">
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
              
              {canViewHiddenStats ? (
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
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-sm text-center">
                  <Lock className="mx-auto text-gray-300 mb-2" size={24} />
                  <p className="text-[10px] font-black uppercase text-gray-400">Данные доступны только владельцу</p>
                </div>
              )}
            </div>

            {/* БЛОК PLAYSTYLES */}
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">PlayStyles</h3>
                <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded text-gray-500">
                  {player.playStyles.length} / 5
                </span>
              </div>

              {player.playStyles.length === 0 ? (
                <div className="text-center py-6 text-gray-300 text-[10px] font-black uppercase border border-dashed border-gray-200 rounded-lg">Нет активных стилей</div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {player.playStyles.map((ps) => {
                    const theme = LEVEL_COLORS[ps.level];

                    return (
                      <div key={ps.id} className={`flex items-center justify-between p-3 border rounded-lg ${theme}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center font-black text-xs shadow-sm">
                            {ps.definition.code[0]}
                          </div>
                          <div>
                            <p className="text-[11px] font-black uppercase leading-none">{ps.definition.name}</p>
                            <p className="text-[9px] opacity-70 font-bold mt-0.5">{ps.definition.category}</p>
                          </div>
                        </div>
                        <div className="text-[9px] font-black uppercase tracking-widest px-2 bg-white/50 rounded py-0.5">
                          {ps.level}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>

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