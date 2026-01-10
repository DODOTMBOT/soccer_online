import { prisma } from "@/src/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/auth";
import { redirect } from "next/navigation";
import PlayerForm from "./PlayerForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const THEME = {
  colors: {
    bgMain: "bg-gray-50",
    primary: "bg-emerald-600",
    primaryText: "text-emerald-600",
  }
};

export default async function NewPlayerPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  // Загружаем данные из БД
  const [rawTeams, rawCountries, rawPlayStyles] = await Promise.all([
    prisma.team.findMany({
      select: { 
        id: true, 
        name: true, 
        countryId: true 
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

  // Маппинг данных для клиента
  const teams = rawTeams.map(team => ({
    id: team.id,
    name: team.name,
    countryId: team.countryId
  }));

  const countries = rawCountries.map(country => ({
    id: country.id,
    name: country.name
  }));

  return (
    <div className={`w-full min-h-full ${THEME.colors.bgMain} font-sans p-6`}>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex justify-between items-end gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Админ панель / Регистрация
            </span>
            <h2 className="text-2xl font-bold text-gray-900">
              Новый <span className={THEME.colors.primaryText}>игрок</span>
            </h2>
          </div>
          <Link 
            href="/admin" 
            className="text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft size={16} /> Отмена
          </Link>
        </div>

        <hr className="border-gray-200" />

        {/* Контент с формой */}
        <div className="w-full">
          <PlayerForm 
            teams={teams} 
            countries={countries} 
            playStyleDefinitions={rawPlayStyles} 
          />
        </div>

      </div>
    </div>
  );
}