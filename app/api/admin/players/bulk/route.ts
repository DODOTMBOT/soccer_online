import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Position } from "@prisma/client";

/**
 * Карта исправления позиций. 
 * Используются только значения, существующие в enum Position схемы Prisma.
 */
const POSITION_MAP: Record<string, Position> = {
  "LD": Position.LD,
  "RD": Position.RD,
  "CD": Position.CD, // В схеме используется CD вместо CB
  "ST": Position.ST,
  "LW": Position.LF, // Маппинг на доступные в схеме позиции Forward
  "RW": Position.RF,
  "FR": Position.FR, // Free Role доступен в схеме
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const playersData = Array.isArray(body) ? body : body.players;

    if (!playersData || playersData.length === 0) {
      return NextResponse.json({ error: "Нет данных для сохранения" }, { status: 400 });
    }

    const created = await prisma.player.createMany({
      data: playersData.map((p: any) => {
        // Проверяем позицию по карте или оставляем как есть
        const finalMainPos = POSITION_MAP[p.mainPosition] || p.mainPosition;
        const finalSidePos = p.sidePosition ? (POSITION_MAP[p.sidePosition] || p.sidePosition) : null;

        return {
          firstName: p.firstName,
          lastName: p.lastName,
          age: Number(p.age) || 18,
          
          mainPosition: finalMainPos as Position, 
          sidePosition: finalSidePos as Position,
          
          teamId: p.teamId,
          countryId: p.countryId,
          
          power: Number(p.power) || 40,
          // Убрано поле school, так как оно отсутствует в текущей схеме Player
          
          price: p.price ? BigInt(p.price) : BigInt(0),
          potential: Number(p.potential) || 0,
          injuryProne: Number(p.injuryProne) || 0,
          fatigue: Number(p.fatigue) || 0,

          // Соответствие полей специализаций актуальной схеме
          specSpeed: Number(p.specSpeed) || Number(p.specSpd) || 0,
          specHeading: Number(p.specHeading) || 0,
          specLongPass: Number(p.specLongPass) || 0,
          specShortPass: Number(p.specShortPass) || Number(p.specKp) || 0,
          specDribbling: Number(p.specDribbling) || 0,
          specCombination: Number(p.specCombination) || 0,
          specTackling: Number(p.specTackling) || 0,
          specMarking: Number(p.specMarking) || 0,
          specShooting: Number(p.specShooting) || 0,
          specFreeKicks: Number(p.specFreeKicks) || Number(p.specSt) || 0,
          specCorners: Number(p.specCorners) || 0,
          specPenalty: Number(p.specPenalty) || 0,
          specCaptain: Number(p.specCaptain) || 0,
          specLeader: Number(p.specLeader) || Number(p.specL) || 0,
          specAthleticism: Number(p.specAthleticism) || Number(p.specPhys) || 0,
          specSimulation: Number(p.specSimulation) || 0,
          specGkReflexes: Number(p.specGkReflexes) || Number(p.specGkRea) || 0,
          specGkOut: Number(p.specGkOut) || 0,
        };
      }),
      skipDuplicates: true,
    });

    return NextResponse.json({ 
      success: true, 
      count: created.count 
    }, { status: 201 });

  } catch (error: any) {
    console.error("BULK_CREATE_ERROR:", error);
    return NextResponse.json({ 
      error: "Ошибка создания игроков. Проверьте соответствие Enum позиций и имен полей.", 
      details: error.message 
    }, { status: 500 });
  }
}