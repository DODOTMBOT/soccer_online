import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { playMatch } from "@/lib/soccer-engine";
import { revalidatePath } from "next/cache";

// ГЕНЕРАЦИЯ МАТЧА (POST)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Загружаем данные матча
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
        setups: {
          include: {
            lineupSlots: {
              include: { player: true }
            }
          }
        }
      }
    });

    if (!match) {
      return NextResponse.json({ error: "Матч не найден" }, { status: 404 });
    }

    if (match.status === "FINISHED") {
      return NextResponse.json({ error: "Матч уже завершен" }, { status: 400 });
    }

    // 2. Поиск составов
    const homeSetup = match.setups.find(s => s.teamId === match.homeTeamId);
    const awaySetup = match.setups.find(s => s.teamId === match.awayTeamId);

    if (!homeSetup || !awaySetup) {
      return NextResponse.json(
        { error: "Обе команды должны отправить составы перед генерацией" },
        { status: 400 }
      );
    }

    // 3. Формируем данные для движка
    // ИСПРАВЛЕНИЕ: Склеиваем lastName и firstName в поле name
    const engineHome = {
      teamId: match.homeTeamId,
      isHome: true,
      tactic: homeSetup.tactic,
      defenseSetup: homeSetup.defenseSetup,
      players: homeSetup.lineupSlots.map(slot => ({
        ...slot.player,
        // Формируем имя для логов: "Фамилия Имя"
        name: `${slot.player.lastName} ${slot.player.firstName}`,
        assignedPosition: slot.assignedPosition
      }))
    };

    const engineAway = {
      teamId: match.awayTeamId,
      isHome: false,
      tactic: awaySetup.tactic,
      defenseSetup: awaySetup.defenseSetup,
      players: awaySetup.lineupSlots.map(slot => ({
        ...slot.player,
        // Формируем имя для логов: "Фамилия Имя"
        name: `${slot.player.lastName} ${slot.player.firstName}`,
        assignedPosition: slot.assignedPosition
      }))
    };

    // 4. Запуск генератора
    const result = playMatch(engineHome as any, engineAway as any);

    // 5. Сохранение результата (чистим undefined через JSON)
    const reportData = JSON.parse(JSON.stringify(result));

    await prisma.match.update({
      where: { id },
      data: {
        homeScore: result.homeScore,
        awayScore: result.awayScore,
        status: "FINISHED",
        report: reportData 
      }
    });

    // 6. Обновление кэша
    revalidatePath(`/admin/matches/${id}`);
    revalidatePath(`/admin/teams/${match.homeTeamId}`);
    revalidatePath(`/admin/teams/${match.awayTeamId}`);

    return NextResponse.json({ success: true, result: reportData });

  } catch (error) {
    console.error("SIMULATION_ERROR:", error);
    return NextResponse.json(
      { error: "Ошибка при симуляции", details: error instanceof Error ? error.message : "Unknown error" }, 
      { status: 500 }
    );
  }
}

// СБРОС РЕЗУЛЬТАТА (DELETE)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const match = await prisma.match.findUnique({
      where: { id },
      select: { homeTeamId: true, awayTeamId: true }
    });

    if (!match) {
      return NextResponse.json({ error: "Матч не найден" }, { status: 404 });
    }

    await prisma.match.update({
      where: { id },
      data: {
        homeScore: null,
        awayScore: null,
        status: "UPCOMING",
        report: Prisma.DbNull 
      }
    });

    revalidatePath(`/admin/matches/${id}`);
    revalidatePath(`/admin/teams/${match.homeTeamId}`);
    revalidatePath(`/admin/teams/${match.awayTeamId}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("RESET_ERROR:", error);
    return NextResponse.json({ error: "Ошибка при сбросе результата" }, { status: 500 });
  }
}