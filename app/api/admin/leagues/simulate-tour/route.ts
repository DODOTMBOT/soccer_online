import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { MatchService } from "@/src/services/match-service"; // Подключаем наш сервис
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const { leagueId, tour, seasonId } = await req.json();

    // 1. Ищем несыгранные матчи тура
    const matches = await prisma.match.findMany({
      where: {
        leagueId,
        tour: parseInt(tour),
        seasonId,
        status: "UPCOMING"
      },
      select: { id: true } // Нам нужны только ID, сервис сам загрузит остальное
    });

    if (matches.length === 0) {
      return NextResponse.json({ message: "Нет матчей для симуляции" });
    }

    // 2. Запускаем симуляцию каждого матча через сервис
    // Используем Promise.all для параллельного выполнения (8 матчей БД выдержит легко)
    const results = await Promise.all(
      matches.map(m => MatchService.simulateMatch(m.id))
    );

    // 3. Обновляем кэш
    revalidatePath(`/admin/leagues/${leagueId}`);

    return NextResponse.json({ 
      success: true, 
      played: results.length 
    });

  } catch (error: any) {
    console.error("TOUR_SIMULATION_ERROR:", error);
    return NextResponse.json({ error: error.message || "Ошибка при симуляции тура" }, { status: 500 });
  }
}