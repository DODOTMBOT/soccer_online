"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, ShieldCheck, ChevronRight, Plus, 
  Trash2, Loader2, DollarSign, Users, Trophy 
} from 'lucide-react';
import Link from "next/link";
import { Sidebar } from "@/components/admin/Sidebar"; // Теперь это горизонтальный Navbar

export default function TeamsListPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/teams');
      if (!res.ok) throw new Error("Ошибка загрузки");
      const data = await res.json();
      setTeams(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeams(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Удалить клуб ${name}? Это действие необратимо.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/teams/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setTeams(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans">
      {/* Горизонтальное меню навигации сверху */}
      <Sidebar />

      {/* SUB-HEADER / ACTIONS BAR */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 shrink-0">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-black uppercase tracking-tighter italic text-[#000c2d]">
              Реестр <span className="text-[#e30613]">клубов</span>
            </h1>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="Поиск клуба..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-sm py-2 pl-9 pr-4 text-[10px] font-bold outline-none focus:border-[#1a3151] transition-all" 
              />
            </div>
          </div>
          <Link 
            href="/admin/teams/new" 
            className="bg-[#000c2d] text-white px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-[#e30613] transition-all flex items-center gap-2"
          >
            <Plus size={14} /> Создать клуб
          </Link>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-[1200px] mx-auto space-y-6">
          
          {/* Статистика лиги */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 border-b-2 border-[#1a3151] shadow-sm">
              <p className="text-[9px] font-black text-gray-400 uppercase">Всего клубов</p>
              <p className="text-xl font-black italic">{teams.length}</p>
            </div>
            <div className="bg-white p-4 border-b-2 border-emerald-500 shadow-sm">
              <p className="text-[9px] font-black text-gray-400 uppercase">Суммарная стоимость</p>
              <p className="text-xl font-black italic text-emerald-600">
                ${teams.reduce((acc, t) => acc + (t.finances || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Таблица клубов (Transfermarkt Style) */}
          <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#1a3151] text-white text-[9px] font-black uppercase tracking-[0.15em]">
                  <th className="px-6 py-4">Клуб / Название</th>
                  <th className="px-6 py-4">Лига / Дивизион</th>
                  <th className="px-6 py-4 text-center">Состав</th>
                  <th className="px-6 py-4">Бюджет</th>
                  <th className="px-6 py-4 text-right">Управление</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <Loader2 className="animate-spin inline-block text-[#1a3151]" />
                    </td>
                  </tr>
                ) : teams.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                      Клубы не зарегистрированы
                    </td>
                  </tr>
                ) : teams.map((team) => (
                  <tr key={team.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex-shrink-0 bg-gray-50 border border-gray-100 rounded-sm p-1">
                          {team.logo ? (
                            <img src={team.logo} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <ShieldCheck size={24} className="text-gray-200 w-full h-full" />
                          )}
                        </div>
                        <Link 
                          href={`/admin/teams/${team.id}`} 
                          className="font-bold text-xs uppercase text-[#1a3151] hover:text-[#e30613] transition-colors tracking-tight"
                        >
                          {team.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Trophy size={12} className="text-gray-300" />
                        <span className="font-bold text-[10px] uppercase text-gray-500 italic">
                          {team.league?.name || "Вне лиги"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-sm">
                        <Users size={12} className="text-gray-400" />
                        <span className="font-black text-xs text-[#000c2d]">{team._count?.players || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-emerald-600 font-black text-xs italic tabular-nums">
                        <DollarSign size={12} />
                        {team.finances?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => handleDelete(team.id, team.name)} 
                          disabled={deletingId === team.id} 
                          className="p-2 text-gray-300 hover:text-[#e30613] transition-colors disabled:opacity-30"
                          title="Удалить клуб"
                        >
                          {deletingId === team.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                        </button>
                        <Link 
                          href={`/admin/teams/${team.id}`} 
                          className="p-2 text-gray-300 hover:text-[#1a3151] transition-colors"
                          title="Детали клуба"
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

          {/* Инфо-блок */}
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-sm flex items-start gap-3">
            <ShieldCheck size={16} className="text-blue-600 mt-0.5" />
            <p className="text-[10px] leading-relaxed text-blue-700 font-medium italic">
              В данном реестре отображаются все клубы системы GEN. Нажмите на название клуба для управления составом, 
              просмотра финансовых отчетов и истории матчей в рамках дивизионов D1-D5.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}