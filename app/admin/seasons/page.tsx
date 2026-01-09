"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { 
  Play, FastForward, Loader2, Trophy, List, Calendar, Trash2, Archive, CheckCircle
} from "lucide-react";
import { useRouter } from "next/navigation";

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
    // ИСПРАВЛЕНИЕ ЗДЕСЬ: добавлен класс flex-col
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans text-[#1a3151]">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        
        <h1 className="text-3xl font-black uppercase italic mb-8 flex items-center gap-3">
          <Trophy className="text-[#e30613]" size={32} />
          Управление сезонами
        </h1>

        {/* 1. БЛОК АКТИВНОГО СЕЗОНА */}
        <section className="mb-12">
          {!activeSeason ? (
            <div className="bg-white p-10 rounded shadow text-center border-t-4 border-emerald-500">
              <h2 className="text-2xl font-bold mb-2">Нет активного сезона</h2>
              <p className="text-gray-500 mb-6">Создайте сезон, чтобы начать соревнования.</p>
              <button 
                onClick={handleStartSeason} 
                disabled={loading}
                className="bg-emerald-600 text-white px-8 py-4 rounded font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 mx-auto"
              >
                {loading ? <Loader2 className="animate-spin"/> : <Play size={20} fill="currentColor" />}
                Начать сезон
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Карточка текущего сезона */}
              <div className="bg-[#1a3151] text-white p-6 rounded shadow-lg relative overflow-hidden flex justify-between items-center">
                <div className="relative z-10">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-[#e30613] mb-1">Active Season</p>
                  <h2 className="text-4xl font-black italic tracking-tighter">СЕЗОН {activeSeason.year}</h2>
                </div>
                
                <button 
                   onClick={() => handleDelete(activeSeason.id, activeSeason.year)}
                   className="relative z-20 bg-red-600/20 hover:bg-red-600 text-white p-2 rounded transition-colors"
                   title="Удалить текущий сезон"
                >
                  <Trash2 size={20} />
                </button>

                <div className="absolute right-0 bottom-0 text-[100px] font-black italic text-white/5 leading-none -mb-4 -mr-4">
                  {activeSeason.year}
                </div>
              </div>

              {/* Панель действий */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Шаг 2 */}
                <div className="bg-white p-5 border border-gray-200 rounded shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">ШАГ 2</span>
                    <h3 className="font-bold">Состав Лиг</h3>
                  </div>
                  <p className="text-xs text-gray-400 mb-4 h-10">
                    Добавьте или уберите команды из лиг вручную перед стартом.
                  </p>
                  <button 
                    onClick={() => router.push('/admin/countries/list')}
                    className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-bold hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <List size={16}/> Редактировать лиги
                  </button>
                </div>

                {/* Шаг 3 */}
                <div className="bg-white p-5 border border-gray-200 rounded shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">ШАГ 3</span>
                    <h3 className="font-bold">Календарь</h3>
                  </div>
                  <p className="text-xs text-gray-400 mb-4 h-10">
                    Сгенерировать матчи для всех дивизионов.
                  </p>
                  <button 
                    onClick={handleGenerateCalendar}
                    disabled={loading}
                    className="w-full bg-[#1a3151] text-white px-4 py-2 rounded text-sm font-bold hover:bg-[#233b5d] flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16}/> : <Calendar size={16}/>}
                    Генерация матчей
                  </button>
                </div>

                {/* Шаг 4 */}
                <div className="bg-white p-5 border-l-4 border-[#e30613] rounded shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">ФИНАЛ</span>
                    <h3 className="font-bold text-[#e30613]">Завершение</h3>
                  </div>
                  <p className="text-xs text-gray-400 mb-4 h-10">
                    Закончить сезон, провести ротацию и начать новый год.
                  </p>
                  <button 
                    onClick={handleRotate}
                    disabled={loading}
                    className="w-full bg-[#e30613] text-white px-4 py-2 rounded text-sm font-bold hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16}/> : <FastForward size={16}/>}
                    Завершить сезон
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 2. БЛОК АРХИВА / ИСТОРИИ */}
        <section>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-400 uppercase tracking-wider">
            <Archive size={20} />
            Архив сезонов
          </h2>

          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-bold text-xs">
                <tr>
                  <th className="px-6 py-4">Сезон</th>
                  <th className="px-6 py-4">Статус</th>
                  <th className="px-6 py-4">Дата создания</th>
                  <th className="px-6 py-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {seasons.map((season) => (
                  <tr key={season.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-lg">
                      {season.year}
                    </td>
                    <td className="px-6 py-4">
                      {season.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span>
                          Активен
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <CheckCircle size={10} />
                          Завершен
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(season.createdAt).toLocaleString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(season.id, season.year)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded hover:bg-red-50"
                        title="Удалить сезон (Команды останутся)"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {seasons.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">
                      История пуста
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