import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: leagueId } = await params;

    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        country: {
          include: {
            leagues: { orderBy: { level: 'asc' }, select: { id: true, name: true, level: true } }
          }
        },
        season: true,
        // СОРТИРОВКА: сначала Очки, потом Разница мячей, 
        // а если всё по нулям — по силе состава (power)
        teams: {
          orderBy: [
            { points: 'desc' },
            { goalsDiff: 'desc' },
            { goalsScored: 'desc' },
            { power: 'desc' } // Добавь это поле в схему, если его нет
          ]
        },
        matches: {
          where: { round: 1 },
          include: { homeTeam: true, awayTeam: true }
        }
      }
    });

    if (!league) return NextResponse.json({ error: "Лига не найдена" }, { status: 404 });

    const serialize = (obj: any) => JSON.parse(JSON.stringify(obj, (k, v) => 
      typeof v === 'bigint' ? v.toString() : v
    ));

    return NextResponse.json(serialize(league));
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}