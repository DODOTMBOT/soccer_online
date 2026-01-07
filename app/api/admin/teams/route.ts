import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { createTeamSchema } from "@/src/lib/validation";

function serializeBigInt(data: any) {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        league: { select: { name: true } },
        country: { select: { name: true, flag: true } },
        manager: { select: { login: true, name: true } },
        _count: { select: { players: true } }
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(serializeBigInt(teams || []));
  } catch (error: any) {
    return NextResponse.json({ error: "Ошибка БД" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const body = await req.json();

    const result = createTeamSchema.safeParse(body);
    if (!result.success) {
      // ИСПРАВЛЕНО: .issues вместо .errors
      return NextResponse.json(
        { error: result.error.issues[0].message }, 
        { status: 400 }
      );
    }

    const data = result.data;

    // ИСПРАВЛЕНО: Используем countryId и leagueId напрямую (Unchecked Create)
    // Это решает конфликт типов connect vs undefined
    const newTeam = await prisma.team.create({
      data: {
        name: data.name,
        logo: data.logo || null,
        stadium: data.stadium,
        capacity: data.capacity,
        finances: BigInt(data.finances), 
        baseLevel: data.baseLevel,
        managerId: data.managerId || null,
        countryId: data.countryId,  // Прямое присвоение
        leagueId: data.leagueId     // Прямое присвоение
      },
    });

    return NextResponse.json(serializeBigInt(newTeam), { status: 201 });

  } catch (error: any) {
    console.error("TEAM_CREATE_ERROR:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Клуб с таким названием уже существует" }, { status: 400 });
    }
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}