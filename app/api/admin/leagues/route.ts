import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// --- ПОЛУЧЕНИЕ ВСЕХ ЛИГ ---
export async function GET() {
  try {
    const leagues = await prisma.league.findMany({
      include: { 
        country: true,
        season: true // Добавили инфо о сезоне
      },
      orderBy: [
        { country: { name: 'asc' } },
        { level: 'asc' }
      ]
    });
    return NextResponse.json(leagues);
  } catch (error) {
    console.error("LEAGUE_GET_ERROR:", error);
    return NextResponse.json({ error: "Ошибка получения лиг" }, { status: 500 });
  }
}

// --- СОЗДАНИЕ НОВОЙ ЛИГИ ---
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const body = await req.json();
    // Добавили seasonId, который приходит с новой страницы создания
    const { name, level, teamsCount, countryId, seasonId, nextLeagueId } = body;

    if (!name || !level || !teamsCount || !countryId || !seasonId) {
      return NextResponse.json({ error: "Заполните все обязательные поля, включая сезон" }, { status: 400 });
    }

    const newLeague = await prisma.league.create({
      data: {
        name,
        level: Number(level),
        teamsCount: Number(teamsCount),
        countryId,
        seasonId, // ПРИВЯЗКА К СЕЗОНУ
        nextLeagueId: nextLeagueId || null,
      },
    });

    return NextResponse.json(newLeague, { status: 201 });
  } catch (error: any) {
    console.error("LEAGUE_CREATE_ERROR:", error);
    // Обработка случая, если такая иерархия уже есть
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Конфликт уникальности (проверьте ID или связи)" }, { status: 400 });
    }
    return NextResponse.json({ error: "Ошибка при создании лиги" }, { status: 500 });
  }
}