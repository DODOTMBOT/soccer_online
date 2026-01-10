"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar"; 
import { ChevronRight, Loader2, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function PublicLeaguePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/leagues/${id}/public`);
        const json = await res.json();
        
        if (!res.ok) throw new Error(json.error || "Ошибка загрузки");
        
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2f5f7]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#1a3151]" size={40} />
        <span className="uppercase font-black text-[10px] tracking-widest text-gray-400">Загрузка данных...</span>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2f5f7]">
      <div className="text-center p-8 bg-white border border-gray-200 shadow-sm">
        <h2 className="text-[#e30613] font-black uppercase italic mb-2">Ошибка</h2>
        <p className="text-[10px] font-bold text-gray-500 uppercase">{error || "Лига не найдена"}</p>
      </div>
    </div>
  );

  const teamsCount = data.teams?.length || 0;
  
  // Данные для селектов
  const seasonOptions = data.seasons || [];
  const divisionOptions = data.divisions || [];

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans text-[#1a3151]">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 max-w-[1200px] mx-auto w-full">
        
        {/* ШАПКА С СЕЛЕКТОРАМИ */}
        <div className="bg-white border border-gray-200 p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm rounded-sm">
          
          {/* Инфо о стране и лиге */}
          <div className="flex items-center gap-5 w-full md:w-auto">
             {data.country?.flag && (
               <img src={data.country.flag} className="w-12 h-8 object-cover border border-gray-100 shadow-sm" alt="" />
             )}
             <div>
               <h1 className="text-2xl font-black uppercase italic leading-none text-[#1a3151]">{data.name}</h1>
               <div className="text-[10px] font-bold text-gray-400 uppercase mt-1 italic tracking-widest">
                 {data.country?.name} • {data.country?.leagues?.length || 0} Дивизионов
               </div>
             </div>
          </div>

          {/* Блок переключения (Сезон + Дивизион) */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            
            {/* ВЫБОР СЕЗОНА */}
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-400 uppercase tracking-widest pointer-events-none">
                Сезон:
              </div>
              <select
                value={id} // ID текущей лиги соответствует выбранному сезону в списке seasons
                onChange={(e) => router.push(`/leagues/${e.target.value}`)}
                className="appearance-none bg-gray-50 border border-gray-200 hover:border-[#1a3151] text-[#1a3151] text-xs font-black uppercase py-3 pl-16 pr-10 rounded-sm cursor-pointer outline-none transition-all w-full md:w-40 shadow-sm"
              >
                {seasonOptions.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.season.year}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-[#1a3151]" size={14} />
            </div>

            {/* ВЫБОР ДИВИЗИОНА */}
            <div className="relative group">
              <select
                value={id} // ID текущей лиги также соответствует выбранному дивизиону
                onChange={(e) => router.push(`/leagues/${e.target.value}`)}
                className="appearance-none bg-[#1a3151] text-white border border-[#1a3151] hover:bg-[#2c4c7c] text-xs font-black uppercase py-3 pl-5 pr-10 rounded-sm cursor-pointer outline-none transition-all w-full md:w-48 shadow-sm"
              >
                {divisionOptions.map((d: any) => (
                  <option key={d.id} value={d.id}>
                    D{d.level} {d.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none group-hover:text-white" size={14} />
            </div>

          </div>
        </div>

        {/* РАСПИСАНИЕ МАТЧЕЙ (Превью) */}
        <div className="bg-white border border-gray-200 mb-8 shadow-sm overflow-hidden rounded-sm">
          <div className="bg-[#1a3151] text-white px-4 py-2.5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <span>Календарь игр</span>
            <Link href={`/admin/leagues/${id}/calendar`} className="text-white/40 hover:text-white transition-colors flex items-center gap-1">
              Все матчи <ChevronRight size={12}/>
            </Link>
          </div>
          <div className="p-6 grid md:grid-cols-2 gap-x-12 gap-y-3 bg-[#fafbfc]">
            {data.matches?.length > 0 ? data.matches.slice(0, 8).map((match: any) => (
              <div key={match.id} className="flex justify-between items-center border-b border-gray-100 pb-2 text-[11px] font-bold group">
                <div className="flex items-center gap-3 flex-1 justify-end text-right">
                  <span className="truncate uppercase group-hover:text-[#e30613] transition-colors">{match.homeTeam?.name}</span>
                  <img src={match.homeTeam?.logo || '/default-logo.png'} className="w-5 h-5 object-contain flex-shrink-0" alt="" />
                </div>
                <div className="w-16 text-center font-black text-[#e30613] bg-white border border-gray-200 mx-2 py-0.5 rounded-sm shadow-sm">
                  {match.status === 'FINISHED' ? `${match.homeScore}:${match.awayScore}` : 'v'}
                </div>
                <div className="flex items-center gap-3 flex-1 text-left">
                  <img src={match.awayTeam?.logo || '/default-logo.png'} className="w-5 h-5 object-contain flex-shrink-0" alt="" />
                  <span className="truncate uppercase group-hover:text-[#e30613] transition-colors">{match.awayTeam?.name}</span>
                </div>
              </div>
            )) : (
              <div className="col-span-2 text-center text-gray-400 text-[10px] font-bold uppercase py-4">Матчи не запланированы</div>
            )}
          </div>
        </div>

        {/* ТАБЛИЦА */}
        <div className="bg-white border border-gray-200 shadow-sm overflow-x-auto rounded-sm">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#1a3151] text-white text-[9px] font-black uppercase tracking-widest border-b border-[#1a3151]">
                <th className="px-4 py-3.5 w-12 text-center">М</th>
                <th className="px-4 py-3.5">Команда</th>
                <th className="px-2 py-3.5 text-center w-12">И</th>
                <th className="px-2 py-3.5 text-center w-12">В</th>
                <th className="px-2 py-3.5 text-center w-12">Н</th>
                <th className="px-2 py-3.5 text-center w-12">П</th>
                <th className="px-2 py-3.5 text-center w-12">М+</th>
                <th className="px-2 py-3.5 text-center w-12">М-</th>
                <th className="px-2 py-3.5 text-center w-12">+/-</th>
                <th className="px-4 py-3.5 text-center w-16 bg-[#e30613]">О</th>
              </tr>
            </thead>
            <tbody className="text-[11px] font-bold text-[#1a3151]">
              {data.teams?.length > 0 ? data.teams.map((team: any, index: number) => {
                const isPromotion = index < 2;
                const isRelegation = index >= teamsCount - 2;
                
                let rankClass = "";
                if (isPromotion) rankClass = "bg-emerald-100 text-emerald-800 border-r-2 border-emerald-500";
                else if (isRelegation) rankClass = "bg-red-50 text-red-800 border-r-2 border-red-500";
                else rankClass = "text-gray-400";

                return (
                  <tr key={team.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className={`px-4 py-4 text-center font-black ${rankClass}`}>
                      {index + 1}
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/teams/${team.id}`} className="flex items-center gap-3 group">
                        <img src={team.logo || '/default-logo.png'} className="w-6 h-6 object-contain" alt="" />
                        <span className="uppercase tracking-tight group-hover:text-[#e30613] transition-colors">{team.name}</span>
                      </Link>
                    </td>
                    <td className="px-2 py-4 text-center text-gray-400 font-medium">{team.played || 0}</td>
                    <td className="px-2 py-4 text-center">{team.wins || 0}</td>
                    <td className="px-2 py-4 text-center">{team.draws || 0}</td>
                    <td className="px-2 py-4 text-center text-gray-400 font-medium">{team.losses || 0}</td>
                    <td className="px-2 py-4 text-center">{team.goalsScored || 0}</td>
                    <td className="px-2 py-4 text-center text-gray-400 font-medium">{team.goalsConceded || 0}</td>
                    <td className="px-2 py-4 text-center">{team.goalsDiff || 0}</td>
                    <td className="px-4 py-4 text-center bg-gray-50 font-black text-sm border-l border-gray-100 text-[#000c2d]">{team.points || 0}</td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={10} className="py-20 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                    В данном дивизионе пока нет команд
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ЛЕГЕНДА */}
        <div className="mt-6 flex flex-wrap gap-6 text-[9px] font-black uppercase tracking-wider text-gray-400 p-4 bg-white border border-gray-200 rounded-sm shadow-sm">
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 bg-emerald-100 border border-emerald-500" />
             <span>Зона повышения (D{Math.max(1, data.level - 1)})</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 bg-red-50 border border-red-500" />
             <span>Зона вылета (D{data.level + 1})</span>
           </div>
        </div>
      </main>
    </div>
  );
}