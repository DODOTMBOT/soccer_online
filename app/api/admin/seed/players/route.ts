// app/api/admin/seed/players/route.ts
import { prisma } from "@/src/server/db";
import { NextResponse } from "next/server";
import { calculateRealPrice } from "@/src/shared/utils/economy"; // Убедись, что путь верный
import { Position, VflStyle } from "@prisma/client";

// Вспомогательная функция (рандом в диапазоне)
const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export async function POST(req: Request) {
  try {
    const { leagueId, targetCount = 20, minPower = 55, maxPower = 75 } = await req.json();

    // 1. Находим все команды этой лиги
    const teams = await prisma.team.findMany({
      where: { leagueId },
      include: { _count: { select: { players: true } } }
    });

    let totalCreated = 0;

    // 2. Бежим по каждой команде
    for (const team of teams) {
      const currentCount = team._count.players;
      const needToCreate = targetCount - currentCount;

      if (needToCreate <= 0) continue; // Команда уже полная

      const newPlayersData = [];

      for (let i = 0; i < needToCreate; i++) {
        // Генерируем случайную позицию и возраст
        const posKey = Object.keys(Position)[random(0, 16)] as Position; 
        const age = random(18, 32);
        const power = random(minPower, maxPower);
        
        // Скрытые параметры (самое важное!)
        const potential = random(power + 5, 95); // Потенциал чуть выше текущей силы
        const injury = random(1, 20); // Травматичность

        // Расчет цены (твоя существующая формула)
        const price = calculateRealPrice({
          age,
          power,
          hasSidePosition: false,
          totalSpecLevels: 0 // Пока без спецух для простоты
        });

        newPlayersData.push({
          firstName: `Bot`,
          lastName: `Player ${random(1000, 9999)}`,
          age,
          mainPosition: posKey,
          power,
          potential,     // Скрытое
          injuryProne: injury, // Скрытое
          price: BigInt(price),
          teamId: team.id,
          countryId: team.countryId,
          fitness: 100,
          formIndex: random(0, 10),
        });
      }

      // Массовая вставка в БД
      await prisma.player.createMany({ data: newPlayersData });
      totalCreated += newPlayersData.length;
    }

    return NextResponse.json({ success: true, message: `Создано ${totalCreated} игроков для ${teams.length} команд` });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}