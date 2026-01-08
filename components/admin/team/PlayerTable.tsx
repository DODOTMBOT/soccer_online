"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getPriceFromPlayerObject } from "@/src/shared/utils/economy";
import { FITNESS_RULES } from "@/src/server/domain/rules/fitness";
import { Player, Country } from "@prisma/client";

// Тип для игрока с вложенной страной
interface PlayerWithRelations extends Omit<Player, "price"> {
  country: Country | null;
  price: bigint | number | string | null;
}

const POSITION_WEIGHTS: Record<string, number> = {
  'GK': 1, 'LD': 2, 'RD': 3, 'CD': 4, 'SW': 5, 'LB': 6, 'RB': 7, 'LWB': 8, 'RWB': 9,
  'DM': 10, 'LM': 11, 'RM': 12, 'CM': 13, 'AM': 14,
  'LF': 15, 'RF': 16, 'CF': 17, 'ST': 18
};

interface PlayerTableProps {
  players: PlayerWithRelations[];
  canViewHiddenStats: boolean; // <--- НОВЫЙ ПРОП
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

const SPEC_KEYS: (keyof Player)[] = [
  'specSpeed', 'specHeading', 'specLongPass', 'specShortPass', 
  'specDribbling', 'specCombination', 'specTackling', 'specMarking', 
  'specShooting', 'specFreeKicks', 'specCorners', 'specPenalty',
  'specCaptain', 'specLeader', 'specAthleticism', 'specSimulation',
  'specGkReflexes', 'specGkOut'
];

const SPEC_LABELS: Record<string, string> = {
  specSpeed: 'Spd', specHeading: 'Hed', specLongPass: 'Lng', specShortPass: 'Pas',
  specDribbling: 'Drb', specCombination: 'Cmb', specTackling: 'Tck', specMarking: 'Mrk',
  specShooting: 'Sht', specFreeKicks: 'FK', specCorners: 'Crn', specPenalty: 'Pen',
  specCaptain: 'Cap', specLeader: 'Ldr', specAthleticism: 'Ath', specSimulation: 'Sim',
  specGkReflexes: 'Ref', specGkOut: 'Pos'
};

export function PlayerTable({ players, canViewHiddenStats }: PlayerTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'pos', direction: 'asc' });

  const calculateTotalSpecs = (p: PlayerWithRelations) => {
    return SPEC_KEYS.reduce((sum, key) => {
      return sum + (Number(p[key as keyof PlayerWithRelations]) || 0);
    }, 0);
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

        switch (sortConfig.key) {
          case 'name':
            aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
            bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
            break;
          case 'nat':
            aValue = (a.country?.name || '').toLowerCase();
            bValue = (b.country?.name || '').toLowerCase();
            break;
          case 'pos':
            aValue = POSITION_WEIGHTS[a.mainPosition] || 99;
            bValue = POSITION_WEIGHTS[b.mainPosition] || 99;
            break;
          case 'power':
            aValue = calculateRealPower(a);
            bValue = calculateRealPower(b);
            break;
          case 'form':
            aValue = FITNESS_RULES.getFormPercentage(a.formIndex);
            bValue = FITNESS_RULES.getFormPercentage(b.formIndex);
            break;
          case 'cond':
            aValue = 100 - a.fatigue;
            bValue = 100 - b.fatigue;
            break;
          case 'price':
            aValue = getPriceFromPlayerObject(a);
            bValue = getPriceFromPlayerObject(b);
            break;
          case 'specs':
            aValue = calculateTotalSpecs(a);
            bValue = calculateTotalSpecs(b);
            break;
          default:
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            aValue = (a as any)[sortConfig.key] || 0;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            bValue = (b as any)[sortConfig.key] || 0;
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

  const renderSpecs = (p: PlayerWithRelations) => {
    const activeSpecs: string[] = [];
    SPEC_KEYS.forEach(key => {
      const val = Number(p[key as keyof PlayerWithRelations]);
      if (val > 0) {
        activeSpecs.push(`${SPEC_LABELS[key as string]}${val}`);
      }
    });
    return activeSpecs.join(" ");
  };

  return (
    <div className="bg-white border border-gray-300 shadow-sm overflow-hidden font-sans text-[#000c2d]">
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
            
            {/* СКРЫВАЕМ ЗАГОЛОВКИ, ЕСЛИ НЕТ ПРАВ */}
            {canViewHiddenStats && (
              <>
                <th onClick={() => requestSort('potential')} className="p-1 border-r border-white/20 text-center w-8 hover:bg-[#004d00] text-blue-200" title="Потенциал">П</th>
                <th onClick={() => requestSort('injuryProne')} className="p-1 border-r border-white/20 text-center w-8 hover:bg-[#004d00] text-orange-200" title="Травматичность">Т</th>
              </>
            )}

            <th onClick={() => requestSort('power')} className="p-1 border-r border-white/20 text-center w-12 text-yellow-300 hover:bg-[#004d00]" title="Реальная Сила">РС</th>
            <th onClick={() => requestSort('specs')} className="p-1 border-r border-white/20 text-left pl-2 hover:bg-[#004d00]">Спецвозможности</th>
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
                
                {/* Если прав нет, всегда показываем силуэт или пустую ячейку вместо звездочки потенциала */}
                <td className="p-1 border-r border-gray-300 text-center text-[10px]">
                  {canViewHiddenStats && p.potential > 85 ? '⭐' : '👤'}
                </td>
                
                <td className="p-1 border-r border-gray-300 pl-4 font-black text-emerald-900 uppercase">
                  <Link 
                    href={`/players/${p.id}`} 
                    className="hover:text-[#e30613] hover:underline transition-colors block w-full"
                  >
                    {p.firstName.charAt(0)}. {p.lastName}
                  </Link>
                </td>

                <td className="p-1 border-r border-gray-300 text-center">
                  {p.country?.flag ? <img src={p.country.flag} alt={p.country.name} className="w-4 h-2.5 inline shadow-sm" /> : '-'}
                </td>
                <td className="p-1 border-r border-gray-300 text-center font-bold text-emerald-700">
                  {p.mainPosition}{p.sidePosition ? `/${p.sidePosition}` : ''}
                </td>
                <td className="p-1 border-r border-gray-300 text-center">{p.age}</td>
                
                <td className={`p-1 border-r border-gray-300 text-center ${p.fatigue > 15 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                  {p.fatigue}%
                </td>
                
                <td className={`p-1 border-r border-gray-300 text-center font-bold ${formPercent >= 100 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formPercent}%
                </td>
                
                {/* СКРЫВАЕМ ЯЧЕЙКИ С ДАННЫМИ, ЕСЛИ НЕТ ПРАВ */}
                {canViewHiddenStats && (
                  <>
                    <td className="p-1 border-r border-gray-300 text-center font-bold text-blue-600 bg-blue-50/30">{p.potential}</td>
                    <td className="p-1 border-r border-gray-300 text-center font-bold text-orange-700 bg-orange-50/30">{p.injuryProne}</td>
                  </>
                )}

                <td className="p-1 border-r border-gray-300 text-center font-black text-[#000c2d] bg-yellow-50/50">
                   {realPower}
                </td>
                <td className="p-1 border-r border-gray-300 text-left pl-2 text-emerald-800 font-medium text-[10px] whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                    {renderSpecs(p)}
                </td>
                <td className="p-1 text-right pr-4 font-black text-[#000c2d]">
                  {formatValue(playerPrice)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}