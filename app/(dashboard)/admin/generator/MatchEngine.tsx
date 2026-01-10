"use client";

import { useState, useEffect } from "react";
// Убрали импорт playMatch!

export default function MatchEngine({ teams = [] }: { teams: any[] }) {
  const [team1Id, setTeam1Id] = useState<string | null>(null);
  const [team2Id, setTeam2Id] = useState<string | null>(null);
  const [result, setResult] = useState<{ s1: number; s2: number } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (teams?.length >= 2) {
      setTeam1Id(teams[0].id);
      setTeam2Id(teams[1].id);
    }
  }, [teams]);

  const t1 = teams.find((t) => t.id === team1Id);
  const t2 = teams.find((t) => t.id === team2Id);

  const handleSimulate = async () => {
    if (!team1Id || !team2Id) return;
    setIsSimulating(true);
    
    try {
      const res = await fetch("/api/admin/generator/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team1Id, team2Id }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setResult({ s1: data.homeScore, s2: data.awayScore });
      } else {
        alert("Ошибка демо-симуляции");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  if (!t1 || !t2) return <div className="p-10 text-center uppercase font-black opacity-20">Загрузка данных...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <div className="bg-slate-900 rounded-[45px] p-10 text-white shadow-2xl text-center">
        <div className="flex justify-between items-center mb-10">
          <div className="w-1/3 text-left">
             <h2 className="text-xl font-black uppercase truncate">{t1.name}</h2>
             <select 
               className="mt-2 bg-slate-800 text-[10px] p-2 rounded w-full"
               onChange={e => setTeam1Id(e.target.value)}
               value={team1Id || ""}
             >
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
             </select>
          </div>

          <div className="text-7xl font-black italic flex justify-center gap-4 w-1/3">
            <span>{result ? result.s1 : 0}</span>
            <span className="text-slate-700">:</span>
            <span>{result ? result.s2 : 0}</span>
          </div>

          <div className="w-1/3 text-right">
             <h2 className="text-xl font-black uppercase truncate">{t2.name}</h2>
             <select 
               className="mt-2 bg-slate-800 text-[10px] p-2 rounded w-full"
               onChange={e => setTeam2Id(e.target.value)}
               value={team2Id || ""}
             >
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
             </select>
          </div>
        </div>
        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className="bg-emerald-500 hover:bg-emerald-400 text-white px-12 py-4 rounded-full font-black text-[10px] tracking-[0.2em] transition-all disabled:opacity-50"
        >
          {isSimulating ? "СИМУЛЯЦИЯ..." : "ТЕСТОВЫЙ МАТЧ"}
        </button>
      </div>
    </div>
  );
}