import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Position } from "@prisma/client";

/**
 * Карта исправления позиций. 
 * Если с фронтенда придет "LD", мы сохраним его как "LB" и т.д.
 */
const POSITION_MAP: Record<string, Position> = {
  "LD": Position.LB,
  "RD": Position.RB,
  "CD": Position.CB,
  "FR": Position.ST, // Если FR нет в Enum, меняем на ST
  // Добавьте сюда другие сокращения, если они не совпадают с вашим Enum Position
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
        // Проверяем позицию: если она в карте — меняем, если нет — оставляем как есть
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
          school: p.school || "POWER",
          
          price: p.price ? BigInt(p.price) : BigInt(0),
          potential: Number(p.potential) || 0,
          injuryProne: Number(p.injuryProne) || 0,
          fatigue: Number(p.fatigue) || 0,

          specKr: Number(p.specKr) || 0,
          specKt: Number(p.specKt) || 0,
          specRv: Number(p.specRv) || 0,
          specVp: Number(p.specVp) || 0,
          specIbm: Number(p.specIbm) || 0,
          specKp: Number(p.specKp) || 0,
          specZv: Number(p.specZv) || 0,
          specSt: Number(p.specSt) || 0,
          specL: Number(p.specL) || 0,
          specKi: Number(p.specKi) || 0,
          specPhys: Number(p.specPhys) || 0,
          specLong: Number(p.specLong) || 0,
          specInt: Number(p.specInt) || 0,
          specAnt: Number(p.specAnt) || 0,
          specSpd: Number(p.specSpd) || 0,
          specGkRea: Number(p.specGkRea) || 0,
          specGkPos: Number(p.specGkPos) || 0,
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
      error: "Ошибка создания игроков. Возможно, недопустимое значение позиции (Enum).", 
      details: error.message 
    }, { status: 500 });
  }
}