import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { playMatch } from "@/lib/soccer-engine";

export async function POST(req: Request) {
  try {
    const { seasonId, batchSize = 50 } = await req.json();

    if (!seasonId) return NextResponse.json({ error: "Выберите сезон" }, { status: 400 });

    // 1. Ищем НЕ сыгранные матчи (LIMIT batchSize)
    const matches = await prisma.match.findMany({
      where: {
        seasonId,
        status: "UPCOMING"
      },
      take: batchSize, // Берем только кусочек
      include: {
        homeTeam: { include: { players: true } },
        awayTeam: { include: { players: true } },
        setups: true
      }
    });

    const remainingCount = await prisma.match.count({
      where: { seasonId, status: "UPCOMING" }
    });

    if (matches.length === 0) {
      return NextResponse.json({ 
        done: true, 
        message: "Все матчи сыграны", 
        remaining: 0 
      });
    }

    const matchUpdates = [];
    const teamUpdates = [];

    // 2. Симуляция (тот же код, что и был)
    for (const match of matches) {
      // ... (Код подготовки engineHome/engineAway такой же)
      const homeSetup = match.setups.find(s => s.teamId === match.homeTeamId);
      const awaySetup = match.setups.find(s => s.teamId === match.awayTeamId);

      const engineHome = {
        teamId: match.homeTeamId,
        isHome: true,
        tactic: homeSetup?.tactic || "NORMAL",
        defenseSetup: homeSetup?.defenseSetup || "ZONAL",
        players: match.homeTeam.players.map(p => ({
          ...p,
          name: `${p.lastName} ${p.firstName}`,
          assignedPosition: p.mainPosition
        }))
      };

      const engineAway = {
        teamId: match.awayTeamId,
        isHome: false,
        tactic: awaySetup?.tactic || "NORMAL",
        defenseSetup: awaySetup?.defenseSetup || "ZONAL",
        players: match.awayTeam.players.map(p => ({
          ...p,
          name: `${p.lastName} ${p.firstName}`,
          assignedPosition: p.mainPosition
        }))
      };

      // @ts-ignore
      const result = playMatch(engineHome, engineAway);
      
      const homePoints = result.homeScore > result.awayScore ? 3 : (result.homeScore === result.awayScore ? 1 : 0);
      const awayPoints = result.awayScore > result.homeScore ? 3 : (result.awayScore === result.homeScore ? 1 : 0);

      // Обновление матча
      matchUpdates.push(
        prisma.match.update({
          where: { id: match.id },
          data: {
            homeScore: result.homeScore,
            awayScore: result.awayScore,
            status: "FINISHED"
          }
        })
      );

      // Обновление статистики (Home)
      teamUpdates.push(
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
        })
      );

      // Обновление статистики (Away)
      teamUpdates.push(
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
      );
    }

    // Выполняем транзакцию
    await prisma.$transaction([...matchUpdates, ...teamUpdates]);

    return NextResponse.json({ 
      done: false, 
      processed: matches.length, 
      remaining: remainingCount - matches.length 
    });

  } catch (error: any) {
    console.error("SIM_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}