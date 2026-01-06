"use client";

import { useState, useEffect } from "react";
import { Calendar, Loader2, X, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export function GenerateCalendarModal({ leagueId, teamsCount }: { leagueId: string, teamsCount: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rounds, setRounds] = useState(2);
  const [loading, setLoading] = useState(false);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState("");
  const router = useRouter();

  // Подгружаем список сезонов при открытии модалки
  useEffect(() => {
    if (isOpen) {
      fetch("/api/admin/seasons")
        .then(res => res.json())
        .then(data => {
          setSeasons(data);
          // Автоматически выбираем активный сезон, если он есть
          const active = data.find((s: any) => s.status === "ACTIVE");
          if (active) setSelectedSeasonId(active.id);
          else if (data.length > 0) setSelectedSeasonId(data[0].id);
        });
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (teamsCount < 2) {
      alert("Добавьте хотя бы 2 команды в дивизион");
      return;
    }

    if (!selectedSeasonId) {
      alert("Сначала создайте сезон в базе данных (Season 1)");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/leagues/generate-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          leagueId, 
          roundsCount: rounds,
          seasonId: selectedSeasonId // Передаем выбранный сезон
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Ошибка генерации");

      alert(`Календарь создан для Сезона ${seasons.find(s => s.id === selectedSeasonId)?.year}!`);
      setIsOpen(false);
      router.refresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-slate-200"
      >
        <Calendar size={16} /> Создать календарь
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setIsOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors"><X size={24}/></button>
            
            <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-2">Генерация</h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8">Настройка расписания</p>

            <div className="space-y-6">
              {/* ВЫБОР СЕЗОНА */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Целевой Сезон</label>
                <div className="relative flex items-center">
                  <select 
                    value={selectedSeasonId}
                    onChange={(e) => setSelectedSeasonId(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold appearance-none outline-none focus:ring-2 ring-emerald-500/20"
                  >
                    {seasons.length === 0 && <option value="">Сезоны не найдены</option>}
                    {seasons.map(s => (
                      <option key={s.id} value={s.id}>
                        Сезон {s.year} {s.status === "ACTIVE" ? "(Текущий)" : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 text-slate-300 pointer-events-none" size={18} />
                </div>
              </div>

              {/* КРУГИ */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Количество кругов</label>
                <input 
                  type="number" 
                  min="1" max="10"
                  value={rounds}
                  onChange={(e) => setRounds(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-black text-2xl outline-none focus:ring-2 ring-emerald-500/20"
                />
              </div>

              <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                <p className="text-[11px] font-bold text-emerald-700 leading-relaxed uppercase tracking-tight">
                  Матчи будут привязаны к выбранному сезону. Старый календарь этого сезона для данной лиги будет удален.
                </p>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading || seasons.length === 0}
                className="w-full bg-slate-900 text-white py-6 rounded-[25px] font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Запустить генератор"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}