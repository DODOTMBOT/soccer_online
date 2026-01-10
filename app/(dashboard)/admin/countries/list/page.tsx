"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Loader2, 
  ChevronRight, 
  Globe, 
  Settings2,
  Info,
  ShieldCheck,
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

type SortConfig = {
  key: 'name' | 'confederation' | 'leagues' | 'teams';
  direction: 'asc' | 'desc';
};

export default function CountriesListPage() {
  const [countries, setCountries] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Состояние сортировки
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    key: 'name', 
    direction: 'asc' 
  });

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/countries');
      if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
      const data = await res.json();
      setCountries(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setCountries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCountries(); }, []);

  // Логика переключения сортировки
  const requestSort = (key: SortConfig['key']) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Комбинированная фильтрация и сортировка
  const processedCountries = useMemo(() => {
    let result = countries.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.confederation?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'confederation':
          aValue = a.confederation || "";
          bValue = b.confederation || "";
          break;
        case 'leagues':
          aValue = a._count?.leagues || 0;
          bValue = b._count?.leagues || 0;
          break;
        case 'teams':
          aValue = a._count?.teams || 0;
          bValue = b._count?.teams || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [countries, searchTerm, sortConfig]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Удалить федерацию ${name}? Это действие необратимо и удалит связанные лиги.`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/countries/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Ошибка удаления");
      setCountries(prev => prev.filter(c => c.id !== id));
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
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Админ панель / Реестр федераций</span>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
              Активные <span className={THEME.colors.primaryText}>Федерации</span>
            </h2>
          </div>
          
          <Link 
            href="/admin/leagues/new" 
            className={`${THEME.colors.primary} text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-sm shadow-emerald-100`}
          >
            <Plus size={14} /> Новый дивизион
          </Link>
        </div>

        <hr className="border-gray-200" />

        {/* Info Cards & Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Федерации</p>
            <p className="text-xl font-black text-gray-900">{processedCountries.length}</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Всего дивизионов</p>
            <p className={`text-xl font-black ${THEME.colors.primaryText}`}>
              {countries.reduce((acc, c) => acc + (c._count?.leagues || 0), 0)}
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="ПОИСК ПО НАЗВАНИЮ..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 text-[10px] font-bold outline-none focus:ring-2 ring-emerald-500/10 transition-all shadow-sm py-4 uppercase tracking-widest" 
            />
          </div>
        </div>

        {/* Основная таблица */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th 
                  className="px-6 py-4 cursor-pointer hover:text-emerald-600 transition-colors"
                  onClick={() => requestSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Федерация <ArrowUpDown size={12} className="opacity-50" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:text-emerald-600 transition-colors"
                  onClick={() => requestSort('confederation')}
                >
                  <div className="flex items-center gap-1">
                    Конфедерация <ArrowUpDown size={12} className="opacity-50" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-center cursor-pointer hover:text-emerald-600 transition-colors"
                  onClick={() => requestSort('leagues')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Дивизионы <ArrowUpDown size={12} className="opacity-50" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-center cursor-pointer hover:text-emerald-600 transition-colors"
                  onClick={() => requestSort('teams')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Команды <ArrowUpDown size={12} className="opacity-50" />
                  </div>
                </th>
                <th className="px-6 py-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="animate-spin inline-block text-emerald-600" />
                  </td>
                </tr>
              ) : processedCountries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    Активных федераций не найдено
                  </td>
                </tr>
              ) : processedCountries.map((country) => (
                <tr key={country.id} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-5 relative flex-shrink-0 bg-gray-100 rounded-sm overflow-hidden border border-gray-200 shadow-xs">
                        {country.code ? (
                          <img 
                            src={`https://flagcdn.com/w80/${country.code.toLowerCase()}.png`} 
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        ) : country.flag ? (
                          <img src={country.flag} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <Globe size={10} className="m-auto mt-1 text-gray-300" />
                        )}
                      </div>
                      <Link 
                        href={`/admin/countries/${country.id}`} 
                        className="font-bold text-[11px] text-gray-900 hover:text-emerald-600 transition-colors uppercase tracking-tight"
                      >
                        {country.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded text-gray-500 font-bold text-[9px] uppercase tracking-tighter">
                      <ShieldCheck size={10} />
                      {country.confederation || "FIFA"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-[11px] text-gray-700 tabular-nums">
                      {country._count?.leagues || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-[11px] text-emerald-600 tabular-nums">
                      {country._count?.teams || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <Link 
                        href={`/admin/countries/${country.id}`}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Управление составом"
                      >
                        <Settings2 size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(country.id, country.name)}
                        disabled={deletingId === country.id}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                      >
                        {deletingId === country.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                      </button>
                      <Link 
                        href={`/admin/countries/${country.id}`}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 transition-colors"
                      >
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}