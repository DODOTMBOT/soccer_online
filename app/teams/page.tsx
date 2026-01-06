"use client";

import React, { useState, useEffect } from 'react';
import { Globe, Loader2 } from 'lucide-react'; 
import Link from "next/link";
import { Sidebar } from "@/components/admin/Sidebar"; 
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
    if (!confirm(`Удалить страну ${name}? Это действие необратимо.`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/countries/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Ошибка удаления");
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
      <Sidebar />

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-[1200px] mx-auto space-y-8">
          
          {/* MAIN TABLE */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-sm overflow-hidden">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#1a3151] text-white text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4 border border-gray-600/20 text-left">Федерация</th>
                  <th className="px-6 py-4 border border-gray-600/20 text-center w-[1%] whitespace-nowrap">Конфедерация</th>
                  <th className="px-6 py-4 border border-gray-600/20 text-center w-[1%] whitespace-nowrap">Дивизионы</th>
                  <th className="px-6 py-4 border border-gray-600/20 text-center w-[1%] whitespace-nowrap">Число команд</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-24 text-center border border-gray-100">
                      <Loader2 className="animate-spin inline-block text-[#1a3151]" size={32} />
                    </td>
                  </tr>
                ) : countries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-[10px] uppercase tracking-widest border border-gray-100">
                      База данных пуста
                    </td>
                  </tr>
                ) : countries.map((country) => (
                  <tr key={country.id} className="hover:bg-[#f8fafc] transition-colors">
                    
                    {/* ФЕДЕРАЦИЯ */}
                    <td className="px-6 py-4 border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-7 bg-white shadow-sm border border-gray-200 flex items-center justify-center relative flex-shrink-0">
                          {country.flag ? (
                            <img src={country.flag} alt={country.name} className="w-full h-full object-cover" />
                          ) : (
                            <Globe size={14} className="text-gray-300" />
                          )}
                        </div>
                        <div>
                          {/* --- ОБНОВЛЕННАЯ ССЫЛКА --- */}
                          <Link 
                            href={`/teams/countries/${country.id}/teams`} 
                            className="block font-bold text-[#1a3151] hover:text-[#e30613] transition-colors"
                          >
                            {country.name}
                          </Link>
                        </div>
                      </div>
                    </td>

                    {/* КОНФЕДЕРАЦИЯ */}
                    <td className="px-6 py-4 border border-gray-100 text-[#1a3151] text-center whitespace-nowrap">
                       {country.confederation || "—"}
                    </td>

                    {/* КОЛ-ВО ДИВИЗИОНОВ */}
                    <td className="px-6 py-4 text-center border border-gray-100">
                      <span className="text-[#000c2d]">
                        {country._count?.leagues || 0}
                      </span>
                    </td>

                    {/* ЧИСЛО КОМАНД */}
                    <td className="px-6 py-4 text-center border border-gray-100">
                      <span className="text-[#000c2d]">
                        {country._count?.teams || 0}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}