"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Shield, User, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export function DevTools() {
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 1. Загружаем список всех команд
  useEffect(() => {
    fetch("/api/admin/teams")
      .then((res) => res.json())
      .then((data) => setTeams(data));
  }, []);

  // 2. Функция: Взять команду себе
  const claimTeam = async (teamId: string) => {
    if (!confirm("Стать менеджером этой команды?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/users/claim-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });
      if (res.ok) {
        alert("Успешно! Теперь это твой клуб.");
        router.refresh();
        // Обновляем локальный список, чтобы показать менеджера
        fetch("/api/admin/teams").then(r => r.json()).then(setTeams);
      } else {
        alert("Ошибка (возможно, клуб занят)");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 3. Функция: Загрузить игроков команды (чтобы получить ID для ссылки)
  const loadTeamDetails = async (teamId: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin/teams/${teamId}`);
    const data = await res.json();
    setSelectedTeam(data);
    setLoading(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-8">
      <h2 className="text-xl font-black uppercase text-[#1a3151] mb-4 flex items-center gap-2">
        <Zap className="text-[#e30613]" /> Панель разработчика (Debug)
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* СПИСОК КОМАНД */}
        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar border p-2 rounded">
          {teams.map((t) => (
            <div key={t.id} className="flex justify-between items-center p-2 hover:bg-slate-50 border-b last:border-0">
              <span className="text-xs font-bold truncate w-1/3">{t.name}</span>
              
              <div className="flex gap-2">
                {/* Кнопка ВЗЯТЬ КОМАНДУ */}
                {!t.manager ? (
                  <button 
                    onClick={() => claimTeam(t.id)}
                    disabled={loading}
                    className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-black uppercase hover:bg-emerald-200"
                  >
                    Взять
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400 font-bold px-2 py-1 bg-slate-100 rounded">
                    {t.manager.login}
                  </span>
                )}

                {/* Кнопка ПОКАЗАТЬ ИГРОКОВ */}
                <button 
                  onClick={() => loadTeamDetails(t.id)}
                  className="bg-[#1a3151] text-white px-2 py-1 rounded text-[10px] font-black uppercase hover:bg-[#2c4c7c]"
                >
                  Игроки
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* СПИСОК ИГРОКОВ ВЫБРАННОЙ КОМАНДЫ */}
        <div className="bg-slate-50 p-4 rounded border">
          <h3 className="text-xs font-black uppercase text-slate-400 mb-2">
            Игроки: {selectedTeam?.name || "Выберите команду"}
          </h3>
          
          <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
            {selectedTeam?.players?.map((p: any) => (
              <Link 
                key={p.id} 
                href={`/players/${p.id}`} // <--- ВОТ ОНА, ССЫЛКА НА СТРАНИЦУ ИГРОКА
                className="flex justify-between items-center p-2 bg-white border border-slate-200 rounded hover:border-[#e30613] transition-all group"
              >
                <span className="text-[10px] font-bold text-[#1a3151] group-hover:text-[#e30613]">
                  {p.firstName} {p.lastName}
                </span>
                <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 rounded">
                  {p.mainPosition}
                </span>
              </Link>
            ))}
            {!selectedTeam && <p className="text-[10px] text-slate-400 italic">Нажми "Игроки" слева...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}