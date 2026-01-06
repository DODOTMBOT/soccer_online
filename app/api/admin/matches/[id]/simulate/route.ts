import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { playMatch } from "@/lib/soccer-engine";
import { revalidatePath } from "next/cache";

// ГЕНЕРАЦИЯ МАТЧА (POST)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Загружаем данные матча
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
        setups: {
          include: {
            lineupSlots: {
              include: { player: true }
            }
          }
        }
      }
    });

    if (!match) {
      return NextResponse.json({ error: "Матч не найден" }, { status: 404 });
    }

    if (match.status === "FINISHED") {
      return NextResponse.json({ error: "Матч уже завершен" }, { status: 400 });
    }

    // 2. Поиск составов (фоллбек на дефолт, если нет)
    const homeSetup = match.setups.find(s => s.teamId === match.homeTeamId);
    const awaySetup = match.setups.find(s => s.teamId === match.awayTeamId);

    // 3. Формируем данные для движка
    const engineHome = {
      teamId: match.homeTeamId,
      isHome: true,
      tactic: homeSetup?.tactic || "NORMAL",
      defenseSetup: homeSetup?.defenseSetup || "ZONAL",
      players: homeSetup?.lineupSlots.map(slot => ({
        ...slot.player,
        name: `${slot.player.lastName} ${slot.player.firstName}`,
        assignedPosition: slot.assignedPosition
      })) || []
    };

    const engineAway = {
      teamId: match.awayTeamId,
      isHome: false,
      tactic: awaySetup?.tactic || "NORMAL",
      defenseSetup: awaySetup?.defenseSetup || "ZONAL",
      players: awaySetup?.lineupSlots.map(slot => ({
        ...slot.player,
        name: `${slot.player.lastName} ${slot.player.firstName}`,
        assignedPosition: slot.assignedPosition
      })) || []
    };

    // 4. Запуск генератора
    // @ts-ignore
    const result = playMatch(engineHome, engineAway);
    const reportData = JSON.parse(JSON.stringify(result));

    // 5. Транзакция: Обновляем матч + Обновляем статистику команд
    const homePoints = result.homeScore > result.awayScore ? 3 : (result.homeScore === result.awayScore ? 1 : 0);
    const awayPoints = result.awayScore > result.homeScore ? 3 : (result.awayScore === result.homeScore ? 1 : 0);

    await prisma.$transaction([
      // A. Обновляем сам матч
      prisma.match.update({
        where: { id },
        data: {
          homeScore: result.homeScore,
          awayScore: result.awayScore,
          status: "FINISHED",
          report: reportData 
        }
      }),

      // B. Обновляем Хозяев
      prisma.team.update({
        where: { id: match.homeTeamId },
        data: {
          played: { increment: 1 },
          wins: { increment: result.homeScore > result.awayScore ? 1 : 0 },
          draws: { increment: result.homeScore === result.awayScore ? 1 : 0 },
          losses: { increment: result.homeScore < result.awayScore ? 1 : 0 },
          goalsScored: { increment: result.homeScore },
          goalsConceded: { increment: result.awayScore },
          goalsDiff: { increment: result.homeScore - result.awayScore },
          points: { increment: homePoints }
        }
      }),

      // C. Обновляем Гостей
      prisma.team.update({
        where: { id: match.awayTeamId },
        data: {
          played: { increment: 1 },
          wins: { increment: result.awayScore > result.homeScore ? 1 : 0 },
          draws: { increment: result.awayScore === result.homeScore ? 1 : 0 },
          losses: { increment: result.awayScore < result.homeScore ? 1 : 0 },
          goalsScored: { increment: result.awayScore },
          goalsConceded: { increment: result.homeScore },
          goalsDiff: { increment: result.awayScore - result.homeScore },
          points: { increment: awayPoints }
        }
      })
    ]);

    // 6. Обновление кэша
    revalidatePath(`/admin/matches/${id}`);
    revalidatePath(`/admin/teams/${match.homeTeamId}`);
    revalidatePath(`/admin/teams/${match.awayTeamId}`);
    revalidatePath(`/admin/leagues/${match.leagueId}`);

    return NextResponse.json({ success: true, result: reportData });

  } catch (error) {
    console.error("SIMULATION_ERROR:", error);
    return NextResponse.json(
      { error: "Ошибка при симуляции", details: error instanceof Error ? error.message : "Unknown error" }, 
      { status: 500 }
    );
  }
}

// СБРОС РЕЗУЛЬТАТА (DELETE)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const match = await prisma.match.findUnique({
      where: { id },
      select: { 
        homeTeamId: true, 
        awayTeamId: true, 
        homeScore: true, 
        awayScore: true,
        status: true,
        leagueId: true
      }
    });

    if (!match || match.status !== "FINISHED" || match.homeScore === null || match.awayScore === null) {
      return NextResponse.json({ error: "Матч не сыгран или не найден" }, { status: 400 });
    }

    const { homeScore, awayScore } = match;
    const homePoints = homeScore > awayScore ? 3 : (homeScore === awayScore ? 1 : 0);
    const awayPoints = awayScore > homeScore ? 3 : (awayScore === homeScore ? 1 : 0);

    // Откатываем статистику (decrement)
    await prisma.$transaction([
      prisma.match.update({
        where: { id },
        data: {
          homeScore: null,
          awayScore: null,
          status: "UPCOMING",
          report: Prisma.DbNull 
        }
      }),

      prisma.team.update({
        where: { id: match.homeTeamId },
        data: {
          played: { decrement: 1 },
          wins: { decrement: homeScore > awayScore ? 1 : 0 },
          draws: { decrement: homeScore === awayScore ? 1 : 0 },
          losses: { decrement: homeScore < awayScore ? 1 : 0 },
          goalsScored: { decrement: homeScore },
          goalsConceded: { decrement: awayScore },
          goalsDiff: { decrement: homeScore - awayScore },
          points: { decrement: homePoints }
        }
      }),

      prisma.team.update({
        where: { id: match.awayTeamId },
        data: {
          played: { decrement: 1 },
          wins: { decrement: awayScore > homeScore ? 1 : 0 },
          draws: { decrement: awayScore === homeScore ? 1 : 0 },
          losses: { decrement: awayScore < homeScore ? 1 : 0 },
          goalsScored: { decrement: awayScore },
          goalsConceded: { decrement: homeScore },
          goalsDiff: { decrement: awayScore - homeScore },
          points: { decrement: awayPoints }
        }
      })
    ]);

    revalidatePath(`/admin/matches/${id}`);
    revalidatePath(`/admin/leagues/${match.leagueId}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("RESET_ERROR:", error);
    return NextResponse.json({ error: "Ошибка при сбросе результата" }, { status: 500 });
  }
}