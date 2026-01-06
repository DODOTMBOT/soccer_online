"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Loader2, 
  ChevronRight, 
  Globe, 
  AlertTriangle, 
  Settings2,
  Info // <--- Добавьте это
} from 'lucide-react';
import Link from "next/link";
import { Sidebar } from "@/components/admin/Sidebar";
import { useRouter } from "next/navigation";

export default function CountriesListPage() {
  const [countries, setCountries] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const fetchCountries = async () => {
    try {
      setLoading(true);
      // API теперь возвращает только страны с командами (согласно правкам в GET)
      const res = await fetch('/api/admin/countries');
      if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
      const data = await res.json();
      setCountries(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setCountries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCountries(); }, []);

  // Фильтрация по поисковому запросу на клиенте
  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    if (!confirm(`Удалить страну ${name}? Это действие удалит связанные лиги.`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/countries/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Ошибка удаления");
      setCountries(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans">
      <Sidebar />

      {/* ACTION BAR */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 shrink-0">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-black uppercase tracking-tighter italic text-[#000c2d]">
              Активные <span className="text-[#e30613]">Федерации</span>
            </h1>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск по названию..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-sm py-2 pl-9 pr-4 text-[10px] font-bold outline-none focus:border-[#1a3151] transition-all" 
              />
            </div>
          </div>
          <Link 
            href="/admin/leagues/new" 
            className="bg-[#000c2d] text-white px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-[#e30613] transition-all flex items-center gap-2"
          >
            <Plus size={14} /> Новый дивизион
          </Link>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-[1200px] mx-auto space-y-6">
          
          {/* Сводка */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 border-b-2 border-[#1a3151] shadow-sm">
              <p className="text-[9px] font-black text-gray-400 uppercase">Федераций с клубами</p>
              <p className="text-xl font-black italic">{countries.length}</p>
            </div>
            <div className="bg-white p-4 border-b-2 border-emerald-500 shadow-sm">
              <p className="text-[9px] font-black text-gray-400 uppercase">Всего дивизионов</p>
              <p className="text-xl font-black italic">
                {countries.reduce((acc, c) => acc + (c._count?.leagues || 0), 0)}
              </p>
            </div>
          </div>

          {/* Таблица стран */}
          <div className="bg-white shadow-sm border border-gray-200">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#1a3151] text-white text-[9px] font-black uppercase tracking-[0.15em]">
                  <th className="px-6 py-4">Федерация</th>
                  <th className="px-6 py-4">Конфедерация</th>
                  <th className="px-6 py-4 text-center">Дивизионы</th>
                  <th className="px-6 py-4 text-center">Команды</th>
                  <th className="px-6 py-4 text-right">Инструменты</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <Loader2 className="animate-spin inline-block text-[#1a3151]" />
                    </td>
                  </tr>
                ) : filteredCountries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                      Активных стран не найдено
                    </td>
                  </tr>
                ) : filteredCountries.map((country) => (
                  <tr key={country.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-5 bg-gray-100 border border-gray-200 overflow-hidden shadow-sm flex items-center justify-center">
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
                    <td className="px-6 py-4 text-center font-bold text-xs text-[#1a3151]">{country._count?.leagues || 0}</td>
                    <td className="px-6 py-4 text-center font-bold text-xs text-[#1a3151]">{country._count?.teams || 0}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {/* Кнопка быстрого доступа к управлению лигами */}
                        <Link 
                          href={`/admin/countries/${country.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 text-[#1a3151] hover:bg-[#1a3151] hover:text-white transition-all rounded-sm text-[9px] font-black uppercase"
                        >
                          <Settings2 size={12} /> Состав
                        </Link>
                        
                        <button 
                          onClick={(e) => handleDelete(e, country.id, country.name)}
                          disabled={deletingId === country.id}
                          className="p-2 text-gray-300 hover:text-[#e30613] transition-colors disabled:opacity-30"
                        >
                          {deletingId === country.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-4 flex items-start gap-3 rounded-sm">
            <Info size={16} className="text-blue-600 mt-0.5" />
            <p className="text-[10px] leading-relaxed text-blue-700 font-medium italic">
              В данном списке отображаются только те страны, в которых загружены команды. 
              Для управления иерархией дивизионов и распределения клубов используйте кнопку "Состав".
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}