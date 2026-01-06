import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const countryId = params.id;

    if (!countryId) {
      return NextResponse.json({ error: "Некорректный ID страны" }, { status: 400 });
    }

    const teams = await prisma.team.findMany({
      where: {
        countryId: countryId,
      },
      include: {
        manager: {
          select: {
            id: true,
            login: true,
            name: true,
          }
        },
        league: {
          select: {
            name: true,
            level: true
          }
        }
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Исправление ошибки BigInt (превращаем числа в строки)
    const serializedTeams = teams.map((team) => ({
      ...team,
      finances: team.finances.toString(),
    }));

    return NextResponse.json(serializedTeams);

  } catch (error: any) {
    console.error("🔥 SERVER ERROR:", error);
    return NextResponse.json(
      { error: "Ошибка сервера", details: error.message }, 
      { status: 500 }
    );
  }
}