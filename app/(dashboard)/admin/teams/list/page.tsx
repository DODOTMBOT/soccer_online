"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Shield, ChevronRight, Plus, 
  Trash2, Loader2, Users, Globe, ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import Link from "next/link";

// --- НАСТРОЙКИ ДИЗАЙНА ---
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

const formatMoney = (val: number) => {
  return new Intl.NumberFormat('ru-RU').format(val);
};

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export default function TeamsListPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCountries, setExpandedCountries] = useState<Record<string, boolean>>({});
  
  // Состояние сортировки
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/teams');
      if (!res.ok) throw new Error("Ошибка загрузки");
      const data = await res.json();
      setTeams(data);
      
      const initialExpanded: Record<string, boolean> = {};
      data.forEach((t: any) => {
        const countryName = typeof t.country === 'object' ? t.country?.name : t.country;
        initialExpanded[countryName || "Другие"] = true;
      });
      setExpandedCountries(initialExpanded);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeams(); }, []);

  const toggleCountry = (country: string) => {
    setExpandedCountries(prev => ({ ...prev, [country]: !prev[country] }));
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 1. Поиск и фильтрация
  const filteredTeams = useMemo(() => {
    return teams.filter(team => 
      team.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [teams, searchQuery]);

  // 2. Группировка и Сортировка внутри групп
  const groupedTeams = useMemo(() => {
    const groups = filteredTeams.reduce((acc: any, team) => {
      const countryName = typeof team.country === 'object' ? team.country?.name : team.country;
      const key = countryName || "Другие";
      if (!acc[key]) acc[key] = [];
      acc[key].push(team);
      return acc;
    }, {});

    // Сортировка внутри каждой группы
    Object.keys(groups).forEach(country => {
      groups[country].sort((a: any, b: any) => {
        let aValue: any;
        let bValue: any;

        switch (sortConfig.key) {
          case 'name': aValue = a.name; bValue = b.name; break;
          case 'league': aValue = a.league?.name || ""; bValue = b.league?.name || ""; break;
          case 'players': aValue = a._count?.players || 0; bValue = b._count?.players || 0; break;
          case 'finances': aValue = a.finances || 0; bValue = b.finances || 0; break;
          default: aValue = a.name; bValue = b.name;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    });

    return groups;
  }, [filteredTeams, sortConfig]);

  const totalFinances = useMemo(() => {
    return filteredTeams.reduce((sum, t) => sum + (Number(t.finances) || 0), 0);
  }, [filteredTeams]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Удалить клуб ${name}? Это действие необратимо.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/teams/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Ошибка при удалении");
      setTeams(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={`w-full min-h-full ${THEME.colors.bgMain} font-sans p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Админ панель / Реестр клубов</span>
          <Link 
            href="/admin/teams/new" 
            className={`${THEME.colors.primary} text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-sm`}
          >
            <Plus size={14} /> Создать клуб
          </Link>
        </div>

        <hr className="border-gray-200" />

        {/* Info & Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Клубов</p>
            <p className="text-xl font-black text-gray-900">{filteredTeams.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Общий бюджет</p>
            <p className={`text-xl font-black ${THEME.colors.primaryText}`}>{formatMoney(totalFinances)}</p>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="ПОИСК..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 text-[10px] font-bold outline-none focus:ring-2 ring-emerald-500/10 transition-all shadow-sm py-4 uppercase tracking-widest" 
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin inline-block text-emerald-600" /></div>
        ) : (
          <div className="space-y-4">
            {Object.keys(groupedTeams).sort().map((countryName) => {
              const countryData = groupedTeams[countryName][0]?.country;
              // Пытаемся получить код страны для флага
              const countryCode = typeof countryData === 'object' ? countryData?.code?.toLowerCase() : null;

              return (
                <div key={countryName} className="space-y-2">
                  {/* Header Страны с флагом */}
                  <div 
                    onClick={() => toggleCountry(countryName)}
                    className="flex items-center justify-between px-5 py-3.5 cursor-pointer bg-white hover:bg-gray-50 rounded-2xl border border-gray-200 shadow-sm transition-all select-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-6 relative flex-shrink-0 bg-gray-100 rounded-sm overflow-hidden border border-gray-100 flex items-center justify-center">
                        {countryCode ? (
                          <img 
                            src={`https://flagcdn.com/w80/${countryCode}.png`} 
                            className="w-full h-full object-cover"
                            alt={countryName}
                            onError={(e) => {
                              // Если картинка не загрузилась, заменяем на иконку
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <Globe size={14} className="text-gray-300" />
                        )}
                      </div>
                      <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-800">
                        {countryName} <span className="ml-2 text-emerald-500">({groupedTeams[countryName].length})</span>
                      </h3>
                    </div>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${!expandedCountries[countryName] ? '-rotate-90' : ''}`} />
                  </div>

                  {expandedCountries[countryName] && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[8px] font-black uppercase tracking-widest">
                            <th className="px-6 py-2.5 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => requestSort('name')}>
                              <div className="flex items-center gap-1">Команда <ArrowUpDown size={8}/></div>
                            </th>
                            <th className="px-6 py-2.5 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => requestSort('league')}>
                              <div className="flex items-center gap-1">Лига <ArrowUpDown size={8}/></div>
                            </th>
                            <th className="px-6 py-2.5 text-center cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => requestSort('players')}>
                              <div className="flex items-center justify-center gap-1">Игр <ArrowUpDown size={8}/></div>
                            </th>
                            <th className="px-6 py-2.5 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => requestSort('finances')}>
                              <div className="flex items-center gap-1">Бюджет <ArrowUpDown size={8}/></div>
                            </th>
                            <th className="px-6 py-2.5 text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {groupedTeams[countryName].map((team: any) => (
                            <tr key={team.id} className="hover:bg-gray-50/50 transition-all group">
                              <td className="px-6 py-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 group-hover:border-emerald-100 transition-colors overflow-hidden">
                                    {team.logo ? <img src={team.logo} className="w-6 h-6 object-contain" alt="" /> : <Shield size={16} className="text-gray-300" />}
                                  </div>
                                  <Link href={`/admin/teams/${team.id}`} className="font-bold text-[11px] text-gray-900 hover:text-emerald-600 transition-colors uppercase">
                                    {team.name}
                                  </Link>
                                </div>
                              </td>
                              <td className="px-6 py-2">
                                <Link href={`/admin/leagues/${team.leagueId}`} className="font-bold text-[9px] text-gray-500 hover:text-emerald-600 uppercase tracking-tighter transition-colors">
                                  {team.league?.name || "Нет лиги"}
                                </Link>
                              </td>
                              <td className="px-6 py-2 text-center">
                                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-bold text-[10px]">
                                  <Users size={10} /> {team._count?.players || team.players?.length || 0}
                                </div>
                              </td>
                              <td className="px-6 py-2 text-[10px] font-bold text-emerald-600 tabular-nums">
                                {formatMoney(team.finances || 0)}
                              </td>
                              <td className="px-6 py-2 text-right">
                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                  <button onClick={() => handleDelete(team.id, team.name)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={14} />
                                  </button>
                                  <Link href={`/admin/teams/${team.id}`} className="p-1.5 text-gray-400 hover:text-emerald-600 transition-colors">
                                    <ChevronRight size={14} />
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}