"use client";

import { useState } from "react";
import { Zap, RotateCcw, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function MatchActions({ matchId, isFinished }: { matchId: string, isFinished: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (method: string) => {
    if (method === 'DELETE' && !confirm("Сбросить результат матча?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/matches/${matchId}/simulate`, { method });
      if (res.ok) router.refresh();
      else {
          const data = await res.json();
          alert(data.error || "Ошибка");
      }
    } catch (e) {
      alert("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3">
      {!isFinished ? (
        <button
          onClick={() => handleAction('POST')}
          disabled={loading}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} fill="currentColor" />}
          Генерировать матч
        </button>
      ) : (
        <button
          onClick={() => handleAction('DELETE')}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-200 text-slate-600 px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : <RotateCcw size={14} />}
          Сбросить результат
        </button>
      )}
    </div>
  );
}