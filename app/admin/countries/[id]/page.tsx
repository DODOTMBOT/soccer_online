"use client";

import { useState, useEffect, use } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { 
  Trophy, Users, Trash2, Edit2, Plus, 
  ArrowLeft, LayoutGrid, Loader2, CheckCircle2, XCircle 
} from "lucide-react";
import Link from "next/link";

export default function CountryManagePage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [country, setCountry] = useState<any>(null);
  const [allCountryTeams, setAllCountryTeams] = useState<any[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [targetLeagueId, setTargetLeagueId] = useState("");

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [res, tRes] = await Promise.all([
        fetch(`/api/admin/countries/${id}/full`),
        fetch(`/api/admin/countries/${id}/teams`)
      ]);

      const data = await res.json();
      const teams = await tRes.json();
      
      const serialize = (obj: any) => JSON.parse(JSON.stringify(obj, (k, v) => 
        typeof v === 'bigint' ? v.toString() : v
      ));

      setCountry(serialize(data));
      setAllCountryTeams(serialize(teams));
    } catch (err) {
      console.error("Ошибка загрузки:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadData(); 
  }, [id]);

  const handleAssignTeams = async (e: React.MouseEvent) => {
    // ЖЕСТКАЯ ОСТАНОВКА ПЕРЕЗАГРУЗКИ
    e.preventDefault();
    e.stopPropagation();

    if (!targetLeagueId || selectedTeams.length === 0 || actionLoading) return;
    
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/leagues/${targetLeagueId}/assign-teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamIds: selectedTeams }),
      });
      
      if (res.ok) {
        setSelectedTeams([]);
        await loadData();
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Ошибка при переносе");
      }
    } catch (err) { 
      alert("Критическая ошибка при связи с сервером"); 
    } finally {
      setActionLoading(false);
    }
  };

  const removeFromLeague = async (e: React.MouseEvent, teamId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/admin/leagues/unassign-team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });
      if (res.ok) {
        await loadData();
        router.refresh();
      }
    } catch (err) { console.error(err); }
  };

  const deleteLeague = async (e: React.MouseEvent, leagueId: string) => {
    e.preventDefault();
    if (!confirm("Удалить лигу? Все команды в ней станут свободными.")) return;
    try {
        const res = await fetch(`/api/admin/leagues/${leagueId}`, { method: "DELETE" });
        if (res.ok) {
          await loadData();
          router.refresh();
        }
    } catch (err) { alert("Ошибка при удалении"); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#1a3151]" size={40} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans text-[#1a3151]">
      <Sidebar />

      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin/countries/list" className="bg-gray-50 p-2 rounded-sm hover:bg-gray-100 transition-all">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-4">
              {country?.flag && (
                <img src={country.flag} className="w-12 h-8 object-cover border border-gray-200 shadow-sm" alt="" />
              )}
              <div>
                <h1 className="text-2xl font-black uppercase italic leading-tight">
                  Управление: <span className="text-[#e30613]">{country?.name}</span>
                </h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{country?.confederation || 'FIFA'} Federation</p>
              </div>
            </div>
          </div>
          <Link href="/admin/leagues/new" className="bg-[#000c2d] text-white px-5 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-[#e30613] transition-all flex items-center gap-2">
            <Plus size={14} /> Добавить дивизион
          </Link>
        </div>
      </div>

      <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* СПИСОК ЛИГ */}
          <div className="lg:col-span-3 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <LayoutGrid size={14} /> Структура дивизионов
            </h3>
            
            {country?.leagues?.map((league: any) => (
              <div key={league.id} className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="bg-[#1a3151] text-white text-[10px] font-black px-2 py-1 rounded-sm">L{league.level}</span>
                    <h4 className="text-sm font-black uppercase italic tracking-tight">{league.name}</h4>
                    <span className="text-[10px] font-bold text-gray-400 uppercase ml-4">
                      {league.teams?.length || 0} / {league.teamsCount} команд
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" type="button"><Edit2 size={14} /></button>
                    <button onClick={(e) => deleteLeague(e, league.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" type="button"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {league.teams?.map((team: any) => (
                    <div key={team.id} className="bg-white p-2 rounded-sm border border-gray-100 flex items-center justify-between group">
                      <div className="flex items-center gap-2 truncate">
                        <img src={team.logo || "/default-logo.png"} className="w-5 h-5 object-contain" alt="" />
                        <span className="text-[10px] font-bold truncate">{team.name}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => removeFromLeague(e, team.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ПАНЕЛЬ ПЕРЕНОСА */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Users size={14} /> Распределение
            </h3>
            
            <div className="bg-[#1a3151] p-6 rounded-sm shadow-xl text-white sticky top-8">
              <label className="text-[9px] font-black uppercase text-white/50 block mb-2">Целевая лига</label>
              <select 
                className="w-full bg-white/10 border border-white/20 rounded-sm px-4 py-3 text-xs font-bold mb-6 outline-none"
                value={targetLeagueId}
                onChange={(e) => setTargetLeagueId(e.target.value)}
              >
                <option value="" className="text-black">Выберите...</option>
                {country?.leagues?.map((l: any) => (
                  <option key={l.id} value={l.id} className="text-black">{l.name} (L{l.level})</option>
                ))}
              </select>

              <label className="text-[9px] font-black uppercase text-white/50 block mb-2">Команды ({selectedTeams.length})</label>
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-1 mb-6 pr-2">
                {allCountryTeams
                  .filter(t => t.leagueId !== targetLeagueId)
                  .map((team: any) => (
                    <label key={team.id} className={`flex items-center justify-between p-3 rounded-sm cursor-pointer transition-all ${selectedTeams.includes(team.id) ? 'bg-white/20 border border-white/30' : 'bg-white/5 border border-transparent hover:bg-white/10'}`}>
                      <div className="flex items-center gap-3 truncate">
                        <img src={team.logo || "/default-logo.png"} className="w-5 h-5 object-contain" alt="" />
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black uppercase truncate">{team.name}</span>
                           <span className="text-[8px] text-white/40 font-bold">
                             {country?.leagues?.find((l:any) => l.id === team.leagueId)?.name || "Без лиги"}
                           </span>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={selectedTeams.includes(team.id)}
                        onChange={() => {
                          setSelectedTeams(prev => 
                            prev.includes(team.id) ? prev.filter(tid => tid !== team.id) : [...prev, team.id]
                          )
                        }}
                      />
                      {selectedTeams.includes(team.id) && <CheckCircle2 size={14} className="text-emerald-400" />}
                    </label>
                ))}
              </div>

              <button 
                type="button"
                onClick={handleAssignTeams}
                disabled={!targetLeagueId || selectedTeams.length === 0 || actionLoading}
                className="w-full bg-[#e30613] hover:bg-white hover:text-[#e30613] text-white py-4 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-30 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={14}/> : "Подтвердить состав"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}