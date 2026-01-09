"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { getPriceFromPlayerObject } from "@/src/shared/utils/economy";
import { FITNESS_RULES } from "@/src/server/domain/rules/fitness";
import { Player, Country, PlayerPlayStyle, PlayStyleDefinition, PlayStyleLevel } from "@prisma/client";
import { 
  Star, Zap, Target, Wind, Scissors, Send, Footprints, 
  Flag, Lock, Dumbbell, Hand, ArrowUpFromLine, Shield, 
  Crown, Siren, Repeat, ShieldCheck, Minimize2 
} from "lucide-react";

interface PlayerWithRelations extends Omit<Player, "price"> {
  country: Country | null;
  price: bigint | number | string | null;
  playStyles?: (PlayerPlayStyle & { definition: PlayStyleDefinition })[];
}

const POSITION_WEIGHTS: Record<string, number> = {
  'GK': 1, 'LD': 2, 'RD': 3, 'CD': 4, 'SW': 5, 'LB': 6, 'RB': 7, 'LWB': 8, 'RWB': 9,
  'DM': 10, 'LM': 11, 'RM': 12, 'CM': 13, 'AM': 14,
  'LF': 15, 'RF': 16, 'CF': 17, 'ST': 18
};

interface PlayerTableProps {
  players: PlayerWithRelations[];
  canViewHiddenStats: boolean;
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

const LEVEL_STYLES: Record<PlayStyleLevel, string> = {
  BRONZE: "bg-orange-50 border-orange-300 text-orange-700 shadow-sm",
  SILVER: "bg-slate-50 border-slate-300 text-slate-600 shadow-sm",
  GOLD:   "bg-yellow-50 border-yellow-400 text-yellow-700 shadow-md shadow-yellow-100"
};

const PLAYSTYLE_ICONS: Record<string, React.ReactNode> = {
  'FINESSE_SHOT': <Target size={12} strokeWidth={3} />,
  'POWER_SHOT': <Zap size={12} strokeWidth={3} fill="currentColor" />,
  'TRIVELA': <Wind size={12} strokeWidth={3} />,
  'INCISIVE_PASS': <Scissors size={12} strokeWidth={3} />,
  'LONG_BALL_PASS': <Send size={12} strokeWidth={3} />,
  'FIRST_TOUCH': <Footprints size={12} strokeWidth={3} />,
  'SLIDE_TACKLE': <Scissors size={12} strokeWidth={3} className="rotate-90" />,
  'OFFSIDE_TRAP': <Flag size={12} strokeWidth={3} />,
  'MAN_MARKING': <Lock size={12} strokeWidth={3} />,
  'ATHLETICISM': <Dumbbell size={12} strokeWidth={3} />,
  'GK_FEET': <Footprints size={12} strokeWidth={3} />,
  'GK_CROSSES': <ArrowUpFromLine size={12} strokeWidth={3} />,
  'GK_1V1': <Shield size={12} strokeWidth={3} />,
  'GK_PENALTY': <Hand size={12} strokeWidth={3} />,
  'LEADER': <Crown size={12} strokeWidth={3} />,
  'ICON': <Star size={12} strokeWidth={3} fill="currentColor" />,
  'CAPTAIN': <Crown size={12} strokeWidth={3} fill="currentColor" />,
  'INTENSIVE_SPEED': <Zap size={12} strokeWidth={3} />,
  'TRICKSTER': <Star size={12} strokeWidth={3} />,
  'TIKI_TAKA': <Repeat size={12} strokeWidth={3} />,
  'PRESS_TRIGGER': <Siren size={12} strokeWidth={3} />,
  'DISCIPLINE': <ShieldCheck size={12} strokeWidth={3} />,
  'COMPACTNESS': <Minimize2 size={12} strokeWidth={3} />,
};

export function PlayerTable({ players, canViewHiddenStats }: PlayerTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'pos', direction: 'asc' });

  // Состояние для глобального тултипа
  const [hoveredStyle, setHoveredStyle] = useState<{
    x: number;
    y: number;
    title: string;
    desc: string;
    level: string;
  } | null>(null);

  const handleMouseEnter = (e: React.MouseEvent, ps: any) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setHoveredStyle({
      x: rect.left + rect.width / 2, // Центр иконки
      y: rect.top,                   // Верх иконки
      title: ps.definition.name,
      desc: ps.definition.description || "Эффект не описан",
      level: ps.level
    });
  };

  const handleMouseLeave = () => {
    setHoveredStyle(null);
  };

  const calculateTotalPlayStyles = (p: PlayerWithRelations) => {
    return p.playStyles ? p.playStyles.length : 0;
  };

  const calculateRealPower = (p: PlayerWithRelations) => {
    return FITNESS_RULES.calculateEffectivePower(p.power, p.formIndex);
  };

  const sortedPlayers = useMemo(() => {
    const sortableItems = [...players];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: number | string = 0;
        let bValue: number | string = 0;
        // ... (сортировка та же)
        switch (sortConfig.key) {
          case 'name': aValue = `${a.firstName} ${a.lastName}`.toLowerCase(); bValue = `${b.firstName} ${b.lastName}`.toLowerCase(); break;
          case 'nat': aValue = (a.country?.name || '').toLowerCase(); bValue = (b.country?.name || '').toLowerCase(); break;
          case 'pos': aValue = POSITION_WEIGHTS[a.mainPosition] || 99; bValue = POSITION_WEIGHTS[b.mainPosition] || 99; break;
          case 'power': aValue = calculateRealPower(a); bValue = calculateRealPower(b); break;
          case 'form': aValue = FITNESS_RULES.getFormPercentage(a.formIndex); bValue = FITNESS_RULES.getFormPercentage(b.formIndex); break;
          case 'cond': aValue = 100 - a.fatigue; bValue = 100 - b.fatigue; break;
          case 'price': aValue = getPriceFromPlayerObject(a); bValue = getPriceFromPlayerObject(b); break;
          case 'specs': aValue = calculateTotalPlayStyles(a); bValue = calculateTotalPlayStyles(b); break;
          case 'potential': aValue = a.potential || 0; bValue = b.potential || 0; break;
          case 'injuryProne': aValue = a.injuryProne || 0; bValue = b.injuryProne || 0; break;
          case 'age': aValue = a.age; bValue = b.age; break;
          default: aValue = 0; bValue = 0;
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [players, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') { direction = 'desc'; }
    setSortConfig({ key, direction });
  };

  const formatValue = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(2)}m $`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k $`;
    return `${val} $`;
  };

  return (
    <>
      <div className="bg-white border border-gray-300 shadow-sm overflow-hidden font-sans text-[#000c2d] relative z-10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#006400] text-white text-[10px] font-bold uppercase cursor-pointer select-none">
              <th className="p-1 border-r border-white/20 text-center w-8">№</th>
              <th className="p-1 border-r border-white/20 text-center w-6"></th>
              <th onClick={() => requestSort('name')} className="p-1 border-r border-white/20 pl-4 hover:bg-[#004d00]">Игрок</th>
              <th onClick={() => requestSort('nat')} className="p-1 border-r border-white/20 text-center w-10 hover:bg-[#004d00]">Нац</th>
              <th onClick={() => requestSort('pos')} className="p-1 border-r border-white/20 text-center w-12 hover:bg-[#004d00]">Поз</th>
              <th onClick={() => requestSort('age')} className="p-1 border-r border-white/20 text-center w-8 hover:bg-[#004d00]">В</th>
              <th onClick={() => requestSort('cond')} className="p-1 border-r border-white/20 text-center w-8 hover:bg-[#004d00]" title="Усталость">У</th>
              <th onClick={() => requestSort('form')} className="p-1 border-r border-white/20 text-center w-10 hover:bg-[#004d00]" title="Физ. форма">Ф</th>
              {canViewHiddenStats && (
                <>
                  <th onClick={() => requestSort('potential')} className="p-1 border-r border-white/20 text-center w-8 hover:bg-[#004d00] text-blue-200" title="Потенциал">П</th>
                  <th onClick={() => requestSort('injuryProne')} className="p-1 border-r border-white/20 text-center w-8 hover:bg-[#004d00] text-orange-200" title="Травматичность">Т</th>
                </>
              )}
              <th onClick={() => requestSort('power')} className="p-1 border-r border-white/20 text-center w-12 text-yellow-300 hover:bg-[#004d00]" title="Реальная Сила">РС</th>
              <th onClick={() => requestSort('specs')} className="p-1 border-r border-white/20 text-left pl-4 hover:bg-[#004d00] w-48">PlayStyles</th>
              <th onClick={() => requestSort('price')} className="p-1 text-right pr-4 w-28 hover:bg-[#004d00]">Цена</th>
            </tr>
          </thead>
          <tbody className="text-[11px]">
            {sortedPlayers.map((p, idx) => {
              const realPower = calculateRealPower(p);
              const playerPrice = getPriceFromPlayerObject(p);
              const formPercent = FITNESS_RULES.getFormPercentage(p.formIndex);

              return (
                <tr key={p.id} className={`${idx % 2 === 0 ? 'bg-[#e8f5e9]' : 'bg-[#f1f8e9]'} hover:bg-yellow-100 border-b border-gray-200 transition-colors group`}>
                  <td className="p-1 border-r border-gray-300 text-center font-bold text-emerald-800">{idx + 1}</td>
                  <td className="p-1 border-r border-gray-300 text-center text-[10px]">
                    {canViewHiddenStats && p.potential > 85 ? '⭐' : '👤'}
                  </td>
                  <td className="p-1 border-r border-gray-300 pl-4 font-black text-emerald-900 uppercase">
                    <Link href={`/players/${p.id}`} className="hover:text-[#e30613] hover:underline transition-colors block w-full">
                      {p.firstName} {p.lastName}
                    </Link>
                  </td>
                  <td className="p-1 border-r border-gray-300 text-center">
                    {p.country?.flag ? (
                      <img src={p.country.flag} alt={p.country.name} title={p.country.name} className="w-8 h-8 inline object-cover rounded-full shadow-sm border border-gray-200" />
                    ) : '-'}
                  </td>
                  <td className="p-1 border-r border-gray-300 text-center font-bold text-emerald-700">
                    {p.mainPosition}{p.sidePosition ? `/${p.sidePosition}` : ''}
                  </td>
                  <td className="p-1 border-r border-gray-300 text-center">{p.age}</td>
                  <td className={`p-1 border-r border-gray-300 text-center ${p.fatigue > 15 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>{p.fatigue}%</td>
                  <td className={`p-1 border-r border-gray-300 text-center font-bold ${formPercent >= 100 ? 'text-emerald-600' : 'text-red-600'}`}>{formPercent}%</td>
                  {canViewHiddenStats && (
                    <>
                      <td className="p-1 border-r border-gray-300 text-center font-bold text-blue-600 bg-blue-50/30">{p.potential}</td>
                      <td className="p-1 border-r border-gray-300 text-center font-bold text-orange-700 bg-orange-50/30">{p.injuryProne}</td>
                    </>
                  )}
                  <td className="p-1 border-r border-gray-300 text-center font-black text-[#000c2d] bg-yellow-50/50">{realPower}</td>
                  
                  {/* ОТОБРАЖЕНИЕ PLAYSTYLES */}
                  <td className="p-1 border-r border-gray-300 text-left pl-2 overflow-visible relative">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {p.playStyles && p.playStyles.length > 0 ? (
                        p.playStyles.map((ps) => (
                          <div 
                            key={ps.id} 
                            className={`
                              relative group/icon w-6 h-6 flex items-center justify-center rounded-sm border cursor-help transition-all z-0 hover:z-50
                              ${LEVEL_STYLES[ps.level]}
                            `}
                            onMouseEnter={(e) => handleMouseEnter(e, ps)}
                            onMouseLeave={handleMouseLeave}
                          >
                            {PLAYSTYLE_ICONS[ps.definition.code] || <Star size={12} strokeWidth={3} />}
                          </div>
                        ))
                      ) : (
                        <span className="text-[9px] text-gray-300 font-bold uppercase tracking-widest px-2">-</span>
                      )}
                    </div>
                  </td>

                  <td className="p-1 text-right pr-4 font-black text-[#000c2d]">{formatValue(playerPrice)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ГЛОБАЛЬНЫЙ ФИКСИРОВАННЫЙ ТУЛТИП (Рендерится вне таблицы, поверх всего) */}
      {hoveredStyle && (
        <div 
          className="fixed z-[9999] w-64 bg-[#000c2d] text-white p-4 rounded-xl shadow-2xl pointer-events-none ring-1 ring-white/10 animate-in fade-in zoom-in duration-150 origin-bottom"
          style={{ 
            left: hoveredStyle.x, 
            top: hoveredStyle.y - 12, // Чуть выше курсора
            transform: 'translate(-50%, -100%)' 
          }}
        >
          <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
            <span className="text-xs font-black uppercase text-yellow-400">{hoveredStyle.title}</span>
            <span className="text-[9px] font-bold bg-white/20 px-2 py-0.5 rounded text-emerald-300 uppercase">{hoveredStyle.level}</span>
          </div>
          <div className="text-[10px] font-medium leading-relaxed text-gray-300">
            {hoveredStyle.desc}
          </div>
          {/* Стрелочка */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#000c2d]" />
        </div>
      )}
    </>
  );
}