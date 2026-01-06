"use client";

import { useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function SimulateTourButton({ leagueId, tour, seasonId }: { leagueId: string, tour: number, seasonId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/leagues/simulate-tour", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leagueId, tour, seasonId }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleSimulate}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-md disabled:opacity-50"
    >
      {loading ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} fill="currentColor" />}
      Сыграть тур
    </button>
  );
}