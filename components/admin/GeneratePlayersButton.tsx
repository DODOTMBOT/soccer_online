"use client";

import { useState } from "react";
import { Users, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function GeneratePlayersButton({ teamId }: { teamId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    if (!confirm("Создать состав из 18 игроков?")) return;
    setLoading(true);
    
    try {
      const res = await fetch("/api/admin/teams/generate-players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });
      
      if (res.ok) {
        router.refresh(); // Перезагружает серверные данные на странице
      } else {
        alert("Ошибка при создании игроков на сервере");
      }
    } catch (e) {
      alert("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleGenerate}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all disabled:opacity-50"
    >
      {loading ? <Loader2 className="animate-spin" size={14} /> : <Users size={14} />}
      Заполнить состав (18)
    </button>
  );
}