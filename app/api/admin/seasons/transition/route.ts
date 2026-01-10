import { prisma } from "@/src/server/db";
import { NextResponse } from "next/server";

export const maxDuration = 60; // Для долгих операций

export async function POST(req: Request) {
  try {
    const { type, seasonId } = await req.json();

    // 1. НАЧАЛО: Создание нового сезона
    if (type === "CREATE_NEXT") {
      const lastSeason = await prisma.season.findFirst({ orderBy: { year: 'desc' } });
      
      // ЛОГИКА НУМЕРАЦИИ:
      // Если сезонов нет -> 1
      // Если последний сезон > 2000 (старый формат) -> сбрасываем на 1
      // Иначе -> +1
      let nextYear = 1;
      if (lastSeason) {
        if (lastSeason.year > 2000) {
           nextYear = 1; // Сброс, если были "годы"
        } else {
           nextYear = lastSeason.year + 1;
        }
      }

      // Проверка на дубликат (на случай, если сезон 1 уже есть, но не последний)
      const existing = await prisma.season.findUnique({ where: { year: nextYear } });
      if (existing) {
         // Если 1 занят, ищем первый свободный слот
         const allSeasons = await prisma.season.findMany({ select: { year: true } });
         const years = allSeasons.map(s => s.year).sort((a,b) => a-b);
         nextYear = (years[years.length - 1] || 0) + 1;
         // Если вдруг опять попали в >2000, форсируем
         if (nextYear > 2000) nextYear = 1; 
         while (years.includes(nextYear)) nextYear++;
      }

      const newSeason = await prisma.season.create({
        data: { year: nextYear, status: 'ACTIVE' }
      });

      // Копирование структуры лиг
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
      return NextResponse.json({ message: `Сезон ${nextYear} создан.` });
    }

    // 2. ЗАВЕРШЕНИЕ И РОТАЦИЯ
    if (type === "FINISH_AND_ROTATE") {
      const currentSeason = await prisma.season.findUnique({ where: { id: seasonId } });
      if (!currentSeason) throw new Error("Сезон не найден");

      // Определяем следующий год для ротации
      let nextYear = currentSeason.year + 1;
      // Если текущий был "годом" (2025), следующий станет 1
      if (currentSeason.year > 2000) nextYear = 1;

      // Проверка на существование (вдруг сезон 1 уже создан заранее)
      let nextSeason = await prisma.season.findUnique({ where: { year: nextYear } });
      
      if (!nextSeason) {
        nextSeason = await prisma.season.create({ 
          data: { year: nextYear, status: 'ACTIVE' } 
        });
      } else {
        // Если сезон уже есть, просто активируем его (если он не завершен)
        if (nextSeason.status === 'FINISHED') {
           // Если сезон 1 уже был и завершен, создаем сезон 2...
           const last = await prisma.season.findFirst({ orderBy: { year: 'desc' } });
           nextYear = (last?.year || 0) + 1;
           if (nextYear > 2000) nextYear = 1; // Защита
           // Ищем свободный
           const all = await prisma.season.findMany({ select: { year: true } });
           const years = all.map(s => s.year);
           while (years.includes(nextYear)) nextYear++;
           
           nextSeason = await prisma.season.create({
             data: { year: nextYear, status: 'ACTIVE' }
           });
        } else {
           // Если сезон есть и он ACTIVE/PENDING, используем его
           await prisma.season.update({ where: { id: nextSeason.id }, data: { status: 'ACTIVE' } });
        }
      }

      // ... (Остальная логика ротации без изменений) ...
      const activeCountries = await prisma.country.findMany({
        where: { leagues: { some: { seasonId: seasonId } } },
        include: {
          leagues: {
            where: { seasonId: seasonId },
            orderBy: { level: 'asc' },
            include: { teams: true }
          }
        }
      });

      for (const country of activeCountries) {
        const nextLeaguesMap = new Map<number, string>();

        for (const oldLeague of country.leagues) {
          // Проверяем, есть ли уже такая лига в новом сезоне
          let newLeague = await prisma.league.findFirst({
            where: { seasonId: nextSeason.id, countryId: country.id, level: oldLeague.level }
          });

          if (!newLeague) {
            newLeague = await prisma.league.create({
              data: {
                name: oldLeague.name,
                level: oldLeague.level,
                teamsCount: oldLeague.teamsCount,
                countryId: country.id,
                seasonId: nextSeason.id
              }
            });
          }
          nextLeaguesMap.set(newLeague.level, newLeague.id);
        }

        const maxLevel = country.leagues.length;

        for (const oldLeague of country.leagues) {
          const sortedTeams = [...oldLeague.teams].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            return b.goalsDiff - a.goalsDiff;
          });

          for (let i = 0; i < sortedTeams.length; i++) {
            const team = sortedTeams[i];
            let targetLevel = oldLeague.level;

            if (i < 2 && oldLeague.level > 1) {
              targetLevel = oldLeague.level - 1;
            }
            else if (i >= sortedTeams.length - 2 && oldLeague.level < maxLevel) {
              targetLevel = oldLeague.level + 1;
            }

            const targetLeagueId = nextLeaguesMap.get(targetLevel);

            if (targetLeagueId) {
              await prisma.team.update({
                where: { id: team.id },
                data: {
                  leagueId: targetLeagueId,
                  points: 0, played: 0, wins: 0, draws: 0, losses: 0,
                  goalsScored: 0, goalsConceded: 0, goalsDiff: 0
                }
              });
            }
          }
        }
      }

      await prisma.season.update({
        where: { id: seasonId },
        data: { status: 'FINISHED' }
      });

      return NextResponse.json({ message: `Сезон ${currentSeason.year} закрыт. Переход к сезону ${nextYear}.` });
    }

    return NextResponse.json({ error: "Неверный тип действия" }, { status: 400 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}