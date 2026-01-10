"use client";

import { useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Play, Bug, RefreshCcw } from "lucide-react";

export default function MatchLabPage() {
  const [seed, setSeed] = useState<string>("test-seed-123");
  const [result, setResult] = useState<any>(null);
  
  // Заглушка данных команд
  const [homeTeam, setHomeTeam] = useState({
    name: "Red Team",
    players: Array(11).fill(null).map((_, i) => ({ id: `h${i}`, name: `H-Player ${i}`, power: 80, assignedPosition: "CM" }))
  });
  
  const [awayTeam, setAwayTeam] = useState({
    name: "Blue Team",
    players: Array(11).fill(null).map((_, i) => ({ id: `a${i}`, name: `A-Player ${i}`, power: 70, assignedPosition: "CM" }))
  });

  const runSimulation = async () => {
    const res = await fetch("/api/admin/match-lab", {
      method: "POST",
      body: JSON.stringify({ homeTeam, awayTeam, seed })
    });
    setResult(await res.json());
  };

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans">
      <Sidebar />
      <div className="p-8 max-w-[1600px] mx-auto w-full grid grid-cols-12 gap-6 h-[calc(100vh-64px)]">
        
        {/* INPUT PANEL */}
        <div className="col-span-4 bg-white p-6 rounded shadow-sm overflow-y-auto">
          <h2 className="font-black uppercase text-[#1a3151] mb-4 flex items-center gap-2">
            <Bug /> Match Lab Config
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-gray-400 block">Seed (Воспроизводимость)</label>
              <div className="flex gap-2">
                <input className="border p-2 w-full font-mono text-sm bg-gray-50" value={seed} onChange={e => setSeed(e.target.value)} />
                <button onClick={() => setSeed(Math.random().toString(36))} className="p-2 bg-gray-200 rounded"><RefreshCcw size={14}/></button>
              </div>
            </div>

            <div className="p-4 bg-red-50 border border-red-100 rounded">
              <h3 className="font-bold text-red-800 text-xs mb-2">HOME TEAM OVERRIDE</h3>
              <textarea 
                className="w-full h-32 text-[10px] font-mono p-2 border"
                value={JSON.stringify(homeTeam, null, 2)}
                onChange={e => setHomeTeam(JSON.parse(e.target.value))}
              />
            </div>

            <button onClick={runSimulation} className="w-full bg-[#1a3151] text-white py-4 font-black uppercase tracking-widest hover:bg-[#e30613] transition-all flex justify-center gap-2">
              <Play size={16} /> Run Simulation
            </button>
          </div>
        </div>

        {/* OUTPUT PANEL */}
        <div className="col-span-8 bg-white p-6 rounded shadow-sm overflow-hidden flex flex-col">
          {result ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-center mb-6 bg-gray-50 p-4 rounded border">
                <div className="text-3xl font-black italic text-[#1a3151]">
                  {result.homeScore} : {result.awayScore}
                </div>
                <div className="text-xs font-mono text-gray-500">
                  xG: {result.homeXG} - {result.awayXG}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto border rounded bg-[#0a1829] text-green-400 font-mono text-xs p-4">
                {result.debug?.trace?.map((line: any, i: number) => (
                  <div key={i} className="mb-1 border-b border-white/10 pb-1">
                    <span className="text-yellow-500">[{line.minute}&apos;]</span> <span className="text-white font-bold">{line.phase}</span>
                    <div className="pl-6 text-gray-400">
                      {/* ИСПРАВЛЕНИЕ: Используем &rarr; вместо -> для избежания ошибки JSX */}
                      {JSON.stringify(line.calc)} &rarr; <span className="text-cyan-400">{line.outcome}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-300 font-black uppercase">
              Waiting for run...
            </div>
          )}
        </div>

      </div>
    </div>
  );
}