import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { MatchStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { leagueId, roundsCount, seasonId } = await req.json();

    if (!seasonId) return NextResponse.json({ error: "Выберите сезон" }, { status: 400 });

    const teams = await prisma.team.findMany({ where: { leagueId } });
    if (teams.length < 2) return NextResponse.json({ error: "Мало команд" }, { status: 400 });

    let teamIds = teams.map(t => t.id);
    if (teamIds.length % 2 !== 0) teamIds.push("BYE");

    const n = teamIds.length;
    const matches = [];
    const totalRoundsPerCircle = n - 1;

    for (let circle = 0; circle < roundsCount; circle++) {
      for (let round = 0; round < totalRoundsPerCircle; round++) {
        const roundNumber = circle * totalRoundsPerCircle + round + 1;
        for (let i = 0; i < n / 2; i++) {
          const home = teamIds[i];
          const away = teamIds[n - 1 - i];

          if (home !== "BYE" && away !== "BYE") {
            matches.push({
              leagueId,
              seasonId,
              homeTeamId: circle % 2 === 0 ? home : away,
              awayTeamId: circle % 2 === 0 ? away : home,
              tour: roundNumber,
              status: MatchStatus.UPCOMING // Используем Enum вместо строки
            });
          }
        }
        teamIds.splice(1, 0, teamIds.pop()!);
      }
    }

    await prisma.match.deleteMany({ where: { leagueId, seasonId } });
    await prisma.match.createMany({ data: matches });

    return NextResponse.json({ success: true, totalTours: totalRoundsPerCircle * roundsCount });
  } catch (error) {
    console.error("GENERATION_ERROR:", error);
    return NextResponse.json({ error: "Ошибка генерации" }, { status: 500 });
  }
}