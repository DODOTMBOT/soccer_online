import { prisma } from "@/src/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/auth";
import { redirect } from "next/navigation";
import PlayerForm from "./PlayerForm";
import { Sidebar } from "@/components/admin/Sidebar";
import { ArrowLeft, UserPlus, Shield } from "lucide-react";
import Link from "next/link";

export default async function NewPlayerPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  // Загружаем команды (С COUNTRY_ID!), страны и стили
  const [rawTeams, rawCountries, rawPlayStyles] = await Promise.all([
    prisma.team.findMany({
      select: { 
        id: true, 
        name: true, 
        countryId: true // <--- ВАЖНО: Добавили это поле для фильтрации
      },
      orderBy: { name: 'asc' }
    }),
    prisma.country.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    }),
    prisma.playStyleDefinition.findMany({
      orderBy: { name: 'asc' }
    })
  ]);

  // Маппинг данных
  const teams = rawTeams.map(team => ({
    id: team.id,
    name: team.name,
    countryId: team.countryId // Передаем на клиент
  }));

  const countries = rawCountries.map(country => ({
    id: country.id,
    name: country.name
  }));

  const playStyleDefinitions = rawPlayStyles;

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans">
      <Sidebar />

      <div className="bg-white border-b border-gray-200 px-8 py-4 shrink-0">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-400 hover:text-[#000c2d] transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-3">
              <UserPlus size={20} className="text-[#e30613]" />
              <h1 className="text-xl font-black uppercase tracking-tighter italic text-[#000c2d]">
                Регистрация <span className="text-[#e30613]">нового игрока</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Система верификации контрактов
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#1a3151] px-8 py-3 flex justify-between items-center">
              <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                Анкета футболиста и характеристики
              </h2>
            </div>
            
            <div className="p-8">
              <PlayerForm 
                teams={teams} 
                countries={countries} 
                playStyleDefinitions={playStyleDefinitions} 
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}