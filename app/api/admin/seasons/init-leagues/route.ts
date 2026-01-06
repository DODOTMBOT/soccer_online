import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { seasonId } = await req.json();

    if (!seasonId) return NextResponse.json({ error: "Нет ID сезона" }, { status: 400 });

    // 1. Проверяем, есть ли уже лиги в ЭТОМ сезоне
    const currentLeagues = await prisma.league.findMany({
      where: { seasonId }
    });

    if (currentLeagues.length > 0) {
      return NextResponse.json({ success: true, message: "Лиги уже существуют в этом сезоне." });
    }

    // 2. Ищем лиги из ПОСЛЕДНЕГО АКТИВНОГО (или любого предыдущего) сезона
    // Чтобы скопировать их структуру
    const lastLeagueData = await prisma.league.findFirst({
      where: { seasonId: { not: seasonId } },
      orderBy: { createdAt: 'desc' },
      select: { seasonId: true }
    });

    // --- ВАРИАНТ А: Это самый первый запуск (база пустая) ---
    if (!lastLeagueData) {
      // Создаем стартовую структуру с нуля
      let country = await prisma.country.findUnique({ where: { name: "Англия" } });
      if (!country) {
        country = await prisma.country.create({
          data: { name: "Англия", confederation: "UEFA", flag: "/flags/england.png" }
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

    // --- ВАРИАНТ Б: Перенос из прошлого сезона ---
    // Находим все лиги прошлого сезона
    const previousLeagues = await prisma.league.findMany({
      where: { seasonId: lastLeagueData.seasonId },
      include: { teams: true } // Забираем команды, чтобы перенести их
    });

    let migratedCount = 0;

    for (const prevLeague of previousLeagues) {
      // 1. Создаем такую же лигу, но для НОВОГО сезона
      const newLeague = await prisma.league.create({
        data: {
          name: prevLeague.name,
          level: prevLeague.level,
          teamsCount: prevLeague.teamsCount,
          countryId: prevLeague.countryId,
          seasonId: seasonId // Привязываем к новому сезону
        }
      });

      // 2. Переносим все команды из старой лиги в новую
      // (Мы обновляем их leagueId, чтобы они "переехали" в новый сезон)
      const teamIds = prevLeague.teams.map(t => t.id);
      
      if (teamIds.length > 0) {
        await prisma.team.updateMany({
          where: { id: { in: teamIds } },
          data: { 
            leagueId: newLeague.id,
            // Сбрасываем статистику для нового сезона
            played: 0, wins: 0, draws: 0, losses: 0,
            goalsScored: 0, goalsConceded: 0, goalsDiff: 0, points: 0
          }
        });
      }
      
      migratedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Сезон инициализирован! Перенесено лиг: ${migratedCount}. Команды переведены в новый сезон.` 
    });

  } catch (error: any) {
    console.error("INIT_LEAGUES_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}