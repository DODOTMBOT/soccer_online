import React from 'react';
import { MoreHorizontal, ChevronDown } from 'lucide-react';

const MatchRow = ({ time, team1, team2, score, isLive = false }: any) => (
  <div className="bg-white p-6 rounded-[32px] border border-transparent hover:border-slate-100 shadow-sm flex items-center justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
    <div className="flex items-center gap-8">
      <div className="text-center w-12 shrink-0">
        <p className="text-[12px] font-black text-slate-800">{time}</p>
        {isLive && <div className="flex items-center justify-center gap-1 mt-1 bg-rose-50 px-2 py-0.5 rounded-md"><div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" /><span className="text-[8px] text-rose-500 font-black uppercase">Live</span></div>}
      </div>
      <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg">🛡️</div><span className="text-[12px] font-black uppercase tracking-tight text-slate-700">{team1}</span></div>
    </div>
    <div className="flex items-center gap-6 bg-slate-50/50 px-8 py-2.5 rounded-full border border-slate-100 shadow-inner group-hover:bg-white transition-colors"><span className={`text-xs font-black italic tracking-widest ${score === 'vs' ? 'text-slate-300 uppercase' : 'text-slate-900'}`}>{score}</span></div>
    <div className="flex items-center gap-8"><div className="flex items-center gap-4 text-right"><span className="text-[12px] font-black uppercase tracking-tight text-slate-700">{team2}</span><div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg">🦁</div></div><button className="p-2 text-slate-200 hover:text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><MoreHorizontal size={20} /></button></div>
  </div>
);

export const MatchList = () => (
  <div className="space-y-4">
    <div className="flex gap-4 mb-8">
      {['All Games', 'Live Games', 'Finished', 'Scheduled'].map((label, i) => (
        <button key={label} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${i === 0 ? 'bg-[#1F2937] text-white shadow-xl' : 'bg-white text-slate-300 border border-slate-100 hover:border-slate-200'}`}>{label}</button>
      ))}
    </div>
    <div className="flex items-center gap-2 mb-2 text-slate-400"><span className="text-lg">🇪🇸</span><span className="text-[10px] font-black uppercase tracking-widest">Spain • La Liga</span><ChevronDown size={14} className="ml-auto" /></div>
    <MatchRow time="4:30" team1="Atletico Madrid" team2="Eibar" score="2 : 3" isLive />
    <MatchRow time="3:02" team1="Real Valladolid" team2="Malloca" score="vs" />
    <MatchRow time="3:02" team1="Leganes" team2="Alaves" score="vs" />
  </div>
);