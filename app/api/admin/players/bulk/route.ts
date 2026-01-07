import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const playersData = await req.json();

    if (!Array.isArray(playersData)) {
      return NextResponse.json({ error: "Ожидался массив данных" }, { status: 400 });
    }

    const created = await prisma.player.createMany({
      data: playersData.map((p: any) => ({
        firstName: p.firstName,
        lastName: p.lastName,
        age: parseInt(p.age),
        mainPosition: p.mainPosition,
        sidePosition: p.sidePosition || null,
        teamId: p.teamId,
        countryId: p.countryId,
        power: parseInt(p.power),
        
        // Поля физ. формы
        formIndex: p.formIndex !== undefined ? parseInt(p.formIndex) : 0,
        fatigue: 0,
        fitness: 100,
        currentForm: 100,
        // formIndex_history УДАЛЕНО, так как его нет в схеме

        // Специализации (маппинг ключей формы на поля БД)
        specSpeed: parseInt(p.specSpd || 0),
        specHeading: parseInt(p.specHeading || 0),
        specLongPass: parseInt(p.specLong || 0),
        specShortPass: parseInt(p.specShortPass || 0),
        specDribbling: parseInt(p.specKt || 0), 
        specCombination: parseInt(p.specCombination || 0),
        specTackling: parseInt(p.specTackling || 0),
        specMarking: parseInt(p.specMarking || 0),
        specShooting: parseInt(p.specZv || 0),
        specFreeKicks: parseInt(p.specSt || 0),
        specCorners: parseInt(p.specCorners || 0),
        specPenalty: parseInt(p.specPenalty || 0),
        specCaptain: parseInt(p.specL || 0),
        specLeader: parseInt(p.specKi || 0),
        specAthleticism: parseInt(p.specPhys || 0),
        specSimulation: parseInt(p.specSimulation || 0),
        specGkReflexes: parseInt(p.specGkRea || 0),
        specGkOut: parseInt(p.specGkPos || 0),
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({ 
      success: true, 
      count: created.count 
    });

  } catch (error: any) {
    console.error("BULK_CREATE_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}