"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, 
  Search, 
  ChevronRight, 
  User, 
  TrendingUp,
  Globe,
  Loader2,
  Shield // FIX: Added missing import
} from "lucide-react";
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

export default function MarketPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  // FIX: Ensure component is mounted to avoid hydration errors with random/calculated data
  useEffect(() => {
    setMounted(true);
    const fetchMarket = async () => {
      try {
        const res = await fetch('/api/market'); 
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setPlayers(data);
      } catch (err) {
        console.error("Market Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarket();
  }, []);

  const filteredPlayers = useMemo(() => {
    return players.filter(p => 
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [players, searchQuery]);

  // FIX: Calculation safety for the "Most Expensive" stat
  const maxPrice = useMemo(() => {
    if (filteredPlayers.length === 0) return 0;
    return Math.max(...filteredPlayers.map(p => p.transferPrice || 0));
  }, [filteredPlayers]);

  if (!mounted || loading) {
    return (
      <div className={`w-full min-h-screen ${THEME.colors.bgMain} flex items-center justify-center`}>
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen ${THEME.colors.bgMain} font-sans p-8`}>
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
              <ShoppingCart size={28} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Торговая площадка</span>
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none mt-1">
                Трансферный <span className={THEME.colors.primaryText}>Рынок</span>
              </h1>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="ПОИСК ИГРОКА..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-100 bg-gray-50 text-[10px] font-bold outline-none focus:ring-2 ring-emerald-500/10 transition-all uppercase tracking-widest" 
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Всего лотов</p>
            <p className="text-2xl font-black text-gray-900">{filteredPlayers.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Самый дорогой</p>
            <p className={`text-2xl font-black ${THEME.colors.primaryText}`}>
              {maxPrice > 0 ? `$${maxPrice.toLocaleString()}` : '—'}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Статус рынка</p>
              <p className="text-sm font-black text-emerald-500 uppercase tracking-tighter flex items-center gap-2">
                <TrendingUp size={16} /> Открыт
              </p>
            </div>
            <Globe className="text-gray-100" size={40} />
          </div>
        </div>

        {/* Market Table */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Футболист</th>
                <th className="px-6 py-5 text-center">Поз</th>
                <th className="px-6 py-5 text-center">Возр</th>
                <th className="px-6 py-5 text-center">Сила</th>
                <th className="px-6 py-5">Текущий клуб</th>
                <th className="px-6 py-5 text-right">Стоимость</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPlayers.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/80 transition-all group">
                  <td className="px-8 py-5">
                    <Link href={`/players/${p.id}`} className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:border-emerald-200 transition-colors">
                        {p.country?.code ? (
                          <img 
                            src={`https://flagcdn.com/w40/${p.country.code.toLowerCase()}.png`} 
                            className="w-6 h-4 object-cover rounded-sm shadow-xs" 
                            alt=""
                          />
                        ) : <User size={18} className="text-gray-300" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-xs text-gray-900 uppercase tracking-tight">{p.lastName}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{p.firstName}</span>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${p.mainPosition === 'GK' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-600'}`}>
                      {p.mainPosition}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center font-bold text-xs text-gray-500 tabular-nums">
                    {p.age}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-xs font-black text-gray-900 bg-gray-100 px-2 py-1 rounded-md tabular-nums">
                      {p.power}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gray-50 rounded-md flex items-center justify-center border border-gray-100">
                        {p.team?.logo ? (
                          <img src={p.team.logo} className="w-4 h-4 object-contain" alt="" />
                        ) : <Shield size={12} className="text-gray-300" />}
                      </div>
                      <span className="text-[10px] font-black uppercase text-gray-500 tracking-tight">{p.team?.name || 'Свободный агент'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="text-sm font-black text-emerald-600 tabular-nums">
                      {p.transferPrice ? `$${Number(p.transferPrice).toLocaleString()}` : 'По запросу'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <Link 
                      href={`/players/${p.id}`} 
                      className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-emerald-600 transition-colors"
                    >
                      Детали <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredPlayers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    Трансферный лист пуст
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl flex items-start gap-4">
          <TrendingUp size={20} className="text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[10px] leading-relaxed text-emerald-800 font-medium uppercase tracking-wide">
            Цены на трансферном рынке регулируются спросом и предложением. <span className="font-black">Внимание:</span> все сделки проходят мгновенно после подтверждения обеими сторонами. Налог федерации на продажу составляет <span className="font-black">5%</span>.
          </p>
        </div>

      </div>
    </div>
  );
}