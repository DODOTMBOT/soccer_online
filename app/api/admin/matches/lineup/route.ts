import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { 
  DefenseType, 
  Position, 
  VflStyle, 
  Formation, 
  Mentality, 
  TeamSpirit 
} from "@prisma/client";
import { revalidatePath } from "next/cache";
// Импортируем наш единый справочник схем
import { FORMATION_CONFIG } from "@/lib/rules/formations";

/**
 * Определение позиции игрока на основе индекса слота и выбранной схемы.
 * Теперь берет данные из центрального конфига lib/rules/formations.ts
 */
function getAssignedPosition(index: number, formation: Formation): Position {
  const formationConfig = FORMATION_CONFIG[formation];

  // Если конфиг для схемы найден и слот существует (индексы 0-10)
  if (formationConfig && formationConfig[index]) {
    return formationConfig[index].main;
  }

  // Для запасных (индексы 11+) или если что-то пошло не так — возвращаем нейтральную позицию
  return Position.CM;
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

    // 1. Валидация количества игроков основы
    if (!playerIds || playerIds.length !== 11) {
      return NextResponse.json({ error: "Нужно выбрать 11 игроков" }, { status: 400 });
    }

    // Приводим к Enum или берем дефолты
    const selectedFormation = (formation as Formation) || Formation.F442;
    const selectedTactic = (tactic as VflStyle) || VflStyle.NORMAL;
    const selectedDefense = (defenseSetup as DefenseType) || DefenseType.ZONAL;
    const selectedMentality = (mentality as Mentality) || Mentality.NORMAL;
    const selectedSpirit = (spirit as TeamSpirit) || TeamSpirit.NORMAL;

    // 2. Подготовка данных для слотов состава
    const allSlotsData = [
      // Основной состав (индексы 0-10)
      ...playerIds.map((id: string, index: number) => ({
        playerId: id,
        slotIndex: index,
        // Динамически определяем позицию из конфига
        assignedPosition: getAssignedPosition(index, selectedFormation)
      })),
      // Запасные (индексы 11+)
      ...(subIds || []).map((id: string, index: number) => ({
        playerId: id,
        slotIndex: index + 11,
        // Запасным ставим дефолтную позицию, она не влияет на расчет матча пока игрок не выйдет
        assignedPosition: Position.CM 
      }))
    ].filter(slot => slot.playerId);

    // 3. Выполнение транзакции сохранения
    await prisma.$transaction(async (tx) => {
      // Ищем существующую настройку для этого матча и команды
      const existingSetup = await tx.matchTeamSetup.findUnique({
        where: { matchId_teamId: { matchId, teamId } }
      });

      const tacticalData = {
        tactic: selectedTactic,
        defenseSetup: selectedDefense,
        formation: selectedFormation,
        mentality: selectedMentality,
        spirit: selectedSpirit,
        isSubmitted: true,
        submittedAt: new Date(),
        // Пересоздаем слоты
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
      error: "Ошибка сервера при сохранении состава", 
      details: error.message 
    }, { status: 500 });
  }
}