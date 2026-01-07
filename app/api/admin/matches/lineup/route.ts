import { prisma } from "@/src/server/db"; // Обновили путь к DB
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { FORMATION_CONFIG } from "@/src/server/domain/rules/formations"; // Обновили путь к правилам
import { MatchLineupSchema } from "@/src/server/dto/match.dto"; // ИМПОРТИРУЕМ НОВУЮ СХЕМУ
import { Position, Formation } from "@prisma/client";

// Хелпер для определения позиции
function getAssignedPosition(index: number, formation: Formation): Position {
  const config = FORMATION_CONFIG[formation];
  if (config && config[index]) return config[index].main;
  return Position.CM;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. ВАЛИДАЦИЯ (Используем MatchLineupSchema с большой буквы)
    const result = MatchLineupSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { 
      matchId, teamId, playerIds, subIds, 
      tactic, defenseSetup, formation, mentality, spirit 
    } = result.data;

    // 2. ПОДГОТОВКА ДАННЫХ
    // Явно указываем типы (id: string, index: number) чтобы TS не ругался
    const allSlotsData = [
      // Основа (0-10)
      ...playerIds.map((id: string, index: number) => ({
        playerId: id,
        slotIndex: index,
        assignedPosition: getAssignedPosition(index, formation)
      })),
      // Запас (11+)
      ...subIds.map((id: string, index: number) => ({
        playerId: id,
        slotIndex: index + 11,
        assignedPosition: Position.CM 
      }))
    ];

    // 3. ТРАНЗАКЦИЯ СОХРАНЕНИЯ
    await prisma.$transaction(async (tx) => {
      // Ищем, есть ли уже отправленный состав
      const existing = await tx.matchTeamSetup.findUnique({
        where: { matchId_teamId: { matchId, teamId } }
      });

      const tacticalData = {
        tactic, defenseSetup, formation, mentality, spirit, isSubmitted: true
      };

      if (existing) {
        // Очищаем старые слоты
        await tx.matchLineupSlot.deleteMany({ where: { matchTeamSetupId: existing.id } });
        // Обновляем тактику
        await tx.matchTeamSetup.update({
          where: { id: existing.id },
          data: tacticalData
        });
        // Пишем новые слоты
        await tx.matchLineupSlot.createMany({
          data: allSlotsData.map(s => ({ ...s, matchTeamSetupId: existing.id }))
        });
      } else {
        // Создаем все с нуля
        await tx.matchTeamSetup.create({
          data: {
            matchId, teamId, ...tacticalData,
            lineupSlots: { create: allSlotsData }
          }
        });
      }
    });

    revalidatePath(`/admin/teams/${teamId}`);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("LINEUP_ERROR:", error);
    return NextResponse.json({ error: "Ошибка сохранения состава" }, { status: 500 });
  }
}