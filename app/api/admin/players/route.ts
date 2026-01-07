import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getPriceFromPlayerObject } from "@/lib/economy";
import { createPlayerSchema } from "@/src/lib/validation";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const body = await req.json();

    const result = createPlayerSchema.safeParse(body);
    if (!result.success) {
      // ИСПРАВЛЕНО: .issues вместо .errors
      return NextResponse.json(
        { error: result.error.issues[0].message }, 
        { status: 400 }
      );
    }

    const data = result.data;
    const calculatedPrice = getPriceFromPlayerObject(data);

    const newPlayer = await prisma.player.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        mainPosition: data.mainPosition,
        sidePosition: data.sidePosition || null,
        power: data.power,
        price: BigInt(calculatedPrice),
        
        // ВАЖНО: Используем простые ID вместо connect для UncheckedCreateInput
        teamId: data.teamId,
        countryId: data.countryId,
        
        formIndex: data.formIndex,
        
        specSpeed: data.specSpd,
        specHeading: data.specHeading,
        specLongPass: data.specLong,
        specShortPass: data.specShortPass,
        specDribbling: data.specKt,
        specCombination: data.specCombination,
        specTackling: data.specTackling,
        specMarking: data.specMarking,
        specShooting: data.specZv,
        specFreeKicks: data.specSt,
        specCorners: data.specCorners,
        specPenalty: data.specPenalty,
        specCaptain: data.specL,
        specLeader: data.specKi,
        specAthleticism: data.specPhys,
        specSimulation: data.specSimulation,
        specGkReflexes: data.specGkRea,
        specGkOut: data.specGkPos,
      },
    });

    const serializedPlayer = JSON.parse(
      JSON.stringify(newPlayer, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );

    return NextResponse.json(serializedPlayer, { status: 201 });

  } catch (error: any) {
    console.error("PLAYER_CREATE_ERROR:", error);
    return NextResponse.json(
      { error: "Ошибка при сохранении", details: error.message }, 
      { status: 500 }
    );
  }
}