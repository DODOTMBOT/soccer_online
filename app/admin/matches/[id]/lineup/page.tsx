"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { 
  Users, ArrowLeft, Loader2, Save, Shield, Settings, Info
} from "lucide-react";
import { Philosophy, DefenseSetup, Formation, Mentality, TeamSpirit } from "@prisma/client";

const PHILOSOPHY_NAMES: Record<Philosophy, string> = {
  TIKI_TAKA: "Тики Така",
  JOGA_BONITO: "Joga Bonito",
  INTENSIVO: "Интенсивный",
  GEGENPRESS: "Гегенпрессинг",
  CHOLO: "Чоло",
  BUS: "Автобус"
};

const MENTALITY_NAMES: Record<Mentality, string> = {
  ULTRA_DEFENSIVE: "Суперзащитный",
  DEFENSIVE: "Защитный",
  BALANCED: "Сбалансированный",
  ATTACKING: "Атакующий",
  ULTRA_ATTACKING: "Суператакующий"
};

const SPIRIT_NAMES: Record<TeamSpirit, string> = {
  SUPER: "Супернастрой",
  NORMAL: "Обычный",
  REST: "Отдых"
};

export default function MatchLineupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: matchId } = use(params);
  const searchParams = useSearchParams();
  const teamId = searchParams.get("teamId");
  const router = useRouter();

  const [team, setTeam] = useState<any>(null);
  const [matchData, setMatchData] = useState<any>(null);
  const [lineup, setLineup] = useState<Record<number, string>>({});
  const [subs, setSubs] = useState<Record<number, string>>({});
  
  // Поля из БД
  const [tactic, setTactic] = useState<Philosophy>("TIKI_TAKA");
  const [defense, setDefense] = useState<DefenseSetup>("ZONAL");
  const [formation, setFormation] = useState<Formation>("F442");
  const [mentality, setMentality] = useState<Mentality>("BALANCED");
  const [spirit, setSpirit] = useState<TeamSpirit>("NORMAL");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!teamId || !matchId) {
        setError("Не указан ID команды или матча");
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const [tRes, mRes] = await Promise.all([
          fetch(`/api/admin/teams/${teamId}`),
          fetch(`/api/admin/matches/${matchId}`)
        ]);

        if (!tRes.ok) throw new Error(`Ошибка загрузки команды: ${tRes.status}`);
        if (!mRes.ok) throw new Error(`Ошибка загрузки матча: ${mRes.status}`);

        const tData = await tRes.json();
        const mData = await mRes.json();

        setTeam(tData);
        setMatchData(mData);

        const existing = mData?.setups?.find((s: any) => s.teamId === teamId);
        if (existing) {
          const newLineup: Record<number, string> = {};
          const newSubs: Record<number, string> = {};
          existing.lineupSlots?.forEach((slot: any) => {
            if (slot.slotIndex <= 10) newLineup[slot.slotIndex] = slot.playerId;
            else newSubs[slot.slotIndex] = slot.playerId;
          });
          setLineup(newLineup);
          setSubs(newSubs);
          setTactic(existing.tactic || "TIKI_TAKA");
          setDefense(existing.defenseSetup || "ZONAL");
          setFormation(existing.formation || "F442");
          setMentality(existing.mentality || "BALANCED");
          setSpirit(existing.spirit || "NORMAL");
        }
      } catch (e: any) {
        console.error(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [matchId, teamId]);

  const handlePlayerSelect = (slotIndex: number, pId: string, isSub: boolean) => {
    if (isSub) setSubs(prev => ({ ...prev, [slotIndex]: pId }));
    else setLineup(prev => ({ ...prev, [slotIndex]: pId }));
  };

  const saveForm = async () => {
    const playerIdsArray = Object.values(lineup).filter(id => id && id !== "");
    const subIdsArray = Object.values(subs).filter(id => id && id !== "");

    if (playerIdsArray.length !== 11) {
      return alert(`Необходимо выбрать 11 основных игроков. Сейчас: ${playerIdsArray.length}`);
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/matches/lineup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId, teamId, 
          playerIds: playerIdsArray,
          subIds: subIdsArray,
          tactic, 
          defenseSetup: defense,
          formation,
          mentality,
          spirit
        })
      });
      if (res.ok) {
        router.push(`/admin/teams/${teamId}`);
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Ошибка при сохранении");
      }
    } catch (e) {
      alert("Критическая ошибка при сохранении!");
    } finally {
      setSaving(false);
    }
  };

  const currentPower = team?.players
    ? team.players.filter((p: any) => Object.values(lineup).includes(p.id)).reduce((sum: number, p: any) => sum + (p.power || 0), 0)
    : 0;

  const busyPlayerIds = [...Object.values(lineup), ...Object.values(subs)].filter(id => id !== "");

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#f2f5f7] gap-4">
      <Loader2 className="animate-spin text-[#000c2d]" size={40} />
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Загрузка тактического планшета...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans">
      <Sidebar />

      <div className="bg-white border-b border-gray-200 px-8 py-4 shrink-0">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-gray-400 hover:text-[#000c2d]">
              <ArrowLeft size={18} />
            </button>
            <div>
               <h1 className="text-xl font-black uppercase tracking-tighter italic text-[#000c2d]">
                 Состав на матч: <span className="text-[#e30613]">{team?.name || "???"}</span>
               </h1>
               <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                 {matchData?.homeTeam?.name} vs {matchData?.awayTeam?.name} • Тур {matchData?.tour || "?"}
               </p>
            </div>
          </div>
          <button 
            onClick={saveForm} 
            disabled={saving} 
            className="bg-[#000c2d] text-white px-8 py-3 rounded-sm font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#e30613] disabled:opacity-50 flex items-center gap-3 transition-all"
          >
            {saving ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>} Подтвердить план на игру
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-[1400px] mx-auto space-y-4">
          
          {/* TOP BAR: SETTINGS */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-2 bg-white border border-gray-200 p-3 shadow-sm">
               <label className="text-[8px] font-black uppercase text-gray-400 mb-1 block tracking-widest">Схема</label>
               <select 
                 value={formation} 
                 onChange={(e) => { setFormation(e.target.value as Formation); setLineup({}); }} 
                 className="w-full p-1.5 bg-gray-50 border border-gray-200 text-[10px] font-bold outline-none"
               >
                 {Object.values(Formation).map(f => <option key={f} value={f}>{f.replace('F', '').split('').join('-')}</option>)}
               </select>
            </div>
            <div className="col-span-12 lg:col-span-3 bg-white border border-gray-200 p-3 shadow-sm">
               <label className="text-[8px] font-black uppercase text-gray-400 mb-1 block tracking-widest">Стиль игры</label>
               <select 
                 value={tactic} 
                 onChange={(e) => setTactic(e.target.value as Philosophy)} 
                 className="w-full p-1.5 bg-gray-50 border border-gray-200 text-[10px] font-bold outline-none"
               >
                 {Object.values(Philosophy).map(p => <option key={p} value={p}>{PHILOSOPHY_NAMES[p]}</option>)}
               </select>
            </div>
            <div className="col-span-12 lg:col-span-3 bg-white border border-gray-200 p-3 shadow-sm">
               <label className="text-[8px] font-black uppercase text-gray-400 mb-1 block tracking-widest">Менталитет</label>
               <select 
                 value={mentality} 
                 onChange={(e) => setMentality(e.target.value as Mentality)} 
                 className="w-full p-1.5 bg-gray-50 border border-gray-200 text-[10px] font-bold outline-none"
               >
                 {Object.values(Mentality).map(m => <option key={m} value={m}>{MENTALITY_NAMES[m]}</option>)}
               </select>
            </div>
            <div className="col-span-12 lg:col-span-2 bg-white border border-gray-200 p-3 shadow-sm">
               <label className="text-[8px] font-black uppercase text-gray-400 mb-1 block tracking-widest">Настрой</label>
               <select 
                 value={spirit} 
                 onChange={(e) => setSpirit(e.target.value as TeamSpirit)} 
                 className="w-full p-1.5 bg-gray-50 border border-gray-200 text-[10px] font-bold outline-none"
               >
                 {Object.values(TeamSpirit).map(s => <option key={s} value={s}>{SPIRIT_NAMES[s]}</option>)}
               </select>
            </div>
            <div className="col-span-12 lg:col-span-2 bg-[#000c2d] p-3 flex items-center justify-between shadow-lg">
               <div>
                  <span className="text-[8px] font-black uppercase text-white/40 block">RS Power</span>
                  <span className="text-xl font-black text-emerald-400 italic leading-none">{currentPower}</span>
               </div>
               <Shield className="text-white/10" size={28} />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* ROSTER */}
            <div className="w-full lg:w-1/4 bg-white border border-gray-200 shadow-sm flex flex-col h-[650px]">
               <div className="bg-[#1a3151] text-white p-3 flex justify-between items-center shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-widest">Доступные игроки</span>
                  <Users size={14} className="opacity-50" />
               </div>
               <div className="flex-1 overflow-y-auto divide-y divide-gray-100 custom-scrollbar">
                 {team?.players?.length > 0 ? (
                    team.players.map((p: any) => {
                      const isUsed = busyPlayerIds.includes(p.id);
                      return (
                        <div key={p.id} className={`p-3 flex justify-between items-center transition-all ${isUsed ? 'opacity-25 bg-gray-50 grayscale' : 'hover:bg-blue-50'}`}>
                          <div className="flex flex-col">
                             <span className="text-[8px] font-black text-[#e30613] uppercase mb-0.5">{p.mainPosition || p.position}</span>
                             <span className="text-[11px] font-bold text-[#000c2d] uppercase tracking-tight">{p.lastName}</span>
                          </div>
                          <span className="font-black text-xs text-gray-400 italic">{p.power}</span>
                        </div>
                      );
                    })
                 ) : (
                    <div className="p-12 text-center text-gray-300 text-[10px] font-black italic">РОСТЕР ПУСТ</div>
                 )}
               </div>
            </div>

            {/* FIELD */}
            <div className="flex-1 bg-[#1a3151] relative overflow-hidden h-[650px] border-4 border-[#0a1829] shadow-inner">
               <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
               
               <div className="absolute inset-0 p-8 grid grid-rows-5 items-center z-10">
                  {renderFormation(formation, team?.players || [], lineup, busyPlayerIds, handlePlayerSelect)}
               </div>
            </div>

            {/* BENCH */}
            <div className="w-full lg:w-64 bg-white border border-gray-200 shadow-sm p-4 h-[650px] flex flex-col">
               <h3 className="font-black text-[10px] uppercase tracking-widest text-[#000c2d] border-b pb-2 mb-4">Резерв (S1-S9)</h3>
               <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                 {[11, 12, 13, 14, 15, 16, 17, 18, 19].map((idx) => (
                   <div key={idx} className="group">
                     <label className="text-[7px] font-black text-gray-400 uppercase ml-1 mb-1 block">Запасной #{idx-10}</label>
                     <select 
                        value={subs[idx] || ""} 
                        onChange={(e) => handlePlayerSelect(idx, e.target.value, true)} 
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-sm text-[10px] font-bold outline-none"
                     >
                       <option value="">-- ВЫБРАТЬ --</option>
                       {team?.players?.filter((p:any) => !busyPlayerIds.includes(p.id) || p.id === subs[idx]).map((p: any) => (
                         <option key={p.id} value={p.id}>[{p.mainPosition}] {p.lastName} (RS: {p.power})</option>
                       ))}
                     </select>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Вспомогательная функция для рендера схем
function renderFormation(f: Formation, players: any[], lineup: any, busyIds: string[], onSelect: any) {
  const GK = <Slot index={0} label="GK" value={lineup[0]} players={players} busyIds={busyIds} onSelect={onSelect} />;
  
  // Конфигурации линий
  const lines: Record<Formation, React.ReactNode[]> = {
    F442: [
      <div className="flex justify-around"><Slot index={9} label="CF" value={lineup[9]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={10} label="CF" value={lineup[10]} players={players} busyIds={busyIds} onSelect={onSelect} /></div>,
      <div className="flex justify-around"><Slot index={5} label="LM" value={lineup[5]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={6} label="CM" value={lineup[6]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={7} label="CM" value={lineup[7]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={8} label="RM" value={lineup[8]} players={players} busyIds={busyIds} onSelect={onSelect} /></div>,
      <div className="flex justify-around pt-10"><Slot index={1} label="LD" value={lineup[1]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={2} label="CD" value={lineup[2]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={3} label="CD" value={lineup[3]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={4} label="RD" value={lineup[4]} players={players} busyIds={busyIds} onSelect={onSelect} /></div>
    ],
    F433: [
      <div className="flex justify-around"><Slot index={9} label="LW" value={lineup[9]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={10} label="ST" value={lineup[10]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={8} label="RW" value={lineup[8]} players={players} busyIds={busyIds} onSelect={onSelect} /></div>,
      <div className="flex justify-around"><Slot index={5} label="CM" value={lineup[5]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={6} label="DM" value={lineup[6]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={7} label="CM" value={lineup[7]} players={players} busyIds={busyIds} onSelect={onSelect} /></div>,
      <div className="flex justify-around pt-10"><Slot index={1} label="LD" value={lineup[1]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={2} label="CD" value={lineup[2]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={3} label="CD" value={lineup[3]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={4} label="RD" value={lineup[4]} players={players} busyIds={busyIds} onSelect={onSelect} /></div>
    ],
    F424: [
      <div className="flex justify-around"><Slot index={10} label="LW" value={lineup[10]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={9} label="CF" value={lineup[9]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={8} label="CF" value={lineup[8]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={7} label="RW" value={lineup[7]} players={players} busyIds={busyIds} onSelect={onSelect} /></div>,
      <div className="flex justify-center gap-20"><Slot index={5} label="CM" value={lineup[5]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={6} label="CM" value={lineup[6]} players={players} busyIds={busyIds} onSelect={onSelect} /></div>,
      <div className="flex justify-around pt-10"><Slot index={1} label="LD" value={lineup[1]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={2} label="CD" value={lineup[2]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={3} label="CD" value={lineup[3]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={4} label="RD" value={lineup[4]} players={players} busyIds={busyIds} onSelect={onSelect} /></div>
    ],
    F532: [
      <div className="flex justify-center gap-16"><Slot index={9} label="CF" value={lineup[9]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={10} label="CF" value={lineup[10]} players={players} busyIds={busyIds} onSelect={onSelect} /></div>,
      <div className="flex justify-around"><Slot index={6} label="CM" value={lineup[6]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={7} label="CM" value={lineup[7]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={8} label="CM" value={lineup[8]} players={players} busyIds={busyIds} onSelect={onSelect} /></div>,
      <div className="flex justify-around pt-10"><Slot index={1} label="LD" value={lineup[1]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={2} label="CD" value={lineup[2]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={3} label="SW" value={lineup[3]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={4} label="CD" value={lineup[4]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={5} label="RD" value={lineup[5]} players={players} busyIds={busyIds} onSelect={onSelect} /></div>
    ],
    F523: [
      <div className="flex justify-around"><Slot index={10} label="LW" value={lineup[10]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={9} label="ST" value={lineup[9]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={8} label="RW" value={lineup[8]} players={players} busyIds={busyIds} onSelect={onSelect} /></div>,
      <div className="flex justify-center gap-20"><Slot index={6} label="CM" value={lineup[6]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={7} label="CM" value={lineup[7]} players={players} busyIds={busyIds} onSelect={onSelect} /></div>,
      <div className="flex justify-around pt-10"><Slot index={1} label="LD" value={lineup[1]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={2} label="CD" value={lineup[2]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={3} label="SW" value={lineup[3]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={4} label="CD" value={lineup[4]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={5} label="RD" value={lineup[5]} players={players} busyIds={busyIds} onSelect={onSelect} /></div>
    ],
    F352: [
      <div className="flex justify-center gap-16"><Slot index={9} label="CF" value={lineup[9]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={10} label="CF" value={lineup[10]} players={players} busyIds={busyIds} onSelect={onSelect} /></div>,
      <div className="flex justify-around"><Slot index={4} label="LM" value={lineup[4]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={5} label="CM" value={lineup[5]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={6} label="DM" value={lineup[6]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={7} label="CM" value={lineup[7]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={8} label="RM" value={lineup[8]} players={players} busyIds={busyIds} onSelect={onSelect} /></div>,
      <div className="flex justify-center gap-16 pt-10"><Slot index={1} label="CD" value={lineup[1]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={2} label="CD" value={lineup[2]} players={players} busyIds={busyIds} onSelect={onSelect} /><Slot index={3} label="CD" value={lineup[3]} players={players} busyIds={busyIds} onSelect={onSelect} /></div>
    ],
  };

  return (
    <>
      {lines[f][0]}
      {lines[f][1]}
      {lines[f][2]}
      <div className="flex justify-center pt-12">{GK}</div>
    </>
  );
}

function Slot({ index, label, value, players, busyIds, onSelect }: any) {
  const p = players?.find((pl: any) => pl.id === value);
  const filteredPlayers = React.useMemo(() => {
    if (!players) return [];
    return players
      .filter((pl: any) => (!busyIds.includes(pl.id) || pl.id === value) && (label === "GK" ? pl.mainPosition === "GK" : pl.mainPosition !== "GK"))
      .sort((a: any, b: any) => (b.mainPosition === label ? 1 : 0) - (a.mainPosition === label ? 1 : 0) || b.power - a.power);
  }, [players, label, busyIds, value]);

  return (
    <div className="flex flex-col items-center gap-1">
       <div className={`w-10 h-10 rounded-sm border flex items-center justify-center transition-all ${p ? 'bg-[#e30613] border-white scale-110 shadow-lg' : 'bg-[#000c2d]/50 border-white/10 text-white/20'}`}>
         {p ? <span className="text-[10px] font-black text-white italic">{p.power}</span> : <span className="text-[8px] font-black">{label}</span>}
       </div>
       <select value={value || ""} onChange={(e) => onSelect(index, e.target.value, false)} className="w-20 bg-[#0a1829]/90 border border-white/10 rounded-sm text-[7px] font-black text-white p-1 outline-none text-center">
         <option value="">-- {label} --</option>
         {filteredPlayers.map((pl: any) => <option key={pl.id} value={pl.id}>[{pl.mainPosition}] {pl.lastName} ({pl.power})</option>)}
       </select>
       {p && <div className="bg-[#0a1829] px-1 rounded shadow-sm max-w-[80px]"><p className="text-[7px] font-black text-white uppercase truncate text-center">{p.lastName}</p></div>}
    </div>
  );
}