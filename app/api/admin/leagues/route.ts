import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const leagues = await prisma.league.findMany({
      include: { country: true },
      orderBy: { level: 'asc' }
    });
    return NextResponse.json(leagues);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка получения лиг" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }
    const body = await req.json();
    const { name, level, teamsCount, countryId, nextLeagueId } = body;
    if (!name || !level || !teamsCount || !countryId) {
      return NextResponse.json({ error: "Заполните обязательные поля" }, { status: 400 });
    }
    const newLeague = await prisma.league.create({
      data: {
        name,
        level: Number(level),
        teamsCount: Number(teamsCount),
        countryId,
        nextLeagueId: nextLeagueId || null,
      },
    });
    return NextResponse.json(newLeague, { status: 201 });
  } catch (error: any) {
    console.error("LEAGUE_CREATE_ERROR:", error);
    return NextResponse.json({ error: "Ошибка при создании лиги" }, { status: 500 });
  }
}