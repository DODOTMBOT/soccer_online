"use client";

import { useState, useEffect } from "react";
import { 
  Play, FastForward, Loader2, Trophy, List, Calendar, Trash2, Archive, CheckCircle, AlertTriangle
} from "lucide-react";
import { useRouter } from "next/navigation";

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

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchSeasons = async () => {
    try {
      const res = await fetch("/api/admin/seasons");
      if (res.ok) setSeasons(await res.json());
    } catch (e) {
      console.error("Failed to fetch seasons", e);
    }
  };

  useEffect(() => { fetchSeasons(); }, []);

  const activeSeason = seasons.find(s => s.status === 'ACTIVE');

  // --- ЛОГИКА АКТИВНОГО СЕЗОНА ---

  const handleStartSeason = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seasons/transition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "CREATE_NEXT" })
      });
      if (res.ok) {
        fetchSeasons();
      }
    } finally { setLoading(false); }
  };

  const handleGenerateCalendar = async () => {
    if (!activeSeason) return;
    if (!confirm("Сгенерировать календарь для ВСЕХ лиг активного сезона?")) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seasons/generate-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seasonId: activeSeason.id })
      });
      const data = await res.json();
      if(res.ok) alert(data.message);
      else alert(data.error);
    } finally { setLoading(false); }
  };

  const handleRotate = async () => {
    if (!activeSeason) return;
    if (!confirm(`ЗАВЕРШИТЬ СЕЗОН ${activeSeason.year}?\n\nКоманды будут перемещены (2 вверх, 2 вниз).\nСтатистика обнулится.`)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/seasons/transition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "FINISH_AND_ROTATE", seasonId: activeSeason.id })
      });
      if (res.ok) {
        alert("Сезон завершен! Начат новый.");
        fetchSeasons();
      } else {
        alert("Ошибка ротации");
      }
    } finally { setLoading(false); }
  };

  // --- ЛОГИКА УДАЛЕНИЯ ---

  const handleDelete = async (id: string, year: number) => {
    const isConfirmed = confirm(
      `Вы точно хотите удалить сезон ${year}?\n\n` + 
      `ВАЖНО: Команды НЕ удалятся, они просто станут "свободными".\n` +
      `Матчи и таблицы этого сезона будут удалены навсегда.`
    );
    
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/seasons/${id}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        fetchSeasons();
      } else {
        alert("Ошибка при удалении сезона");
      }
    } catch (e) {
      console.error(e);
      alert("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full min-h-screen ${THEME.colors.bgMain} font-sans p-8 pb-20`}>
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
              <Trophy size={28} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Админ панель</span>
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none mt-1">
                Управление <span className={THEME.colors.primaryText}>Сезонами</span>
              </h1>
            </div>
          </div>
        </div>

        {/* 1. БЛОК АКТИВНОГО СЕЗОНА */}
        <section>
          {!activeSeason ? (
            <div className="bg-white p-12 rounded-[32px] shadow-sm border border-gray-100 text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Нет активного сезона</h2>
              <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
                Сейчас в системе нет запущенных соревнований. Создайте новый сезон, чтобы начать генерацию матчей.
              </p>
              <button 
                onClick={handleStartSeason} 
                disabled={loading}
                className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-emerald-700 transition-all flex items-center gap-3 mx-auto shadow-lg shadow-emerald-100"
              >
                {loading ? <Loader2 className="animate-spin" size={18}/> : <Play size={18} fill="currentColor" />}
                Начать новый сезон
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Карточка текущего сезона */}
              <div className="bg-emerald-600 text-white p-8 rounded-[32px] shadow-xl shadow-emerald-100 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="relative z-10 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm mb-4">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Active Season</span>
                  </div>
                  <h2 className="text-5xl font-black tracking-tight mb-2">СЕЗОН {activeSeason.year}</h2>
                  <p className="text-emerald-100 text-sm font-medium">Управление текущим игровым циклом</p>
                </div>
                
                <button 
                   onClick={() => handleDelete(activeSeason.id, activeSeason.year)}
                   className="relative z-20 bg-white/10 hover:bg-red-500 text-white p-3 rounded-xl transition-all backdrop-blur-md"
                   title="Удалить текущий сезон"
                >
                  <Trash2 size={20} />
                </button>

                <div className="absolute right-0 bottom-0 text-[180px] font-black text-black/5 leading-none -mb-8 -mr-8 select-none pointer-events-none">
                  {activeSeason.year}
                </div>
              </div>

              {/* Панель действий */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Шаг 2 */}
                <div className="bg-white p-6 border border-gray-100 rounded-[24px] shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">Этап 1</span>
                    <List size={20} className="text-gray-300 group-hover:text-emerald-500 transition-colors"/>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Настройка Лиг</h3>
                  <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                    Добавьте команды в дивизионы или отредактируйте состав лиг вручную перед стартом.
                  </p>
                  <button 
                    onClick={() => router.push('/admin/countries/list')}
                    className="w-full border border-gray-200 text-gray-600 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 hover:text-emerald-600 transition-all"
                  >
                    Редактировать
                  </button>
                </div>

                {/* Шаг 3 */}
                <div className="bg-white p-6 border border-gray-100 rounded-[24px] shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">Этап 2</span>
                    <Calendar size={20} className="text-gray-300 group-hover:text-emerald-500 transition-colors"/>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Календарь матчей</h3>
                  <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                    Сгенерировать расписание матчей для всех дивизионов по круговой системе.
                  </p>
                  <button 
                    onClick={handleGenerateCalendar}
                    disabled={loading}
                    className="w-full bg-emerald-600 text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin inline mr-2" size={14}/> : "Сгенерировать"}
                  </button>
                </div>

                {/* Шаг 4 */}
                <div className="bg-white p-6 border-l-4 border-red-500 rounded-[24px] rounded-l-none shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">Финал</span>
                    <FastForward size={20} className="text-gray-300 group-hover:text-red-500 transition-colors"/>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Завершение сезона</h3>
                  <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                    Закончить текущий год, провести ротацию команд и начать новый сезон.
                  </p>
                  <button 
                    onClick={handleRotate}
                    disabled={loading}
                    className="w-full bg-red-500 text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin inline mr-2" size={14}/> : "Завершить сезон"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 2. БЛОК АРХИВА / ИСТОРИИ */}
        <section>
          <div className="flex items-center gap-3 mb-6 px-2">
            <Archive size={18} className="text-emerald-600" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">
              Архив истории
            </h2>
          </div>

          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-8 py-4">Сезон</th>
                  <th className="px-6 py-4">Статус</th>
                  <th className="px-6 py-4">Создан</th>
                  <th className="px-8 py-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {seasons.map((season) => (
                  <tr key={season.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4 font-black text-gray-900 text-lg">
                      {season.year}
                    </td>
                    <td className="px-6 py-4">
                      {season.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Активен
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-gray-100 text-gray-500 uppercase tracking-wider">
                          <CheckCircle size={10} />
                          Завершен
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-400">
                      {new Date(season.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button
                        onClick={() => handleDelete(season.id, season.year)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Удалить сезон"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {seasons.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                      История сезонов пуста
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}