"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Trash2, Loader2, 
  ChevronRight, Globe, Info, AlertTriangle
} from 'lucide-react';
import Link from "next/link";
import { Sidebar } from "@/components/admin/Sidebar"; // Теперь это горизонтальный Navbar
import { useRouter } from "next/navigation";

export default function CountriesListPage() {
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/countries');
      if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
      const text = await res.text();
      if (!text) {
        setCountries([]);
        return;
      }
      const data = JSON.parse(text);
      setCountries(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setCountries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCountries(); }, []);

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    if (!confirm(`Удалить страну ${name}? Это может затронуть связанные лиги и клубы.`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/countries/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка удаления");
      }
      setCountries(prev => prev.filter(c => c.id !== id));
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans">
      {/* Горизонтальное меню сверху */}
      <Sidebar />

      {/* SUB-HEADER / ACTIONS */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 shrink-0">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-black uppercase tracking-tighter italic text-[#000c2d]">
              Реестр <span className="text-[#e30613]">стран</span>
            </h1>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="Поиск по названию..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-sm py-2 pl-9 pr-4 text-[10px] font-bold outline-none focus:border-[#1a3151] transition-all" 
              />
            </div>
          </div>
          <Link 
            href="/admin/countries/new" 
            className="bg-[#000c2d] text-white px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-[#e30613] transition-all flex items-center gap-2"
          >
            <Plus size={14} /> Добавить страну
          </Link>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-[1200px] mx-auto space-y-6">
          
          {/* Статистическая сводка */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 border-b-2 border-[#1a3151] shadow-sm">
              <p className="text-[9px] font-black text-gray-400 uppercase">Всего записей</p>
              <p className="text-xl font-black italic">{countries.length}</p>
            </div>
            <div className="bg-white p-4 border-b-2 border-emerald-500 shadow-sm">
              <p className="text-[9px] font-black text-gray-400 uppercase">Активных лиг</p>
              <p className="text-xl font-black italic">
                {countries.reduce((acc, c) => acc + (c._count?.leagues || 0), 0)}
              </p>
            </div>
            {/* Можно добавить больше метрик */}
          </div>

          {/* Таблица в стиле Transfermarkt */}
          <div className="bg-white shadow-sm border border-gray-200">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#1a3151] text-white text-[9px] font-black uppercase tracking-[0.15em]">
                  <th className="px-6 py-4">Страна</th>
                  <th className="px-6 py-4">Конфедерация</th>
                  <th className="px-6 py-4 text-center">Лиги</th>
                  <th className="px-6 py-4 text-center">Клубы</th>
                  <th className="px-6 py-4 text-right">Управление</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <Loader2 className="animate-spin inline-block text-[#1a3151]" />
                    </td>
                  </tr>
                ) : countries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                      Список пуст
                    </td>
                  </tr>
                ) : countries.map((country) => (
                  <tr key={country.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-4 bg-gray-100 rounded-sm overflow-hidden border border-gray-200 flex items-center justify-center">
                          {country.flag ? (
                            <img src={country.flag} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Globe size={10} className="text-gray-300" />
                          )}
                        </div>
                        <Link href={`/admin/countries/${country.id}`} className="font-bold text-xs uppercase text-[#1a3151] hover:text-[#e30613] transition-colors">
                          {country.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-[10px] text-gray-500 uppercase">{country.confederation}</td>
                    <td className="px-6 py-4 text-center font-bold text-xs">{country._count?.leagues || 0}</td>
                    <td className="px-6 py-4 text-center font-bold text-xs">{country._count?.teams || 0}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => handleDelete(e, country.id, country.name)}
                          disabled={deletingId === country.id}
                          className="p-2 text-gray-300 hover:text-[#e30613] transition-colors disabled:opacity-30"
                          title="Удалить"
                        >
                          {deletingId === country.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                        </button>
                        <Link 
                          href={`/admin/countries/${country.id}`}
                          className="p-2 text-gray-300 hover:text-[#1a3151] transition-colors"
                          title="Подробнее"
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
          <div className="bg-amber-50 border border-amber-100 p-4 flex items-start gap-3 rounded-sm">
            <AlertTriangle size={16} className="text-amber-600 mt-0.5" />
            <p className="text-[10px] leading-relaxed text-amber-700 font-medium italic">
              Внимание: Удаление страны приведет к каскадному удалению или отвязке всех связанных лиг и команд в системе GEN. 
              Рекомендуется использовать функцию редактирования для изменения данных без потери связей.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}