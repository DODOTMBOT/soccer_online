import { Users, Zap } from 'lucide-react';

interface TeamLineupTableProps {
  teamName: string;
  setup: any;
  power: number;
  color: 'emerald' | 'amber';
}

export function TeamLineupTable({ teamName, setup, power, color }: TeamLineupTableProps) {
  const sortedSlots = setup 
    ? [...setup.lineupSlots].sort((a, b) => a.slotIndex - b.slotIndex) 
    : [];

  const bgColor = color === 'emerald' ? 'bg-emerald-600' : 'bg-amber-600';
  const textColor = color === 'emerald' ? 'text-emerald-600' : 'text-amber-600';

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
      <div className={`${bgColor} px-6 py-4 flex justify-between items-center text-white`}>
        <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
          <Users size={14}/> {teamName}
        </span>
        <div className="flex items-center gap-2 bg-black/10 px-3 py-1 rounded-full border border-white/10">
          <Zap size={10} className={`fill-current text-white`} />
          <span className="text-[11px] font-black italic">{power}</span>
        </div>
      </div>
      <table className="w-full text-left">
        <tbody className="divide-y divide-slate-50 text-[11px]">
          {setup ? sortedSlots.map((slot: any) => (
            <tr key={slot.id} className={slot.slotIndex > 10 ? 'bg-slate-50/50' : ''}>
              <td className="px-6 py-2.5 w-12 font-black text-slate-300 italic">
                {slot.slotIndex <= 10 ? slot.slotIndex + 1 : 'S'}
              </td>
              <td className={`px-2 py-2.5 w-10 font-bold ${textColor} uppercase`}>
                {slot.assignedPosition}
              </td>
              <td className="px-4 py-2.5 font-black uppercase italic text-slate-700 truncate max-w-[120px]">
                {slot.player?.lastName}
              </td>
              <td className="px-6 py-2.5 text-right font-black italic">
                {slot.player?.power}
              </td>
            </tr>
          )) : (
            <tr><td className="p-10 text-center text-slate-300 uppercase font-black text-[10px]">Состав не подан</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}