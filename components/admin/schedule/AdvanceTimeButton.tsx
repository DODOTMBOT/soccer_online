"use client";

import { useState } from "react";
import { Play, Loader2, FastForward } from "lucide-react";
import { useRouter } from "next/navigation";

export function AdvanceTimeButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdvance = async () => {
    if (!confirm("Завершить текущий игровой день и сыграть все матчи?")) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/schedule/advance", {
        method: "POST",
      });
      const data = await res.json();
      
      if (res.ok) {
        alert(data.message || `День завершен! Сыграно матчей: ${data.playedMatches}`);
        router.refresh();
      } else {
        alert(data.error || "Ошибка");
      }
    } catch (e) {
      alert("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleAdvance}
      disabled={loading}
      className="flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-sm text-xs font-black uppercase tracking-widest transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 className="animate-spin" size={18} /> : <FastForward size={18} fill="currentColor" />}
      <span>Завершить день / Играть матчи</span>
    </button>
  );
}