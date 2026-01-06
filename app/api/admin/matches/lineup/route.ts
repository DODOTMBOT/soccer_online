import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { 
  DefenseSetup, 
  Position, 
  Philosophy, 
  Formation, 
  Mentality, 
  TeamSpirit 
} from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Определение позиции игрока на основе индекса слота и выбранной схемы.
 * Используется для записи в поле assignedPosition модели MatchLineupSlot.
 */
function getAssignedPosition(index: number, formation: Formation): Position {
  if (index === 0) return Position.GK;

  const maps: Record<Formation, Record<number, Position>> = {
    F442: {
      1: Position.LB, 2: Position.CB, 3: Position.CB, 4: Position.RB,
      5: Position.LM, 6: Position.CM, 7: Position.CM, 8: Position.RM,
      9: Position.ST, 10: Position.ST
    },
    F433: {
      1: Position.LB, 2: Position.CB, 3: Position.CB, 4: Position.RB,
      5: Position.CM, 6: Position.DM, 7: Position.CM, 
      8: Position.RW, 9: Position.LW, 10: Position.ST
    },
    F424: { 1: Position.LB, 2: Position.CB, 3: Position.CB, 4: Position.RB, 5: Position.CM, 6: Position.CM, 7: Position.RW, 8: Position.CF, 9: Position.CF, 10: Position.LW },
    F532: { 1: Position.LB, 2: Position.CB, 3: Position.SW, 4: Position.CB, 5: Position.RB, 6: Position.CM, 7: Position.CM, 8: Position.CM, 9: Position.CF, 10: Position.CF },
    F523: { 1: Position.LB, 2: Position.CB, 3: Position.SW, 4: Position.CB, 5: Position.RB, 6: Position.CM, 7: Position.CM, 8: Position.RW, 9: Position.ST, 10: Position.LW },
    F352: { 1: Position.CB, 2: Position.CB, 3: Position.CB, 4: Position.LM, 5: Position.CM, 6: Position.DM, 7: Position.CM, 8: Position.RM, 9: Position.CF, 10: Position.CF },
  };

  return maps[formation]?.[index] || Position.CM;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      matchId, 
      teamId, 
      playerIds, 
      subIds, 
      tactic, 
      defenseSetup, 
      formation, 
      mentality, 
      spirit 
    } = body;

    // 1. Валидация количества игроков
    if (!playerIds || playerIds.length !== 11) {
      return NextResponse.json({ error: "Нужно выбрать 11 игроков" }, { status: 400 });
    }

    // 2. Поиск тактики в справочнике
    const tacticRecord = await prisma.tactic.findUnique({
      where: { philosophy: tactic as Philosophy }
    });

    if (!tacticRecord) {
      return NextResponse.json({ 
        error: "Тактика не найдена в справочнике. Проверьте таблицу Tactic." 
      }, { status: 400 });
    }

    const selectedFormation = (formation as Formation) || Formation.F442;

    // 3. Подготовка данных для слотов состава
    const allSlotsData = [
      ...playerIds.map((id: string, index: number) => ({
        playerId: id,
        slotIndex: index,
        assignedPosition: getAssignedPosition(index, selectedFormation)
      })),
      ...(subIds || []).map((id: string, index: number) => ({
        playerId: id,
        slotIndex: index + 11,
        assignedPosition: Position.CM 
      }))
    ].filter(slot => slot.playerId);

    // 4. Выполнение транзакции сохранения
    await prisma.$transaction(async (tx) => {
      const existingSetup = await tx.matchTeamSetup.findUnique({
        where: { matchId_teamId: { matchId, teamId } }
      });

      /**
       * Основные тактические данные. 
       * Мы используем tacticRef для связи, поэтому tacticId исключаем из объекта, 
       * чтобы избежать конфликта типов в Prisma.
       */
      const tacticalData = {
        tactic: tactic as Philosophy,
        defenseSetup: (defenseSetup as DefenseSetup) || DefenseSetup.ZONAL,
        formation: selectedFormation,
        mentality: (mentality as Mentality) || Mentality.BALANCED,
        spirit: (spirit as TeamSpirit) || TeamSpirit.NORMAL,
        isSubmitted: true,
        submittedAt: new Date(),
        tacticRef: { connect: { id: tacticRecord.id } }, 
        lineupSlots: {
          create: allSlotsData
        }
      };

      if (existingSetup) {
        // Удаляем старые слоты перед записью новых
        await tx.matchLineupSlot.deleteMany({
          where: { matchTeamSetupId: existingSetup.id }
        });

        // Обновляем существующую настройку
        await tx.matchTeamSetup.update({
          where: { id: existingSetup.id },
          data: tacticalData
        });
      } else {
        // Создаем новую настройку с привязкой к матчу и команде
        await tx.matchTeamSetup.create({
          data: {
            ...tacticalData,
            match: { connect: { id: matchId } },
            team: { connect: { id: teamId } }
          }
        });
      }
    });

    revalidatePath(`/admin/teams/${teamId}`);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("LINEUP_SAVE_ERROR:", error);
    return NextResponse.json({ 
      error: "Ошибка сервера", 
      details: error.message 
    }, { status: 500 });
  }
}