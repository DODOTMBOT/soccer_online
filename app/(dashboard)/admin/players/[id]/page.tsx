"use client";

import { useState, useEffect, use } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { ArrowLeft, Save, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function EditPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  
  // Справочники
  const [teams, setTeams] = useState<any[]>([]);
  const [styles, setStyles] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/players/${id}`).then(r => r.json()),
      fetch('/api/admin/teams').then(r => r.json()),
      fetch('/api/playstyles').then(r => r.json())
    ]).then(([pData, tData, sData]) => {
      setPlayer(pData);
      setTeams(tData);
      setStyles(sData);
      setLoading(false);
    });
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const payload = {
        firstName: player.firstName,
        lastName: player.lastName,
        age: Number(player.age),
        power: Number(player.power),
        mainPosition: player.mainPosition,
        teamId: player.teamId,
        playStyles: player.playStyles.map((ps: any) => ({
          definitionId: ps.definitionId,
          level: ps.level
        }))
      };

      const res = await fetch(`/api/admin/players/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Ошибка сохранения");
      
      toast.success("Игрок обновлен");
      router.refresh();
    } catch (e) {
      toast.error("Ошибка");
    } finally {
      setSaving(false);
    }
  };

  // Хендлер изменения плейстайла
  const toggleStyle = (defId: string) => {
    const existing = player.playStyles.find((ps: any) => ps.definitionId === defId);
    let newStyles = [...player.playStyles];

    if (!existing) {
      if (newStyles.length >= 5) return toast.error("Максимум 5 стилей");
      newStyles.push({ definitionId: defId, level: "BRONZE" });
    } else {
      // Цикл: BRONZE -> SILVER -> GOLD -> REMOVE
      if (existing.level === "BRONZE") existing.level = "SILVER";
      else if (existing.level === "SILVER") existing.level = "GOLD";
      else newStyles = newStyles.filter((ps: any) => ps.definitionId !== defId);
    }
    setPlayer({ ...player, playStyles: newStyles });
  };

  if (loading) return <div className="p-8">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans">
      <Sidebar />
      <form onSubmit={handleSave} className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <button type="button" onClick={() => router.back()} className="text-gray-400 hover:text-black"><ArrowLeft/></button>
          <h1 className="text-2xl font-black uppercase text-[#1a3151]">Редактор: {player.lastName}</h1>
          <button disabled={saving} className="bg-[#e30613] text-white px-6 py-3 rounded font-bold uppercase flex gap-2">
            {saving ? <Loader2 className="animate-spin"/> : <Save size={18}/>} Сохранить
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Основное */}
          <div className="bg-white p-6 rounded shadow-sm space-y-4">
            <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest border-b pb-2">Данные</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase block mb-1">Имя</label>
                <input className="w-full border p-2 rounded bg-gray-50 font-bold" value={player.firstName} onChange={e => setPlayer({...player, firstName: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase block mb-1">Фамилия</label>
                <input className="w-full border p-2 rounded bg-gray-50 font-bold" value={player.lastName} onChange={e => setPlayer({...player, lastName: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase block mb-1">Возраст</label>
                <input type="number" className="w-full border p-2 rounded bg-gray-50 font-bold" value={player.age} onChange={e => setPlayer({...player, age: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase block mb-1">Сила (RS)</label>
                <input type="number" className="w-full border p-2 rounded bg-gray-50 font-bold text-emerald-600" value={player.power} onChange={e => setPlayer({...player, power: e.target.value})} />
              </div>
            </div>
            
            <div>
              <label className="text-[10px] font-bold uppercase block mb-1">Клуб (Трансфер)</label>
              <select 
                className="w-full border p-2 rounded bg-gray-50 font-bold"
                value={player.teamId}
                onChange={e => setPlayer({...player, teamId: e.target.value})}
              >
                {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          {/* PlayStyles */}
          <div className="bg-white p-6 rounded shadow-sm">
            <div className="flex justify-between border-b pb-2 mb-4">
              <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest">PlayStyles</h3>
              <span className="text-xs font-black bg-gray-100 px-2 rounded">{player.playStyles.length} / 5</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-2">
              {styles.map((def: any) => {
                const active = player.playStyles.find((p: any) => p.definitionId === def.id);
                return (
                  <button 
                    key={def.id} type="button"
                    onClick={() => toggleStyle(def.id)}
                    className={`text-left p-2 border rounded text-[10px] font-bold uppercase transition-all ${
                      active 
                        ? active.level === 'GOLD' ? 'bg-yellow-100 border-yellow-400 text-yellow-800' 
                        : active.level === 'SILVER' ? 'bg-gray-200 border-gray-400 text-gray-800'
                        : 'bg-orange-100 border-orange-400 text-orange-800'
                        : 'bg-white text-gray-400 hover:border-blue-400'
                    }`}
                  >
                    {def.name} {active && `(${active.level})`}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}