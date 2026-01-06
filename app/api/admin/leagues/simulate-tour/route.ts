import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { playMatch } from "@/lib/soccer-engine";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const { leagueId, tour, seasonId } = await req.json();

    const matches = await prisma.match.findMany({
      where: {
        leagueId,
        tour: parseInt(tour),
        seasonId,
        status: "UPCOMING"
      },
      include: {
        homeTeam: { include: { players: true } },
        awayTeam: { include: { players: true } },
        // КРИТИЧНО: Загружаем тактики и составы на этот конкретный матч
        setups: true 
      }
    });

    if (matches.length === 0) {
      return NextResponse.json({ message: "Нет матчей для симуляции" });
    }

    const updates = matches.map((match) => {
      // Ищем настройки для каждой команды
      const homeSetup = match.setups.find(s => s.teamId === match.homeTeamId);
      const awaySetup = match.setups.find(s => s.teamId === match.awayTeamId);

      // Формируем данные для движка, чтобы TypeScript не ругался
      const engineHomeTeam = {
        ...match.homeTeam,
        teamId: match.homeTeamId,
        isHome: true,
        tactic: homeSetup?.tactic || "TIKI_TAKA", // Дефолт, если тренер не отправил состав
        defenseSetup: homeSetup?.defenseSetup || "ZONAL"
      };

      const engineAwayTeam = {
        ...match.awayTeam,
        teamId: match.awayTeamId,
        isHome: false,
        tactic: awaySetup?.tactic || "TIKI_TAKA",
        defenseSetup: awaySetup?.defenseSetup || "ZONAL"
      };

      // @ts-ignore (если в EngineTeam еще есть расхождения по Player[])
      const result = playMatch(engineHomeTeam, engineAwayTeam);

      return prisma.match.update({
        where: { id: match.id },
        data: {
          homeScore: result.homeScore,
          awayScore: result.awayScore,
          status: "FINISHED"
        }
      });
    });

    await prisma.$transaction(updates);

    // Обновляем кэш страницы лиги
    revalidatePath(`/admin/leagues/${leagueId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SIMULATION_ERROR:", error);
    return NextResponse.json({ error: "Ошибка при симуляции тура" }, { status: 500 });
  }
}