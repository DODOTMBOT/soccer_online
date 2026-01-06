import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { seasonId } = await req.json();

    // 1. Получаем лиги сезона
    const leagues = await prisma.league.findMany({
      where: { seasonId },
      include: { 
        country: true,
        teams: true 
      }
    });

    if (leagues.length === 0) {
      return NextResponse.json({ error: "Сначала выполните Шаг 1 (Создать лиги)" }, { status: 400 });
    }

    let createdCount = 0;

    // 2. Для каждой лиги добиваем количество команд до 16
    for (const league of leagues) {
      const currentCount = league.teams.length;
      const needToCreate = 16 - currentCount;

      if (needToCreate > 0) {
        // Массив промисов для создания команд
        const promises = Array.from({ length: needToCreate }).map((_, i) => {
          const num = currentCount + i + 1;
          return prisma.team.create({
            data: {
              name: `${league.name} Team ${num}`, // Например: Premier League Team 1
              stadium: `Arena ${num}`,
              countryId: league.countryId,
              leagueId: league.id,
              power: Math.floor(Math.random() * 50) + 50, // Рандомная сила 50-100
              finances: 10000000
            }
          });
        });

        await Promise.all(promises);
        createdCount += needToCreate;
      }
    }

    return NextResponse.json({ success: true, message: `Создано новых команд: ${createdCount}` });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}