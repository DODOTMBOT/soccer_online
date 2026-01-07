import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createPlayersBulkSchema } from "@/src/lib/validation"; // Импорт схемы массива

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. ВАЛИДАЦИЯ ВСЕГО МАССИВА
    const result = createPlayersBulkSchema.safeParse(body);
    
    if (!result.success) {
      // Показываем ошибку: "Игрок №2: Возраст должен быть..."
      const issue = result.error.issues[0];
      const index = issue.path[0]; // Индекс элемента в массиве
      return NextResponse.json(
        { error: `Ошибка в строке ${Number(index) + 1}: ${issue.message}` }, 
        { status: 400 }
      );
    }

    const playersData = result.data;

    // 2. СОЗДАНИЕ (Используем проверенные данные)
    const created = await prisma.player.createMany({
      data: playersData.map((p) => ({
        firstName: p.firstName,
        lastName: p.lastName,
        age: p.age,
        mainPosition: p.mainPosition,
        sidePosition: p.sidePosition || null,
        teamId: p.teamId,
        countryId: p.countryId,
        power: p.power,
        
        // Zod уже проставил дефолты (0), если полей не было
        formIndex: p.formIndex,
        fatigue: 0,
        fitness: 100,
        currentForm: 100,

        specSpeed: p.specSpd,
        specHeading: p.specHeading,
        specLongPass: p.specLong,
        specShortPass: p.specShortPass,
        specDribbling: p.specKt, 
        specCombination: p.specCombination,
        specTackling: p.specTackling,
        specMarking: p.specMarking,
        specShooting: p.specZv,
        specFreeKicks: p.specSt,
        specCorners: p.specCorners,
        specPenalty: p.specPenalty,
        specCaptain: p.specL,
        specLeader: p.specKi,
        specAthleticism: p.specPhys,
        specSimulation: p.specSimulation,
        specGkReflexes: p.specGkRea,
        specGkOut: p.specGkPos,
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