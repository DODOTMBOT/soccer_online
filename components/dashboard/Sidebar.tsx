"use client"; // Обязательно добавляем для работы signOut

import React from 'react';
import { LayoutDashboard, Rss, Trophy, Flame, Plus, LogOut } from 'lucide-react';
import { signOut } from "next-auth/react"; // Импортируем функцию выхода

const NavItem = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <div className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl cursor-pointer transition-all duration-300 group ${active ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 translate-x-1' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
    <span className={`${active ? 'text-white' : 'text-slate-300 group-hover:text-emerald-500'} transition-colors`}>{icon}</span>
    <span className="text-[11px] font-black uppercase tracking-widest leading-none">{label}</span>
  </div>
);

const LeagueItem = ({ label, icon }: { label: string, icon: string }) => (
  <li className="flex items-center gap-3 px-2 group cursor-pointer hover:translate-x-1 transition-transform text-[10px] font-black text-slate-400 hover:text-slate-800 uppercase tracking-tighter transition-all">
    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-sm shadow-sm group-hover:bg-white border border-transparent group-hover:border-slate-100 transition-all">{icon}</div>
    {label}
  </li>
);

export const Sidebar = () => (
  <aside className="w-64 bg-white border-r border-slate-100 flex flex-col p-6 overflow-y-auto shrink-0 min-h-screen">
    <div className="flex-1"> {/* Контейнер для основного контента, чтобы кнопка выхода прижалась к низу */}
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="relative w-20 h-20 rounded-full bg-slate-200 mb-4 border-2 border-emerald-500 p-1">
          <div className="w-full h-full rounded-full bg-slate-300 flex items-center justify-center text-2xl">👤</div>
        </div>
        <h2 className="font-black text-lg leading-tight uppercase tracking-tight text-slate-800">Max Kembli</h2>
        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Professional • 3 level</p>
        <div className="flex gap-4 mt-4">
          <div className="text-center"><p className="text-xs font-black">2.546</p><p className="text-[8px] text-slate-400 uppercase font-black">Followers</p></div>
          <div className="text-center"><p className="text-xs font-black">4.589</p><p className="text-[8px] text-slate-400 uppercase font-black">Following</p></div>
        </div>
      </div>

      <nav className="space-y-2">
        <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active />
        <NavItem icon={<Rss size={18} />} label="My Feed" />
        <NavItem icon={<Trophy size={18} />} label="Tipsters" />
        <NavItem icon={<Flame size={18} />} label="Hot Tips" />
      </nav>

      <div className="mt-10">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex justify-between items-center px-2">
          Favourite League 
          <Plus size={12} className="cursor-pointer hover:text-emerald-500 transition-colors" />
        </h3>
        <ul className="space-y-4">
          <LeagueItem label="Premier League" icon="🏴󠁧󠁢󠁥󠁮󠁧󠁿" />
          <LeagueItem label="I-League" icon="🇮🇳" />
          <LeagueItem label="La Liga" icon="🇪🇸" />
        </ul>
      </div>
    </div>

    {/* КНОПКА ВЫХОДА */}
    <div className="mt-10 pt-6 border-t border-slate-50">
      <button 
        onClick={() => signOut({ callbackUrl: "/auth/signin" })}
        className="w-full flex items-center gap-4 px-5 py-3.5 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all duration-300 group"
      >
        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[11px] font-black uppercase tracking-widest leading-none">Sign Out</span>
      </button>
    </div>
  </aside>
);