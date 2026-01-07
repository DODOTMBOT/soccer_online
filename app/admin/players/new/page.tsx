// app/admin/players/new/page.tsx

import { prisma } from "@/src/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PlayerForm from "./PlayerForm";
import { Sidebar } from "@/components/admin/Sidebar"; // Теперь это горизонтальный Navbar
import { ArrowLeft, UserPlus, Shield } from "lucide-react";
import Link from "next/link";

export default async function NewPlayerPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  // Загружаем данные команд и стран
  const [rawTeams, rawCountries] = await Promise.all([
    prisma.team.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    }),
    prisma.country.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
  ]);

  // Сериализация данных для безопасной передачи в Client Component (PlayerForm)
  const teams = rawTeams.map(team => ({
    id: team.id,
    name: team.name
  }));

  const countries = rawCountries.map(country => ({
    id: country.id,
    name: country.name
  }));

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans">
      {/* Горизонтальное меню навигации сверху */}
      <Sidebar />

      {/* SUB-HEADER (Навигационная цепочка и статус) */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 shrink-0">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
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
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-12 gap-8">
            
            {/* Основная форма (Слева, 8 колонок) */}
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
                {/* Заголовок формы в стиле реестра */}
                <div className="bg-[#1a3151] px-8 py-3 flex justify-between items-center">
                  <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                    Анкета футболиста и характеристики
                  </h2>
                </div>
                
                <div className="p-8">
                  <PlayerForm teams={teams} countries={countries} />
                </div>
              </div>
            </div>

            {/* Инфо-панель (Справа, 4 колонки) */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-[#000c2d] p-8 text-white rounded-sm shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xs font-black uppercase tracking-widest mb-4 border-b border-white/10 pb-4 text-[#e30613]">
                    Важное при создании
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 bg-[#e30613] rounded-full mt-1.5 shrink-0" />
                      <p className="text-[11px] leading-relaxed text-gray-300">
                        Характеристики игрока (RS) будут автоматически пересчитаны при вводе базовой силы.
                      </p>
                    </li>
                    <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 bg-[#e30613] rounded-full mt-1.5 shrink-0" />
                      <p className="text-[11px] leading-relaxed text-gray-300">
                        Спецвозможности (спецухи) напрямую влияют на xG ударов и качество сейвов в движке.
                      </p>
                    </li>
                    <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 bg-[#e30613] rounded-full mt-1.5 shrink-0" />
                      <p className="text-[11px] leading-relaxed text-gray-300">
                        Убедитесь, что позиция игрока соответствует его роли в тактической схеме команды.
                      </p>
                    </li>
                  </ul>
                </div>
                <div className="absolute -right-6 -bottom-6 text-7xl font-black text-white/5 italic select-none">
                  NEW
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1.5 h-6 bg-[#1a3151]" />
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-[#000c2d]">Статистика базы</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-500">Доступно клубов</span>
                    <span className="font-bold">{teams.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-500">Доступно стран</span>
                    <span className="font-bold">{countries.length}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}