import React from 'react';
import { Wallet } from 'lucide-react';

const NotifItem = ({ name, msg, time }: any) => (
  <div className="flex items-center justify-between group cursor-pointer">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xs shadow-sm group-hover:scale-110 transition-transform">👤</div>
      <div className="flex flex-col gap-0.5"><span className="text-[11px] font-black uppercase tracking-tight text-slate-800 group-hover:text-emerald-500 transition-colors">{name}</span><span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight leading-none">{msg}</span></div>
    </div>
    <span className="text-[8px] font-black text-slate-300 uppercase shrink-0">{time}</span>
  </div>
);

export const RightPanel = () => (
  <div className="col-span-12 xl:col-span-4 space-y-8">
    <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm overflow-hidden relative">
      <div className="flex justify-between items-start mb-6">
        <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Balance</p><h3 className="text-3xl font-black tracking-tighter text-slate-800">489.87</h3></div>
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500"><Wallet size={24} /></div>
      </div>
      <div className="h-32 flex items-end gap-1.5 mt-8 px-1">
        {[30, 50, 40, 80, 55, 75, 45, 90, 60, 85].map((h, i) => (
          <div key={i} className="flex-1 bg-emerald-500/10 rounded-t-lg relative group cursor-pointer"><div className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-t-lg transition-all duration-500 group-hover:bg-indigo-500" style={{ height: `${h}%` }} /></div>
        ))}
      </div>
    </div>
    <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
      <h3 className="text-[11px] font-black uppercase tracking-widest mb-8">Notification</h3>
      <div className="space-y-8">
        <NotifItem name="Dolly Krista" msg="+256$ Profit on Football" time="4:20pm" />
        <NotifItem name="Richa Pinto" msg="+56$ Profit on Horse Racing" time="4:25pm" />
        <NotifItem name="Micky Larcko" msg="Won 3 Parlay tickets" time="4:35pm" />
      </div>
    </div>
  </div>
);