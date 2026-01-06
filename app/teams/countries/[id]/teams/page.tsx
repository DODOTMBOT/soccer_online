"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Loader2, User } from 'lucide-react'; 
import Link from "next/link";
import { Sidebar } from "@/components/admin/Sidebar"; 
import { useParams } from "next/navigation"; 

export default function FederationTeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const params = useParams(); 
  const countryId = params?.id as string; 

  const fetchTeams = async () => {
    if (!countryId) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/countries/${countryId}/teams`); 
      
      if (!res.ok) throw new Error(`Ошибка: ${res.status}`);

      const text = await res.text();
      if (!text) {
        setTeams([]);
        return;
      }
      const data = JSON.parse(text);

      // Сортировка
      data.sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));

      setTeams(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (countryId) fetchTeams(); 
  }, [countryId]);

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans">
      <Sidebar />

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-[1200px] mx-auto space-y-8">
          
          <div className="flex items-center justify-between">
             <h1 className="text-2xl font-bold text-[#1a3151]">Команды федерации</h1>
          </div>

          <div className="bg-white shadow-sm border border-gray-200 rounded-sm overflow-hidden">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#1a3151] text-white text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4 border border-gray-600/20 text-left">Команда</th>
                  <th className="px-6 py-4 border border-gray-600/20 text-center w-[1%] whitespace-nowrap">Лига</th>
                  <th className="px-6 py-4 border border-gray-600/20 text-center w-[1%] whitespace-nowrap">Менеджер</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-24 text-center">
                      <Loader2 className="animate-spin inline-block text-[#1a3151]" size={32} />
                    </td>
                  </tr>
                ) : teams.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-400 text-[10px] uppercase tracking-widest">
                      В этой федерации нет команд
                    </td>
                  </tr>
                ) : teams.map((team) => (
                  <tr key={team.id} className="hover:bg-[#f8fafc] transition-colors">
                    
                    {/* КОМАНДА */}
                    <td className="px-6 py-4 border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white shadow-sm border border-gray-200 flex items-center justify-center rounded-full overflow-hidden flex-shrink-0 p-1">
                          {team.logo ? (
                            <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                          ) : (
                            <Shield size={16} className="text-gray-300" />
                          )}
                        </div>
                        <div>
                          <Link href={`/admin/teams/${team.id}`} className="block font-bold text-[#1a3151] hover:text-[#e30613] transition-colors">
                            {team.name}
                          </Link>
                          {team.stadium && (
                             <span className="text-xs text-gray-400 font-normal">{team.stadium}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* ЛИГА */}
                    <td className="px-6 py-4 border border-gray-100 text-[#1a3151] text-center whitespace-nowrap font-medium">
                       {team.league?.name || "—"}
                    </td>

                    {/* МЕНЕДЖЕР */}
                    <td className="px-6 py-4 border border-gray-100 text-center whitespace-nowrap">
                      {team.manager ? (
                        <div className="flex items-center justify-center gap-2 text-[#1a3151]">
                           <User size={14} className="text-gray-400" />
                           <span className="font-semibold text-xs">{team.manager.login || team.manager.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-[10px] uppercase tracking-wider">Вакантно</span>
                      )}
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