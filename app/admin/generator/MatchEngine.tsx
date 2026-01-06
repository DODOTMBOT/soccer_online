"use client";

import { useState, useEffect } from "react";
import { playMatch } from "@/lib/soccer-engine";

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

  const handleSimulate = () => {
    if (!t1 || !t2) return;
    setIsSimulating(true);
    setTimeout(() => {
      const res = playMatch(t1, t2);
      setResult({ s1: res.homeScore, s2: res.awayScore });
      setIsSimulating(false);
    }, 600);
  };

  if (!t1 || !t2) return <div className="p-10 text-center uppercase font-black opacity-20">Загрузка данных...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <div className="bg-slate-900 rounded-[45px] p-10 text-white shadow-2xl text-center">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-xl font-black uppercase w-1/3 truncate text-left">{t1.name}</h2>
          <div className="text-7xl font-black italic flex justify-center gap-4 w-1/3">
            <span>{result ? result.s1 : 0}</span>
            <span className="text-slate-700">:</span>
            <span>{result ? result.s2 : 0}</span>
          </div>
          <h2 className="text-xl font-black uppercase w-1/3 truncate text-right">{t2.name}</h2>
        </div>
        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className="bg-emerald-500 hover:bg-emerald-400 text-white px-12 py-4 rounded-full font-black text-[10px] tracking-[0.2em] transition-all"
        >
          {isSimulating ? "СИМУЛЯЦИЯ..." : "ЗАПУСТИТЬ ТЕСТ"}
        </button>
      </div>
    </div>
  );
}