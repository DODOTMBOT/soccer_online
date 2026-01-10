"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Trophy, Users, Trash2, Edit2, Plus, 
  ArrowLeft, LayoutGrid, Loader2, CheckCircle2, XCircle, 
  Settings, ChevronRight
} from "lucide-react";
import Link from "next/link";

const THEME = {
  colors: {
    bgMain: "bg-gray-50",
    primary: "bg-emerald-600",
    primaryText: "text-emerald-600",
    cardBg: "bg-white",
    textMain: "text-gray-900",
    textMuted: "text-gray-500",
  }
};

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

  useEffect(() => { loadData(); }, [id]);

  const handleAssignTeams = async (e: React.MouseEvent) => {
    e.preventDefault();
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

  const removeFromLeague = async (teamId: string) => {
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

  const deleteLeague = async (leagueId: string) => {
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
      <div className={`w-full min-h-screen ${THEME.colors.bgMain} flex items-center justify-center`}>
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen ${THEME.colors.bgMain} font-sans pb-20 p-8`}>
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-6">
            <Link href="/admin/countries/list" className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-4">
              {country?.flag && (
                <div className="w-14 h-9 rounded-lg overflow-hidden border border-gray-100 shadow-sm shrink-0">
                  <img src={country.flag} className="w-full h-full object-cover" alt="" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 leading-none">
                  {country?.name}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{country?.confederation || 'FIFA'}</span>
                </div>
              </div>
            </div>
          </div>
          <Link href="/admin/leagues/new" className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100">
            <Plus size={14} /> Создать дивизион
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Дивизионы */}
          <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-bold text-gray-400">{country?.leagues?.length || 0} Лиг активно</span>
            </div>

            {country?.leagues?.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-[32px] p-20 text-center">
                <Trophy size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Нет созданных дивизионов</p>
              </div>
            ) : (
              country?.leagues?.map((league: any) => (
                <div key={league.id} className="bg-white border border-gray-100 rounded-[24px] shadow-sm overflow-hidden group transition-all hover:shadow-md">
                  <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-sm shadow-emerald-100 uppercase">
                        Div {league.level}
                      </div>
                      <h4 className="text-sm font-black uppercase tracking-tight text-gray-800">{league.name}</h4>
                      <div className="h-4 w-[1px] bg-gray-200 ml-2" />
                      <div className="flex items-center gap-1.5 text-gray-400 ml-2">
                        <Users size={12} />
                        <span className="text-[10px] font-black">{league.teams?.length || 0} / {league.teamsCount}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Edit2 size={14} /></button>
                      <button onClick={() => deleteLeague(league.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {league.teams?.map((team: any) => (
                      <div key={team.id} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between group/item hover:border-emerald-200 transition-all">
                        <div className="flex items-center gap-3 truncate">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-50 shrink-0">
                            <img src={team.logo || "/default-logo.png"} className="w-5 h-5 object-contain" alt="" />
                          </div>
                          <span className="text-[11px] font-black uppercase truncate text-gray-700 tracking-tight">{team.name}</span>
                        </div>
                        <button 
                          onClick={() => removeFromLeague(team.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover/item:opacity-100 p-1"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Инструмент переноса */}
          <div className="space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2 px-2">
              <Settings size={14} className="text-emerald-500" /> Распределение
            </h3>
            
            <div className="bg-white border border-gray-100 p-6 rounded-[28px] shadow-sm sticky top-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 block mb-3 ml-1 tracking-widest italic">1. Целевой дивизион</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-xs font-black uppercase outline-none focus:ring-2 ring-emerald-500/10 transition-all appearance-none cursor-pointer"
                    value={targetLeagueId}
                    onChange={(e) => setTargetLeagueId(e.target.value)}
                  >
                    <option value="">Выбрать лигу...</option>
                    {country?.leagues?.map((l: any) => (
                      <option key={l.id} value={l.id}>{l.name} (L{l.level})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3 ml-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest italic">2. Выбор команд</label>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full">{selectedTeams.length}</span>
                  </div>
                  
                  <div className="max-h-[380px] overflow-y-auto custom-scrollbar space-y-2 pr-1">
                    {allCountryTeams
                      .filter(t => t.leagueId !== targetLeagueId)
                      .map((team: any) => (
                        <label key={team.id} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${selectedTeams.includes(team.id) ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-50 hover:bg-gray-50'}`}>
                          <div className="flex items-center gap-3 truncate">
                            <img src={team.logo || "/default-logo.png"} className="w-6 h-6 object-contain shrink-0" alt="" />
                            <div className="flex flex-col truncate">
                               <span className="text-[10px] font-black uppercase truncate text-gray-800">{team.name}</span>
                               <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">
                                 {country?.leagues?.find((l:any) => l.id === team.leagueId)?.name || "Без дивизиона"}
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
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${selectedTeams.includes(team.id) ? 'bg-emerald-600 border-emerald-600' : 'border-gray-200'}`}>
                            {selectedTeams.includes(team.id) && <CheckCircle2 size={10} className="text-white" />}
                          </div>
                        </label>
                    ))}
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handleAssignTeams}
                  disabled={!targetLeagueId || selectedTeams.length === 0 || actionLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
                >
                  {actionLoading ? <Loader2 className="animate-spin" size={14}/> : "Обновить составы"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}