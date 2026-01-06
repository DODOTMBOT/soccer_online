"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Plus, Loader2, Trophy } from "lucide-react";

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSeasons = async () => {
    const res = await fetch("/api/admin/seasons");
    const data = await res.json();
    setSeasons(data);
  };

  useEffect(() => { fetchSeasons(); }, []);

  const createSeason = async () => {
    setLoading(true);
    await fetch("/api/admin/seasons", { method: "POST" });
    await fetchSeasons();
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-[#F0F2F5]">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">Управление <span className="text-emerald-500">сезонами</span></h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Создание и переключение игровых лет</p>
          </div>
          <button 
            onClick={createSeason}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
            Начать новый сезон
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {seasons.map((s) => (
            <div key={s.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <Trophy size={24} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {s.status === 'ACTIVE' ? 'Активен' : 'Завершен'}
                  </span>
                </div>
                <h3 className="text-4xl font-black italic tracking-tighter text-slate-900">СЕЗОН {s.year}</h3>
              </div>
              <div className="absolute -right-4 -bottom-4 text-slate-50 font-black text-9xl italic opacity-50 group-hover:text-emerald-50 transition-colors">
                {s.year}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}