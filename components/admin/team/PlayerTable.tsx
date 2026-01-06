"use client";

import { useState, useMemo } from "react";
import { getPriceFromPlayerObject } from "@/lib/economy";

// Иерархия позиций в футболе для сортировки
const POSITION_WEIGHTS: Record<string, number> = {
  'GK': 1,
  'RB': 2, 'RWB': 3, 'CB': 4, 'LCB': 5, 'RCB': 6, 'LB': 7, 'LWB': 8,
  'DM': 9, 'CDM': 10, 'CM': 11, 'LM': 12, 'RM': 13, 'CAM': 14,
  'RW': 15, 'LW': 16, 'RF': 17, 'LF': 18, 'CF': 19, 'ST': 20
};

interface PlayerTableProps {
  players: any[];
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

export function PlayerTable({ players }: PlayerTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'pos', direction: 'asc' });

  const SPEC_KEYS = [
    'specKr', 'specKt', 'specRv', 'specVp', 'specIbm', 'specKp',
    'specZv', 'specSt', 'specL', 'specKi', 'specPhys', 'specLong',
    'specInt', 'specAnt', 'specSpd', 'specGkRea', 'specGkPos'
  ];

  const calculateTotalSpecs = (p: any) => {
    return SPEC_KEYS.reduce((sum, key) => sum + (p[key] || 0), 0);
  };

  const calculateRealPower = (p: any) => {
    const fatigueFactor = 1 - (Math.floor(p.fatigue / 10) * 0.05);
    return Math.round(p.power * fatigueFactor);
  };

  const sortedPlayers = useMemo(() => {
    let sortableItems = [...players];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any;
        let bValue: any;
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
          case 'age':
            aValue = a.age;
            bValue = b.age;
            break;
          case 'power':
            aValue = calculateRealPower(a);
            bValue = calculateRealPower(b);
            break;
          case 'potential':
            aValue = a.potential || 0;
            bValue = b.potential || 0;
            break;
          case 'injury': // Сортировка по травматичности
            aValue = a.injuryProne || 0;
            bValue = b.injuryProne || 0;
            break;
          case 'price':
            aValue = getPriceFromPlayerObject(a);
            bValue = getPriceFromPlayerObject(b);
            break;
          case 'cond':
            aValue = 100 - a.fatigue;
            bValue = 100 - b.fatigue;
            break;
          case 'specs':
            aValue = calculateTotalSpecs(a);
            bValue = calculateTotalSpecs(b);
            break;
          default:
            aValue = a[sortConfig.key];
            bValue = b[sortConfig.key];
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
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSpecs = (p: any) => {
    const specsConfig = [
      { key: 'specKr', label: 'Кр' }, { key: 'specKt', label: 'Кт' },
      { key: 'specRv', label: 'Рв' }, { key: 'specVp', label: 'Вп' },
      { key: 'specIbm', label: 'Ибм' }, { key: 'specKp', label: 'Кп' },
      { key: 'specZv', label: 'Зв' }, { key: 'specSt', label: 'Шт' },
      { key: 'specL', label: 'Л' }, { key: 'specKi', label: 'Ки' },
      { key: 'specPhys', label: 'Физ' }, { key: 'specLong', label: 'Дл' },
      { key: 'specInt', label: 'Пр' }, { key: 'specAnt', label: 'Пд' },
      { key: 'specSpd', label: 'Ск' }, { key: 'specGkRea', label: 'Рк' },
      { key: 'specGkPos', label: 'Пз' }
    ];
    return specsConfig
      .filter(s => p[s.key] > 0)
      .map(s => `${s.label}${p[s.key]}`)
      .join('\u00A0\u00A0');
  };

  const formatValue = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(2)} млн $`;
    if (val >= 1000) return `${(val / 1000).toLocaleString()} к $`;
    return `${val} $`;
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
            <th onClick={() => requestSort('cond')} className="p-1 border-r border-white/20 text-center w-8 hover:bg-[#004d00]">С</th>
            <th className="p-1 border-r border-white/20 text-center w-8">У</th>
            <th className="p-1 border-r border-white/20 text-center w-10">Ф</th>
            
            {/* ПЕРСПЕКТИВНОСТЬ (П) */}
            <th onClick={() => requestSort('potential')} className="p-1 border-r border-white/20 text-center w-8 hover:bg-[#004d00] text-blue-200">П</th>
            
            {/* ТРАВМАТИЧНОСТЬ (Т) */}
            <th onClick={() => requestSort('injury')} className="p-1 border-r border-white/20 text-center w-8 hover:bg-[#004d00] text-orange-200">Т</th>
            
            <th onClick={() => requestSort('power')} className="p-1 border-r border-white/20 text-center w-12 text-yellow-300 hover:bg-[#004d00]">РС</th>
            <th onClick={() => requestSort('specs')} className="p-1 border-r border-white/20 text-center w-[1%] whitespace-nowrap hover:bg-[#004d00]">Спецвозможности</th>
            <th onClick={() => requestSort('price')} className="p-1 text-right pr-4 w-32 hover:bg-[#004d00]">Цена</th>
          </tr>
        </thead>
        <tbody className="text-[11px]">
          {sortedPlayers.map((p, idx) => {
            const realPower = calculateRealPower(p);
            const playerPrice = getPriceFromPlayerObject(p);

            return (
              <tr key={p.id} className={`${idx % 2 === 0 ? 'bg-[#e8f5e9]' : 'bg-[#f1f8e9]'} hover:bg-yellow-100 border-b border-gray-200 transition-colors group`}>
                <td className="p-1 border-r border-gray-300 text-center font-bold text-emerald-800">{idx + 1}</td>
                <td className="p-1 border-r border-gray-300 text-center text-[10px]">{p.potential > 80 ? '⭐' : '👤'}</td>
                <td className="p-1 border-r border-gray-300 pl-4 font-black text-emerald-900 uppercase">{p.firstName} {p.lastName}</td>
                <td className="p-1 border-r border-gray-300 text-center italic">
                  {p.country?.flag ? <img src={p.country.flag} alt={p.country.name} className="w-4 h-2.5 inline shadow-sm" /> : '-'}
                </td>
                <td className="p-1 border-r border-gray-300 text-center font-bold text-emerald-700">
                  {p.mainPosition}{p.sidePosition ? `/${p.sidePosition}` : ''}
                </td>
                <td className="p-1 border-r border-gray-300 text-center">{p.age}</td>
                <td className="p-1 border-r border-gray-300 text-center">{realPower}</td>
                <td className="p-1 border-r border-gray-300 text-center text-gray-400">-</td>
                <td className="p-1 border-r border-gray-300 text-center text-red-600 font-bold">?</td>
                
                {/* ПЕРСПЕКТИВНОСТЬ */}
                <td className="p-1 border-r border-gray-300 text-center font-bold text-blue-600 bg-blue-50/30">
                  {p.potential || 0}
                </td>

                {/* ТРАВМАТИЧНОСТЬ */}
                <td className="p-1 border-r border-gray-300 text-center font-bold text-orange-700 bg-orange-50/30">
                  {p.injuryProne || 0}
                </td>

                <td className="p-1 border-r border-gray-300 text-center font-black text-[#000c2d] bg-yellow-50/50">
                   {realPower}
                </td>
                <td className="p-1 border-r border-gray-300 text-center text-emerald-800 font-medium text-[12px] whitespace-nowrap">
                    {renderSpecs(p)  || <span className="text-gray-300">-</span>}
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