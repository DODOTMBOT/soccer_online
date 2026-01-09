import { prisma } from "@/src/server/db";
import { NextResponse } from "next/server";

export const maxDuration = 60; // Для долгих операций

export async function POST(req: Request) {
  try {
    const { type, seasonId } = await req.json();

    // 1. НАЧАЛО: Создание "пустого" сезона
    if (type === "CREATE_NEXT") {
      const lastSeason = await prisma.season.findFirst({ orderBy: { year: 'desc' } });
      const nextYear = lastSeason ? lastSeason.year + 1 : 2025;

      const newSeason = await prisma.season.create({
        data: { year: nextYear, status: 'ACTIVE' }
      });

      // Если был старый сезон, копируем структуру лиг (без команд)
      if (lastSeason) {
        const oldLeagues = await prisma.league.findMany({ 
          where: { seasonId: lastSeason.id } 
        });
        
        for (const ol of oldLeagues) {
          await prisma.league.create({
            data: {
              name: ol.name,
              level: ol.level,
              teamsCount: ol.teamsCount,
              countryId: ol.countryId,
              seasonId: newSeason.id
            }
          });
        }
      }
      return NextResponse.json({ message: `Сезон ${nextYear} создан. Распределите команды.` });
    }

    // 2. ЗАВЕРШЕНИЕ: Ротация команд (Промоушен/Релегация)
    if (type === "FINISH_AND_ROTATE") {
      const currentSeason = await prisma.season.findUnique({ where: { id: seasonId } });
      if (!currentSeason) throw new Error("Сезон не найден");

      // Создаем следующий сезон
      const nextYear = currentSeason.year + 1;
      const nextSeason = await prisma.season.create({ 
        data: { year: nextYear, status: 'ACTIVE' } 
      });

      // Получаем страны, участвовавшие в сезоне
      const activeCountries = await prisma.country.findMany({
        where: { leagues: { some: { seasonId: seasonId } } },
        include: {
          leagues: {
            where: { seasonId: seasonId },
            orderBy: { level: 'asc' }, // D1, D2, D3...
            include: { teams: true }   // Команды с текущей статистикой
          }
        }
      });

      // Логика ротации
      for (const country of activeCountries) {
        // Создаем карту новых лиг для следующего сезона
        const nextLeaguesMap = new Map<number, string>(); // Level -> LeagueID

        for (const oldLeague of country.leagues) {
          const newLeague = await prisma.league.create({
            data: {
              name: oldLeague.name,
              level: oldLeague.level,
              teamsCount: oldLeague.teamsCount,
              countryId: country.id,
              seasonId: nextSeason.id
            }
          });
          nextLeaguesMap.set(newLeague.level, newLeague.id);
        }

        const maxLevel = country.leagues.length;

        // Переносим команды
        for (const oldLeague of country.leagues) {
          // Сортируем таблицу (Очки -> Разница мячей)
          const sortedTeams = [...oldLeague.teams].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            return b.goalsDiff - a.goalsDiff;
          });

          for (let i = 0; i < sortedTeams.length; i++) {
            const team = sortedTeams[i];
            let targetLevel = oldLeague.level;

            // Зона повышения (Топ-2), если есть куда расти
            if (i < 2 && oldLeague.level > 1) {
              targetLevel = oldLeague.level - 1;
            }
            // Зона вылета (Последние 2), если есть куда падать
            else if (i >= sortedTeams.length - 2 && oldLeague.level < maxLevel) {
              targetLevel = oldLeague.level + 1;
            }

            const targetLeagueId = nextLeaguesMap.get(targetLevel);

            if (targetLeagueId) {
              // Сбрасываем статистику и назначаем новую лигу
              await prisma.team.update({
                where: { id: team.id },
                data: {
                  leagueId: targetLeagueId,
                  // Обнуление таблицы
                  points: 0, played: 0, wins: 0, draws: 0, losses: 0,
                  goalsScored: 0, goalsConceded: 0, goalsDiff: 0
                }
              });
            }
          }
        }
      }

      // Помечаем старый сезон как завершенный
      await prisma.season.update({
        where: { id: seasonId },
        data: { status: 'FINISHED' }
      });

      return NextResponse.json({ message: `Сезон ${currentSeason.year} закрыт. Ротация выполнена.` });
    }

    return NextResponse.json({ error: "Неверный тип действия" }, { status: 400 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}