import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Position, School } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { teamId } = await req.json();

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { countryId: true }
    });

    if (!team) return NextResponse.json({ error: "Клуб не найден" }, { status: 404 });

    const SURNAMES = ["Ivanov", "Smith", "Garcia", "Muller", "Rossi", "Dubois", "Silva", "Novak", "Kovacs", "Yilmaz"];
    const NAMES = ["Alex", "Max", "John", "David", "Luis", "Sam", "Karl", "Paul", "Rolf", "Felix"];

    const positions: Position[] = [
      Position.GK, Position.GK,
      Position.CB, Position.CB, Position.LCB, Position.RCB, Position.LB, Position.RB,
      Position.CM, Position.CM, Position.DM, Position.CAM, Position.LM, Position.RM,
      Position.ST, Position.ST, Position.CF, Position.LW
    ];

    const playersData = positions.map((pos) => ({
      firstName: NAMES[Math.floor(Math.random() * NAMES.length)],
      lastName: SURNAMES[Math.floor(Math.random() * SURNAMES.length)],
      age: Math.floor(Math.random() * (35 - 17 + 1)) + 17,
      mainPosition: pos, // Заменяем position на mainPosition
      sidePosition: null,
      power: Math.floor(Math.random() * (85 - 45 + 1)) + 45,
      school: Math.random() > 0.5 ? School.POWER : School.THOUGHT,
      potential: Math.floor(Math.random() * 100),
      injuryProne: Math.floor(Math.random() * 100),
      teamId: teamId,
      countryId: team.countryId,
      fatigue: 0,
      specKr: 0, specKt: 0, specRv: 0, specVp: 0, specIbm: 0, specKp: 0,
      specZv: 0, specSt: 0, specL: 0, specKi: 0, specPhys: 0, specLong: 0,
      specInt: 0, specAnt: 0, specSpd: 0, specGkRea: 0, specGkPos: 0
    }));

    await prisma.player.createMany({ data: playersData });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("GENERATE_ERROR:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}