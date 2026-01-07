import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { MatchService } from "@/src/services/match-service";

export async function POST(req: Request) {
  try {
    const { seasonId, batchSize = 20 } = await req.json();

    if (!seasonId) return NextResponse.json({ error: "Выберите сезон" }, { status: 400 });

    // 1. Ищем ID несыгранных матчей (LIMIT batchSize)
    const matches = await prisma.match.findMany({
      where: {
        seasonId,
        status: "UPCOMING"
      },
      take: batchSize,
      select: { id: true }
    });

    const remainingCount = await prisma.match.count({
      where: { seasonId, status: "UPCOMING" }
    });

    if (matches.length === 0) {
      return NextResponse.json({ 
        done: true, 
        message: "Все матчи сыграны", 
        remaining: 0 
      });
    }

    // 2. Симуляция через Service
    // Обрабатываем последовательно или параллельно. Для 20-50 матчей параллельно - ОК.
    const results = await Promise.all(
      matches.map(m => MatchService.simulateMatch(m.id))
    );

    return NextResponse.json({ 
      done: false, 
      processed: results.length, 
      remaining: remainingCount - results.length 
    });

  } catch (error: any) {
    console.error("SEASON_SIM_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}