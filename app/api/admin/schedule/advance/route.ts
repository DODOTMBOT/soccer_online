// app/api/admin/schedule/advance/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/auth";
import { prisma } from "@/src/server/db";
import { MatchService } from "@/src/server/services/match.service";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    // 1. Ищем текущий активный день
    // (Предполагаем, что всегда есть только один isCurrent=true день в базе для простоты,
    // или фильтруем по активному сезону)
    const activeSeason = await prisma.season.findFirst({ where: { status: "ACTIVE" } });
    if (!activeSeason) return NextResponse.json({ error: "Нет активного сезона" }, { status: 400 });

    const currentDay = await prisma.gameDay.findFirst({
      where: { seasonId: activeSeason.id, isCurrent: true },
      include: { 
        timeSlots: { 
          include: { matches: { where: { status: "UPCOMING" } } },
          orderBy: { order: 'asc' }
        } 
      }
    });

    // Если нет текущего дня - возможно, сезон только начат. Ищем День 1.
    if (!currentDay) {
      const firstDay = await prisma.gameDay.findFirst({
        where: { seasonId: activeSeason.id, number: 1 }
      });
      if (firstDay) {
        await prisma.gameDay.update({ where: { id: firstDay.id }, data: { isCurrent: true } });
        return NextResponse.json({ message: "Сезон стартовал. День 1 активен." });
      }
      return NextResponse.json({ error: "Календарь не сгенерирован" }, { status: 400 });
    }

    // 2. Логика обработки текущего дня
    // Проверяем, есть ли несыгранные матчи в слотах этого дня
    let matchesToPlay: string[] = [];
    
    // Собираем ID всех матчей всех слотов этого дня
    currentDay.timeSlots.forEach(slot => {
      slot.matches.forEach(m => matchesToPlay.push(m.id));
    });

    if (matchesToPlay.length > 0) {
      console.log(`[ADVANCE] Playing ${matchesToPlay.length} matches for Day ${currentDay.number}`);
      // Запускаем симуляцию
      await Promise.all(matchesToPlay.map(id => MatchService.simulateMatch(id)));
    }

    // 3. Переход к следующему дню
    const nextDay = await prisma.gameDay.findFirst({
      where: { seasonId: activeSeason.id, number: currentDay.number + 1 }
    });

    if (!nextDay) {
      return NextResponse.json({ message: "Сезон завершен! Больше дней нет." });
    }

    // Транзакция переключения дня
    await prisma.$transaction([
      prisma.gameDay.update({ 
        where: { id: currentDay.id }, 
        data: { isCurrent: false, isFinished: true } 
      }),
      prisma.gameDay.update({ 
        where: { id: nextDay.id }, 
        data: { isCurrent: true } 
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      prevDay: currentDay.number,
      nextDay: nextDay.number,
      playedMatches: matchesToPlay.length
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}