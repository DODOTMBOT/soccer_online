import { prisma } from "@/src/server/db";
import { NextResponse } from "next/server";
import { playMatch, EngineTeam, EnginePlayer } from "@/src/server/domain/engine/core";
import { Prisma } from "@prisma/client";

// Временный маппер для демо (упрощенный, так как у нас нет MatchTeamSetup)
function mapDemoTeam(team: any): EngineTeam {
  return {
    teamId: team.id,
    name: team.name,
    isHome: true, // В демо неважно
    tactic: "NORMAL", // Дефолт
    defenseSetup: "ZONAL",
    players: team.players.map((p: any) => ({
      id: p.id,
      name: `${p.lastName} ${p.firstName}`,
      power: p.power,
      assignedPosition: p.mainPosition,
      // В демо спецухи можно пока не мапить детально или взять базовые
      specKr: 0,
    } as EnginePlayer))
  };
}

export async function POST(req: Request) {
  try {
    const { team1Id, team2Id } = await req.json();

    const [t1, t2] = await Promise.all([
      prisma.team.findUnique({ where: { id: team1Id }, include: { players: true } }),
      prisma.team.findUnique({ where: { id: team2Id }, include: { players: true } })
    ]);

    if (!t1 || !t2) return NextResponse.json({ error: "Команды не найдены" }, { status: 404 });

    const engineT1 = mapDemoTeam(t1);
    const engineT2 = mapDemoTeam(t2);
    // Для демо вторую команду помечаем как "в гостях"
    engineT2.isHome = false;

    const result = playMatch(engineT1, engineT2);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}