"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { 
  Plus, Loader2, Trophy, Calendar, History, 
  LayoutTemplate, Users, PlayCircle, Trash2 
} from "lucide-react";

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSeasons = async () => {
    try {
      const res = await fetch("/api/admin/seasons");
      if (res.ok) {
        const data = await res.json();
        setSeasons(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchSeasons(); }, []);

  const createSeason = async () => {
    const input = prompt("Введите номер/год нового сезона (например: 2027):");
    if (input === null || input.trim() === "") return;

    const year = parseInt(input);
    if (isNaN(year)) {
      alert("Ошибка: Вы должны ввести число!");
      return;
    }

    if (!confirm(`Вы уверены? Будет создан Сезон ${year}. Текущий активный сезон будет завершен.`)) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seasons", { 
        method: "POST",
        body: JSON.stringify({ year }),
        headers: { "Content-Type": "application/json" }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      await fetchSeasons();
    } catch (e: any) {
      alert(`Ошибка: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteSeason = async (id: string, year: number) => {
    if (!confirm(`⚠️ ВНИМАНИЕ! Вы собираетесь удалить Сезон ${year}.\n\nЭто БЕЗВОЗВРАТНО удалит:\n- Все лиги этого сезона\n- Все команды в этих лигах\n- Всех игроков и матчи\n\nВы уверены?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/seasons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Ошибка удаления");
      
      // Удаляем из локального стейта, чтобы не ждать фетча
      setSeasons(prev => prev.filter(s => s.id !== id));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  const runSetupStep = async (seasonId: string, endpoint: string, actionKey: string) => {
    setActionLoading(`${seasonId}-${actionKey}`);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify({ seasonId }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(`✅ Успешно! \n${JSON.stringify(data.message || data.success)}`);
    } catch (e: any) {
      alert(`❌ Ошибка: ${e.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans">
      <Sidebar />

      <div className="bg-white border-b border-gray-200 px-8 py-4 shrink-0">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 border border-gray-200 flex items-center justify-center rounded-sm">
                <Calendar size={20} className="text-[#1a3151]" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter italic text-[#000c2d]">
                Управление <span className="text-[#e30613]">сезонами</span>
              </h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                Глобальная хронология лиги
              </p>
            </div>
          </div>
          
          <button 
            onClick={createSeason}
            disabled={loading}
            className="bg-[#000c2d] text-white px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-[#e30613] transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
            Запустить новый сезон
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {seasons.map((s) => (
            <div 
              key={s.id} 
              className={`bg-white p-6 border rounded-sm shadow-sm relative overflow-hidden group transition-all hover:shadow-lg flex flex-col ${
                s.status === 'ACTIVE' ? 'border-[#e30613] border-b-4' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="relative z-10 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-2.5 rounded-sm ${s.status === 'ACTIVE' ? 'bg-[#e30613] text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Trophy size={18} />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {s.status === 'ACTIVE' ? (
                        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-sm border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Active</span>
                        </div>
                    ) : (
                        <div className="bg-gray-50 px-3 py-1 rounded-sm border border-gray-100">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Archive</span>
                        </div>
                    )}
                    
                    {/* КНОПКА УДАЛЕНИЯ */}
                    <button 
                      onClick={() => deleteSeason(s.id, s.year)}
                      disabled={deletingId === s.id}
                      className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"
                      title="Удалить сезон"
                    >
                      {deletingId === s.id ? <Loader2 size={14} className="animate-spin text-red-600"/> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                        Официальный сезон
                    </span>
                    <h3 className="text-4xl font-black italic tracking-tighter text-[#000c2d] leading-none">
                        {s.year}
                    </h3>
                </div>

                {/* ПАНЕЛЬ НАСТРОЙКИ (ТОЛЬКО ДЛЯ АКТИВНОГО) */}
                {s.status === 'ACTIVE' && (
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                            Настройка старта
                        </p>
                        
                        <div className="space-y-2">
                            <button 
                                onClick={() => runSetupStep(s.id, "/api/admin/seasons/init-leagues", "init")}
                                disabled={!!actionLoading}
                                className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 text-[#000c2d] px-3 py-2 rounded-sm border border-gray-200 text-xs font-bold transition-all disabled:opacity-50"
                            >
                                <div className="flex items-center gap-2">
                                    <LayoutTemplate size={14} className="text-blue-600"/>
                                    <span>1. Создать Дивизионы</span>
                                </div>
                                {actionLoading === `${s.id}-init` && <Loader2 size={12} className="animate-spin"/>}
                            </button>

                            <button 
                                onClick={() => runSetupStep(s.id, "/api/admin/seasons/generate-teams", "teams")}
                                disabled={!!actionLoading}
                                className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 text-[#000c2d] px-3 py-2 rounded-sm border border-gray-200 text-xs font-bold transition-all disabled:opacity-50"
                            >
                                <div className="flex items-center gap-2">
                                    <Users size={14} className="text-purple-600"/>
                                    <span>2. Заполнить Команды</span>
                                </div>
                                {actionLoading === `${s.id}-teams` && <Loader2 size={12} className="animate-spin"/>}
                            </button>

                            <button 
                                onClick={() => runSetupStep(s.id, "/api/admin/seasons/generate-calendar", "calendar")}
                                disabled={!!actionLoading}
                                className="w-full flex items-center justify-between bg-[#000c2d] hover:bg-[#e30613] text-white px-3 py-2 rounded-sm text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <PlayCircle size={14}/>
                                    <span>3. Сгенерировать Календарь</span>
                                </div>
                                {actionLoading === `${s.id}-calendar` && <Loader2 size={12} className="animate-spin"/>}
                            </button>
                        </div>
                    </div>
                )}
              </div>

              <div className="absolute -right-4 -bottom-6 text-[#f2f5f7] font-black text-[120px] italic opacity-100 select-none group-hover:text-gray-100 transition-colors pointer-events-none -z-0">
                {s.year % 100}
              </div>
            </div>
          ))}

          {seasons.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center bg-white border border-dashed border-gray-300 rounded-sm">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                    История сезонов пуста
                </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}