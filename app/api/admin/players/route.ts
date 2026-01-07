import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { Position } from "@prisma/client";
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
      teamId, countryId, formIndex
    } = body;

    if (!firstName || !lastName || !teamId || !countryId || !mainPosition) {
      return NextResponse.json({ error: "Недостаточно данных" }, { status: 400 });
    }

    const calculatedPrice = getPriceFromPlayerObject(body);

    const newPlayer = await prisma.player.create({
      data: {
        firstName,
        lastName,
        age: Number(age),
        mainPosition: mainPosition as Position,
        sidePosition: (sidePosition as Position) || null,
        power: Number(power),
        price: calculatedPrice, 
        fatigue: 0,
        fitness: 100,
        currentForm: 100,
        formIndex: Number(formIndex) || 0,

        team: { connect: { id: teamId } },
        country: { connect: { id: countryId } },
        
        // Маппинг специализаций под твою схему
        specSpeed: Number(body.specSpd) || 0,
        specHeading: Number(body.specHeading) || 0,
        specLongPass: Number(body.specLong) || 0,
        specShortPass: Number(body.specShortPass) || 0,
        specDribbling: Number(body.specKt) || 0,
        specCombination: Number(body.specCombination) || 0,
        specTackling: Number(body.specTackling) || 0,
        specMarking: Number(body.specMarking) || 0,
        specShooting: Number(body.specZv) || 0,
        specFreeKicks: Number(body.specSt) || 0,
        specCorners: Number(body.specCorners) || 0,
        specPenalty: Number(body.specPenalty) || 0,
        specCaptain: Number(body.specL) || 0,
        specLeader: Number(body.specKi) || 0,
        specAthleticism: Number(body.specPhys) || 0,
        specSimulation: Number(body.specSimulation) || 0,
        specGkReflexes: Number(body.specGkRea) || 0,
        specGkOut: Number(body.specGkPos) || 0,
      },
    });

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