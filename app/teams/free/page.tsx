"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, MapPin, Briefcase } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function FreeTeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  // Загружаем свободные команды
  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Грузим команды без менеджера
        const resTeams = await fetch('/api/admin/teams'); // Используем сущ. API, фильтр сделаем тут или лучше новый API
        const allTeams = await resTeams.json();
        const freeTeams = allTeams.filter((t: any) => !t.manager); // Фильтруем на клиенте для простоты
        setTeams(freeTeams);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleApply = async (teamId: string) => {
    if (!session) return router.push("/auth");
    
    const toastId = toast.loading("Отправка заявки...");
    try {
      const res = await fetch("/api/applications/apply", {
        method: "POST",
        body: JSON.stringify({ teamId })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success("Заявка отправлена! Ждите решения.", { id: toastId });
      setMyApplications([...myApplications, teamId]);
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Загрузка биржи труда...</div>;

  return (
    <div className="p-8 bg-[#f2f5f7] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center gap-3">
          <Briefcase size={32} className="text-[#1a3151]" />
          <div>
            <h1 className="text-2xl font-black uppercase text-[#1a3151]">Биржа Труда</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Доступные вакансии главных тренеров
            </p>
          </div>
        </header>

        {teams.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-sm shadow-sm">
            <h2 className="text-xl font-bold text-gray-400">Нет свободных клубов</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => {
              const isApplied = myApplications.includes(team.id);
              return (
                <div key={team.id} className="bg-white border border-gray-200 rounded-sm p-6 hover:shadow-lg transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border-2 border-gray-100">
                      {team.logo ? (
                        <img src={team.logo} alt={team.name} className="w-10 h-10 object-contain" />
                      ) : (
                        <Shield className="text-gray-300" size={24} />
                      )}
                    </div>
                    <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 px-2 py-1 rounded-sm">
                      Вакантно
                    </span>
                  </div>

                  <h3 className="text-lg font-black uppercase text-[#1a3151] mb-1">{team.name}</h3>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase mb-6">
                    <MapPin size={12} />
                    {team.country?.name}, {team.league?.name}
                  </div>

                  <button
                    onClick={() => handleApply(team.id)}
                    disabled={isApplied}
                    className={`w-full py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${
                      isApplied 
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-[#1a3151] text-white hover:bg-[#e30613]"
                    }`}
                  >
                    {isApplied ? "Заявка подана" : "Подать заявку"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}