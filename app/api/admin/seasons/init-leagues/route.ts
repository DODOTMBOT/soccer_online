import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { seasonId } = await req.json();

    if (!seasonId) return NextResponse.json({ error: "Нет ID сезона" }, { status: 400 });

    // 1. Проверяем, не инициализирован ли уже этот сезон
    const currentLeagues = await prisma.league.findMany({
      where: { seasonId }
    });

    if (currentLeagues.length > 0) {
      return NextResponse.json({ success: true, message: "Лиги уже существуют в этом сезоне." });
    }

    // 2. Ищем лиги ПРЕДЫДУЩЕГО сезона (чтобы взять их за основу)
    // Находим любую лигу, которая НЕ принадлежит текущему сезону, сортируем по дате создания (последние)
    const lastLeague = await prisma.league.findFirst({
      where: { seasonId: { not: seasonId } },
      orderBy: { createdAt: 'desc' }
    });

    // --- ВАРИАНТ А: База пустая (Первый запуск) ---
    if (!lastLeague) {
      let country = await prisma.country.findUnique({ where: { name: "Англия" } });
      if (!country) {
        country = await prisma.country.create({
          data: { name: "Англия", confederation: "UEFA", flag: "https://flagcdn.com/w320/gb-eng.png" }
        });
      }

      await prisma.league.create({
        data: {
          name: "Premier League",
          level: 1,
          teamsCount: 16,
          countryId: country.id,
          seasonId: seasonId
        }
      });
      return NextResponse.json({ success: true, message: "Базовая лига создана (первый запуск)." });
    }

    // --- ВАРИАНТ Б: Ротация и перенос из прошлого сезона ---
    
    // Получаем все лиги старого сезона, отсортированные по уровню (1, 2, 3...)
    const prevLeagues = await prisma.league.findMany({
      where: { seasonId: lastLeague.seasonId },
      orderBy: { level: 'asc' },
      include: { teams: true }
    });

    // Создаем структуру НОВЫХ лиг и запоминаем их ID по уровню
    // Map<Level, NewLeagueID>
    const newLevelMap = new Map<number, string>();

    for (const prevL of prevLeagues) {
      const newL = await prisma.league.create({
        data: {
          name: prevL.name,
          level: prevL.level,
          teamsCount: prevL.teamsCount,
          countryId: prevL.countryId,
          seasonId: seasonId // Привязываем к новому сезону
        }
      });
      newLevelMap.set(newL.level, newL.id);
    }

    // Логика перемещения команд
    const teamUpdates = [];

    // Определяем максимальный уровень лиги в этой стране (чтобы не вылетать из последней)
    const maxLevel = Math.max(...prevLeagues.map(l => l.level));

    for (const prevL of prevLeagues) {
      // 1. Сортируем таблицу старого сезона
      const sortedTeams = [...prevL.teams].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalsDiff !== a.goalsDiff) return b.goalsDiff - a.goalsDiff;
        if (b.goalsScored !== a.goalsScored) return b.goalsScored - a.goalsScored;
        return b.power - a.power; // Тай-брейк по силе
      });

      // 2. Определяем судьбу команд
      for (let i = 0; i < sortedTeams.length; i++) {
        const team = sortedTeams[i];
        const position = i + 1;
        let targetLevel = prevL.level; // По умолчанию остаемся

        // ПОВЫШЕНИЕ (для всех, кроме 1 уровня)
        // Первые 2 места идут наверх
        if (prevL.level > 1 && position <= 2) {
          targetLevel = prevL.level - 1;
        }

        // ПОНИЖЕНИЕ (для всех, кроме последнего уровня)
        // Последние 2 места идут вниз
        if (prevL.level < maxLevel && position > sortedTeams.length - 2) {
          targetLevel = prevL.level + 1;
        }

        // Получаем ID новой лиги
        const targetLeagueId = newLevelMap.get(targetLevel);

        if (targetLeagueId) {
          teamUpdates.push(
            prisma.team.update({
              where: { id: team.id },
              data: {
                leagueId: targetLeagueId,
                // СБРОС СТАТИСТИКИ
                points: 0,
                played: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                goalsScored: 0,
                goalsConceded: 0,
                goalsDiff: 0
              }
            })
          );
        }
      }
    }

    // Выполняем массовое обновление
    await prisma.$transaction(teamUpdates);

    return NextResponse.json({ 
      success: true, 
      message: `Сезон инициализирован! Обработано команд: ${teamUpdates.length}. Ротация произведена.` 
    });

  } catch (error: any) {
    console.error("INIT_LEAGUES_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}