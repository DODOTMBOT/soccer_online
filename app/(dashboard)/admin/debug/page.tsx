"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Zap, Loader2, RefreshCw, CheckCircle2 } from "lucide-react";

export default function DebugPage() {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ processed: number; total: number } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/admin/seasons")
      .then(res => res.json())
      .then(data => setSeasons(data));
  }, []);

  const activeSeason = seasons.find((s: any) => s.status === 'ACTIVE');

  const handleSimulateAll = async () => {
    if (!activeSeason) return alert("Нет активного сезона");
    if (!confirm(`Начать массовую симуляцию сезона ${activeSeason.year}?`)) return;

    setLoading(true);
    setLogs([]);
    
    // Сначала узнаем общее количество матчей (грубая оценка)
    // В реале мы будем просто крутить цикл
    let totalProcessed = 0;
    
    const runBatch = async () => {
      try {
        const res = await fetch("/api/admin/debug/simulate-season", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seasonId: activeSeason.id, batchSize: 20 }), // По 20 матчей за раз
        });
        
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error);

        if (data.done) {
          setLogs(prev => [...prev, "✅ Сезон полностью сыгран!"]);
          setLoading(false);
          setProgress(null);
          return;
        }

        totalProcessed += data.processed;
        setLogs(prev => [`Сыграно матчей: ${totalProcessed}. Осталось: ${data.remaining}...`, ...prev.slice(0, 4)]);
        
        // Рекурсивный вызов следующей пачки
        runBatch();
        
      } catch (e: any) {
        setLogs(prev => [...prev, `❌ Ошибка: ${e.message}`]);
        setLoading(false);
      }
    };

    runBatch();
  };

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans">
      <Sidebar />
      <div className="p-8 max-w-4xl mx-auto w-full">
        
        <h1 className="text-2xl font-black uppercase text-[#1a3151] mb-8 flex items-center gap-3">
          <Zap className="text-yellow-500" /> Панель отладки
        </h1>

        <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-200">
          <div className="flex items-center justify-between bg-gray-50 p-6 border border-gray-100 rounded-sm">
            <div>
              <p className="text-sm font-bold text-[#1a3151] uppercase">Сезон {activeSeason?.year}</p>
              <p className="text-xs text-gray-400 font-medium mt-1">Авто-завершение всех матчей</p>
            </div>
            
            <button 
              onClick={handleSimulateAll}
              disabled={loading || !activeSeason}
              className={`
                px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3
                ${loading 
                  ? "bg-gray-200 text-gray-400 cursor-wait" 
                  : "bg-[#1a3151] text-white hover:bg-[#e30613] shadow-lg"}
              `}
            >
              {loading ? <Loader2 className="animate-spin" size={14}/> : <RefreshCw size={14}/>}
              {loading ? "Симуляция..." : "Запустить"}
            </button>
          </div>

          {/* LOG WINDOW */}
          <div className="mt-6 bg-[#0a1829] text-emerald-400 p-4 rounded-sm font-mono text-xs h-48 overflow-y-auto border border-gray-800 shadow-inner">
            {logs.length === 0 ? (
              <span className="text-gray-600 opacity-50">. . .</span>
            ) : (
              logs.map((l, i) => <div key={i} className="mb-1">{l}</div>)
            )}
          </div>
        </div>

      </div>
    </div>
  );
}