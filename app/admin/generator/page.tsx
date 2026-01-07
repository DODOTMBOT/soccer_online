"use client";
import { useState, useEffect } from "react";
import { Loader2, Users } from "lucide-react";

export default function GeneratorPage() {
  const [leagues, setLeagues] = useState<any[]>([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [loading, setLoading] = useState(false);

  // Загружаем список лиг при входе
  useEffect(() => {
    fetch("/api/admin/leagues").then(res => res.json()).then(setLeagues);
  }, []);

  const handleGenerate = async () => {
    if (!selectedLeague) return alert("Выберите лигу!");
    setLoading(true);
    
    try {
      const res = await fetch("/api/admin/seed/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          leagueId: selectedLeague,
          targetCount: 22, // Сколько игроков должно быть в команде
          minPower: 50,
          maxPower: 70
        })
      });
      const data = await res.json();
      alert(data.message || data.error);
    } catch (e) {
      alert("Ошибка!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black uppercase mb-6 text-[#1a3151]">Генератор игроков</h1>
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="text-xs font-bold uppercase text-slate-400 block mb-2">Выберите Дивизион</label>
          <select 
            className="w-full p-3 bg-slate-50 border rounded-lg font-bold text-sm"
            onChange={(e) => setSelectedLeague(e.target.value)}
          >
            <option value="">-- Список лиг --</option>
            {leagues.map((l: any) => (
              <option key={l.id} value={l.id}>{l.name} ({l.country.name})</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-[#e30613] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Users size={18} />}
          Заполнить команды ботами
        </button>
        
        <p className="text-[10px] text-slate-400 text-center">
          *Создаст игроков до 22 человек в каждой команде выбранной лиги.
        </p>
      </div>
    </div>
  );
}