import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { School, Position } from "@prisma/client";
// Импортируем логику расчета цены
import { getPriceFromPlayerObject } from "@/lib/economy";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const body = await req.json();
    const { 
      firstName, lastName, age, mainPosition, sidePosition, power, 
      teamId, countryId, school, potential, injuryProne, fatigue,
      specKr, specKt, specRv, specVp, specIbm, specKp, specSt, specZv, 
      specL, specKi, specPhys, specLong, specInt, specAnt, specSpd, specGkRea, specGkPos
    } = body;

    if (!firstName || !lastName || !teamId || !countryId || !mainPosition) {
      return NextResponse.json({ error: "Недостаточно данных" }, { status: 400 });
    }

    // 1. Автоматический расчет цены на основе пришедших данных
    const calculatedPrice = getPriceFromPlayerObject(body);

    // Маппинг школы из UI в Enum Prisma
    const schoolMapping: Record<string, School> = {
      "Сила": School.POWER,
      "Техника": School.THOUGHT,
      "Мысль": School.THOUGHT,
      "POWER": School.POWER,
      "THOUGHT": School.THOUGHT
    };

    const finalSchool = schoolMapping[school] || School.POWER;

    const newPlayer = await prisma.player.create({
      data: {
        firstName,
        lastName,
        age: Number(age),
        mainPosition: mainPosition as Position,
        sidePosition: (sidePosition as Position) || null,
        power: Number(power),
        school: finalSchool,
        potential: Number(potential) || 0,
        injuryProne: Number(injuryProne) || 0,
        fatigue: Number(fatigue) || 0,
        
        // 2. Устанавливаем рассчитанную цену (Prisma вернет это поле как BigInt)
        price: calculatedPrice, 

        team: { connect: { id: teamId } },
        country: { connect: { id: countryId } },
        
        // Спецухи
        specKr: Number(specKr) || 0,
        specKt: Number(specKt) || 0,
        specRv: Number(specRv) || 0,
        specVp: Number(specVp) || 0,
        specIbm: Number(specIbm) || 0,
        specKp: Number(specKp) || 0,
        specSt: Number(specSt) || 0,
        specZv: Number(specZv) || 0,
        specL: Number(specL) || 0,
        specKi: Number(specKi) || 0,
        specPhys: Number(specPhys) || 0,
        specLong: Number(specLong) || 0,
        specInt: Number(specInt) || 0,
        specAnt: Number(specAnt) || 0,
        specSpd: Number(specSpd) || 0,
        specGkRea: Number(specGkRea) || 0,
        specGkPos: Number(specGkPos) || 0,
      },
    });

    // 👇 ИСПРАВЛЕНИЕ ЗДЕСЬ
    // Мы вручную сериализуем объект, превращая BigInt (например, price) в строку
    const serializedPlayer = JSON.parse(
      JSON.stringify(newPlayer, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );

    return NextResponse.json(serializedPlayer, { status: 201 });

  } catch (error: any) {
    console.error("API_PLAYER_CREATE_ERROR:", error);
    return NextResponse.json(
      { error: "Ошибка при сохранении", details: error.message }, 
      { status: 500 }
    );
  }
}